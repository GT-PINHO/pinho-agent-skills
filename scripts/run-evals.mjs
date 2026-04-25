#!/usr/bin/env node
// Eval runner for pinho-skills.
//
// Modes:
//   static (default) — no API calls. Verifies that each example file is well-formed
//                      AND that its expected output covers the SKILL.md "Output format"
//                      section labels. Cheap, CI-safe, deterministic.
//   live             — calls the Anthropic API with SKILL.md as system + Input as user.
//                      Grades the actual model output against the expected structure.
//   judge            — same as live, plus an LLM-as-judge step that scores semantic
//                      match between the model's output and the expected output.
//
// Usage:
//   node scripts/run-evals.mjs                   # static, all skills
//   node scripts/run-evals.mjs --skill <name>    # filter to one skill
//   node scripts/run-evals.mjs --mode live       # API call, structural grade
//   node scripts/run-evals.mjs --mode judge      # API + semantic LLM judge
//   node scripts/run-evals.mjs --model haiku     # set worker model (live/judge)
//
// Env:
//   ANTHROPIC_API_KEY  required for --mode live or --mode judge
//
// Exit codes: 0 = all green, 1 = at least one failure, 2 = runner error.

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, dirname, basename, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { argv, env, exit } from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SKILLS_DIR = join(ROOT, "skills");

const MODELS = {
  haiku:  "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-6",
  opus:   "claude-opus-4-7",
};

// --- CLI args ---------------------------------------------------------------

function parseArgs() {
  const out = { mode: "static", skill: null, model: "sonnet", maxCases: Infinity };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--mode") out.mode = argv[++i];
    else if (a === "--skill") out.skill = argv[++i];
    else if (a === "--model") out.model = argv[++i];
    else if (a === "--max-cases") out.maxCases = Number(argv[++i]);
    else if (a === "-h" || a === "--help") out.help = true;
  }
  return out;
}

function help() {
  console.log(`run-evals — grade pinho-skills examples.

  --mode static|live|judge   default: static
  --skill <name>             filter to one skill folder under skills/
  --model haiku|sonnet|opus  default: sonnet (live/judge only)
  --max-cases N              cap cases per skill

  ANTHROPIC_API_KEY required for --mode live and --mode judge.
`);
}

// --- File discovery ---------------------------------------------------------

async function listSkills() {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const skillMd = join(SKILLS_DIR, e.name, "SKILL.md");
    try {
      await stat(skillMd);
      out.push({ name: e.name, dir: join(SKILLS_DIR, e.name), skillMd });
    } catch {}
  }
  return out;
}

async function listExamples(skillDir) {
  const examplesDir = join(skillDir, "examples");
  try {
    const s = await stat(examplesDir);
    if (!s.isDirectory()) return [];
  } catch {
    return [];
  }
  const files = (await readdir(examplesDir))
    .filter((f) => f.endsWith(".md"))
    .sort();
  return files.map((f) => join(examplesDir, f));
}

// --- Parsing ----------------------------------------------------------------

