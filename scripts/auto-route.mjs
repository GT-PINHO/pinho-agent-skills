#!/usr/bin/env node
// Auto-route runtime — Option 3 of public-skills auto-routing.
// Classifies a task by project complexity (S/M/L) + task type, picks the smallest
// viable Claude model, and dispatches the request via the Anthropic SDK.
//
// Usage:
//   node scripts/auto-route.mjs --task "fix the typo in src/Button.tsx" --root .
//   node scripts/auto-route.mjs --task "refactor the auth layer to use JWT" --root .
//   echo "explain this repo" | node scripts/auto-route.mjs --root .
//
// Env:
//   ANTHROPIC_API_KEY   required (only when actually dispatching)
//   AUTO_ROUTE_DRY_RUN  if "1", skip the API call and just print the routing decision
//   AUTO_ROUTE_FORCE    "haiku" | "sonnet" | "opus" — override the classifier
//
// Exit codes:
//   0 = success, 1 = bad input, 2 = API error.

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { argv, env, stdin, exit } from "node:process";

// --- Model registry ---------------------------------------------------------

const MODELS = {
  haiku:  "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-6",
  opus:   "claude-opus-4-7",
};

// --- Project size classifier ------------------------------------------------

const HEAVY_DIRS = new Set([
  "node_modules", ".git", ".next", "dist", "build", ".turbo", ".vercel",
  "out", "coverage", ".cache", "target", "venv", ".venv", "__pycache__",
]);

const SOURCE_EXT = /\.(?:m?[jt]sx?|py|go|rs|rb|java|kt|cs|php|swift|sql|vue|svelte|astro)$/i;

async function countSourceFiles(root, cap = 1500) {
  let count = 0;
  async function walk(dir) {
    if (count >= cap) return;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (count >= cap) return;
      if (e.name.startsWith(".") && e.name !== ".github") continue;
      if (HEAVY_DIRS.has(e.name)) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && SOURCE_EXT.test(e.name)) {
        count++;
      }
    }
  }
  await walk(root);
  return count;
}

async function detectMonorepo(root) {
  for (const f of ["pnpm-workspace.yaml", "lerna.json", "turbo.json", "nx.json", "rush.json"]) {
    try {
      await stat(join(root, f));
      return true;
    } catch {}
  }
  try {
    const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    if (Array.isArray(pkg.workspaces) || (pkg.workspaces && Array.isArray(pkg.workspaces.packages))) {
      return true;
    }
  } catch {}
  return false;
}

async function classifyProject(root) {
  const [files, mono] = await Promise.all([countSourceFiles(root), detectMonorepo(root)]);
  let size;
  if (mono || files >= 500) size = "L";
  else if (files >= 50) size = "M";
  else size = "S";
  return { size, files, monorepo: mono };
}

// --- Task type classifier ---------------------------------------------------

function classifyTask(taskText) {
  const t = taskText.toLowerCase();
  if (/(architect|architecture|design system|migrat|rewrite|cross-cutting|distributed|critical|security audit|threat model)/.test(t)) {
    return "architecture";
  }
  if (/(refactor|debug|implement|build feature|cross[- ]file|investigate|review pr|pull request)/.test(t)) {
    return "feature";
  }
  if (/(typo|rename|format|lookup|summari[sz]e|read |list |what is|explain (this|the))/.test(t)) {
    return "lookup";
  }
  return "feature"; // default
}

// --- Routing decision -------------------------------------------------------

function pickModelTier(projectSize, taskType, override) {
  if (override) return override;

  // Architecture/critical work always escalates one tier above the project default.
  if (taskType === "architecture") {
    if (projectSize === "L") return "opus";
    if (projectSize === "M") return "opus";
    return "sonnet";
  }

  // Quick lookups can go one tier below the project default.
  if (taskType === "lookup") {
    if (projectSize === "L") return "sonnet";
    return "haiku";
  }

  // Feature work = project default.
  if (projectSize === "S") return "haiku";
  if (projectSize === "M") return "sonnet";
  return "sonnet"; // L coordinator: Sonnet for local, Opus reserved via task type
}

// --- CLI parsing ------------------------------------------------------------

function parseArgs(args) {
  const out = { task: null, root: process.cwd() };
  for (let i = 2; i < args.length; i++) {
    const a = args[i];
    if (a === "--task") out.task = args[++i];
    else if (a === "--root") out.root = args[++i];
    else if (a === "-h" || a === "--help") out.help = true;
  }
  return out;
}

async function readStdin() {
  if (stdin.isTTY) return null;
  let data = "";
  for await (const chunk of stdin) data += chunk;
  return data.trim() || null;
}

function help() {
  console.log(`auto-route — pick haiku/sonnet/opus by project size + task type.

  --task   "<one-line task description>"   (or pipe via stdin)
  --root   "<project root>"                 (default: cwd)

  env AUTO_ROUTE_DRY_RUN=1   classify only, don't call the API
  env AUTO_ROUTE_FORCE=...   force tier (haiku|sonnet|opus)
  env ANTHROPIC_API_KEY      required for live dispatch
`);
}

// --- Main -------------------------------------------------------------------

async function main() {
  const args = parseArgs(argv);
  if (args.help) return help();

  const taskText = args.task ?? (await readStdin());
  if (!taskText) {
    console.error("error: provide a task via --task or stdin. Use --help for usage.");
    exit(1);
  }

  const project = await classifyProject(args.root);
  const taskType = classifyTask(taskText);
  const force = env.AUTO_ROUTE_FORCE && MODELS[env.AUTO_ROUTE_FORCE] ? env.AUTO_ROUTE_FORCE : null;
  const tier = pickModelTier(project.size, taskType, force);
  const model = MODELS[tier];

  const decision = {
    project: { root: relative(process.cwd(), args.root).split(sep).join("/") || ".", ...project },
    task: { text: taskText, type: taskType },
    routing: { tier, model, forced: !!force },
  };
  console.error(JSON.stringify(decision, null, 2));

  if (env.AUTO_ROUTE_DRY_RUN === "1") return;

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("error: ANTHROPIC_API_KEY not set. Set AUTO_ROUTE_DRY_RUN=1 for classification only.");
    exit(1);
  }

  let Anthropic;
  try {
    ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
  } catch {
    console.error("error: @anthropic-ai/sdk not installed. Run: npm i @anthropic-ai/sdk");
    exit(1);
  }

  const client = new Anthropic({ apiKey });
  try {
    const resp = await client.messages.create({
      model,
      max_tokens: 1024,
      system:
        "You are a precise, evidence-based assistant. Follow token-discipline: " +
        "minimum reading, no repo-wide scans, no preambles, end with how to validate.",
      messages: [{ role: "user", content: taskText }],
    });
    for (const block of resp.content) {
      if (block.type === "text") process.stdout.write(block.text);
    }
    process.stdout.write("\n");
  } catch (err) {
    console.error("API error:", err?.message ?? err);
    exit(2);
  }
}

main().catch((err) => {
  console.error("auto-route crashed:", err);
  exit(2);
});