function parseExample(text) {
  const inputMatch = text.split(/^##\s+Input\b[^\n]*\n/m);
  if (inputMatch.length < 2) return null;
  const afterInput = inputMatch.slice(1).join("## Input\n");
  const split = afterInput.split(/^##\s+Expected output\b[^\n]*\n/im);
  if (split.length < 2) return null;
  const input = split[0].trim();
  const expected = split.slice(1).join("## Expected output\n").trim();
  return { input, expected };
}

function extractOutputFormatLabels(skillBody) {
  // Pull lines from the "Output format" section that look like bold labels:
  //   **Diagnosis**, **1) Diagnosis**, **Mode**, **Plan (bounded)**
  const lines = skillBody.split(/\r?\n/);
  let inOutput = false;
  const labels = new Set();
  for (const line of lines) {
    const h = line.match(/^#{2,6}\s+(.+?)\s*$/);
    if (h) {
      inOutput = /output\s+format/i.test(h[1]);
      continue;
    }
    if (!inOutput) continue;
    // Accept **Label** or **n) Label** at the start of a line.
    const m = line.match(/^\s*\*\*([^*]+)\*\*\s*$/);
    if (m) {
      const label = m[1].replace(/^\d+\)\s*/, "").trim();
      if (label) labels.add(label);
    }
  }
  return [...labels];
}

function parseFrontMatter(text) {
  if (!text.startsWith("---")) return { fields: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { fields: {}, body: text };
  return { fields: {}, body: text.slice(end + 4).replace(/^\r?\n/, "") };
}

// --- Static grade -----------------------------------------------------------

function gradeStatic({ skillName, file, expected, labels }) {
  if (labels.length === 0) {
    return { pass: true, reason: "no Output format labels declared in SKILL.md (skipped structural check)" };
  }
  const missing = labels.filter((l) => !expected.toLowerCase().includes(l.toLowerCase()));
  if (missing.length === 0) {
    return { pass: true, reason: `all ${labels.length} Output format label(s) present` };
  }
  return { pass: false, reason: `missing labels in expected output: ${missing.join(", ")}` };
}

// --- Live + judge grades ----------------------------------------------------

async function getAnthropic() {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("error: ANTHROPIC_API_KEY required for --mode live or --mode judge");
    exit(2);
  }
  let mod;
  try {
    mod = await import("@anthropic-ai/sdk");
  } catch {
    console.error("error: @anthropic-ai/sdk not installed. Run: npm i @anthropic-ai/sdk");
    exit(2);
  }
  const Anthropic = mod.default;
  return new Anthropic({ apiKey });
}

async function callModel(client, modelId, system, userText) {
  const resp = await client.messages.create({
    model: modelId,
    max_tokens: 1500,
    system,
    messages: [{ role: "user", content: userText }],
  });
  return resp.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

function gradeLive({ output, labels }) {
  if (labels.length === 0) {
    return { pass: true, reason: "no Output format labels declared (skipped structural check)" };
  }
  const missing = labels.filter((l) => !output.toLowerCase().includes(l.toLowerCase()));
  if (missing.length === 0) {
    return { pass: true, reason: `all ${labels.length} label(s) present` };
  }
  return { pass: false, reason: `missing labels in model output: ${missing.join(", ")}` };
}

async function gradeJudge({ client, modelId, input, expected, output, skillName }) {
  const system =
    "You are an evaluation judge. You receive a skill name, a user input, an expected output, and a model output. " +
    "You must decide whether the model output satisfies the same operational intent as the expected output. " +
    "You are strict about: (1) refusal when required inputs are missing, (2) presence of structured sections, " +
    "(3) avoiding fabricated facts. Reply ONLY with a single line `PASS: <reason>` or `FAIL: <reason>`. Keep the reason under 20 words.";
  const user = [
    `Skill: ${skillName}`,
    `--- USER INPUT ---`,
    input,
    `--- EXPECTED OUTPUT ---`,
    expected,
    `--- MODEL OUTPUT ---`,
    output,
    `--- VERDICT ---`,
  ].join("\n");
  const verdict = (await callModel(client, modelId, system, user)).trim();
  if (/^PASS\b/i.test(verdict)) return { pass: true, reason: verdict.replace(/^PASS:\s*/i, "judge: ") };
  return { pass: false, reason: verdict.replace(/^FAIL:\s*/i, "judge: ") };
}

// --- Main -------------------------------------------------------------------

async function main() {
  const args = parseArgs();
  if (args.help) return help();

  if (!["static", "live", "judge"].includes(args.mode)) {
    console.error(`error: unknown --mode '${args.mode}'. Use static | live | judge.`);
    exit(2);
  }
  const modelId = MODELS[args.model];
  if (args.mode !== "static" && !modelId) {
    console.error(`error: unknown --model '${args.model}'. Use haiku | sonnet | opus.`);
    exit(2);
  }

  const skills = (await listSkills()).filter((s) => !args.skill || s.name === args.skill);
  if (skills.length === 0) {
    console.error("error: no skills matched.");
    exit(2);
  }

  const client = args.mode === "static" ? null : await getAnthropic();

  const results = [];
  for (const skill of skills) {
    const skillText = await readFile(skill.skillMd, "utf8");
    const { body } = parseFrontMatter(skillText);
    const labels = extractOutputFormatLabels(body);

    const examples = (await listExamples(skill.dir)).slice(0, args.maxCases);
    if (examples.length === 0) {
      results.push({ skill: skill.name, file: "(no examples)", pass: false, reason: "skill has no examples/" });
      continue;
    }

    for (const file of examples) {
      const text = await readFile(file, "utf8");
      const parsed = parseExample(text);
      const fileRel = relative(ROOT, file).split(sep).join("/");

      if (!parsed) {
        results.push({ skill: skill.name, file: fileRel, pass: false, reason: "could not parse Input / Expected output" });
        continue;
      }

      if (args.mode === "static") {
        const r = gradeStatic({ skillName: skill.name, file, expected: parsed.expected, labels });
        results.push({ skill: skill.name, file: fileRel, ...r });
        continue;
      }

      try {
        const output = await callModel(client, modelId, skillText, parsed.input);
        const liveResult = gradeLive({ output, labels });
        if (args.mode === "live") {
          results.push({ skill: skill.name, file: fileRel, ...liveResult, modelOutputChars: output.length });
          continue;
        }
        // judge mode also runs the LLM judge regardless of structural pass/fail
        const judgeResult = await gradeJudge({ client, modelId, input: parsed.input, expected: parsed.expected, output, skillName: skill.name });
        const pass = liveResult.pass && judgeResult.pass;
        const reason = pass
          ? `live: ${liveResult.reason} · ${judgeResult.reason}`
          : `live: ${liveResult.reason} · ${judgeResult.reason}`;
        results.push({ skill: skill.name, file: fileRel, pass, reason });
      } catch (err) {
        results.push({ skill: skill.name, file: fileRel, pass: false, reason: `API error: ${err?.message ?? err}` });
      }
    }
  }

  // Report
  const passCount = results.filter((r) => r.pass).length;
  const failCount = results.length - passCount;
  console.log("");
  for (const r of results) {
    const tag = r.pass ? "PASS" : "FAIL";
    console.log(`[${tag}] ${r.skill} · ${basename(r.file)} — ${r.reason}`);
  }
  console.log("");
  console.log(`Mode: ${args.mode}${args.mode !== "static" ? ` (model: ${args.model})` : ""}`);
  console.log(`Total: ${results.length} · PASS: ${passCount} · FAIL: ${failCount}`);

  if (failCount > 0) exit(1);
}

main().catch((err) => {
  console.error("run-evals crashed:", err);
  exit(2);
});
