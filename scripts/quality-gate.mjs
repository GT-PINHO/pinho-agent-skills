#!/usr/bin/env node
// Quality Gate for public-skills/
// - Validates every skills/**/SKILL.md
// - Validates every examples/*.md
// - Regenerates skills/INDEX.md
// Exit 0 = pass, 1 = fail.

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SKILLS_DIR = join(ROOT, "skills");
const INDEX_PATH = join(SKILLS_DIR, "INDEX.md");

const REQUIRED_SECTIONS = [
  "Purpose",
  "Required inputs",
  "Non-negotiables",
  "Output format",
];

const errors = [];
const skills = [];

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (e.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function parseFrontMatter(text) {
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = text.slice(3, end).replace(/^\r?\n/, "");
  const fields = {};
  const lines = block.split(/\r?\n/);
  let currentKey = null;
  let buffer = [];
  const flush = () => {
    if (currentKey !== null) {
      fields[currentKey] = buffer.join(" ").trim();
    }
  };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (m && !line.startsWith(" ") && !line.startsWith("\t")) {
      flush();
      currentKey = m[1];
      const val = m[2];
      buffer = val === ">" || val === "|" ? [] : [val];
    } else if (currentKey !== null) {
      buffer.push(line.trim());
    }
  }
  flush();
  const rest = text.slice(end + 4).replace(/^\r?\n/, "");
  return { fields, body: rest };
}

function firstH1(body) {
  const lines = body.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("# ")) return line.slice(2).trim();
    if (/^#\s*$/.test(line)) return "";
  }
  return null;
}

function hasSection(body, name) {
  const re = new RegExp(`^#{2,6}\\s+${name}\\b`, "im");
  return re.test(body);
}

function hasLine(body, line) {
  return body.split(/\r?\n/).some((l) => l.trim() === line);
}

const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;

async function validateSkill(skillMdPath) {
  const rel = relative(ROOT, skillMdPath).split(sep).join("/");
  const text = await readFile(skillMdPath, "utf8");
  const fm = parseFrontMatter(text);
  if (!fm) {
    errors.push(`${rel}: missing YAML front-matter`);
    return;
  }
  const { fields, body } = fm;
  const name = fields.name;
  const description = fields.description;
  if (!name) errors.push(`${rel}: front-matter missing 'name'`);
  if (!description) errors.push(`${rel}: front-matter missing 'description'`);

  // Claude Code only auto-discovers single-segment skills directly under skills/.
  const folderRel = relative(SKILLS_DIR, dirname(skillMdPath)).split(sep).join("/");
  if (folderRel.includes("/")) {
    errors.push(`${rel}: skills must live at 'skills/<name>/SKILL.md' (no nested categories). Move it up.`);
  }

  if (name && !NAME_RE.test(name)) {
    errors.push(`${rel}: name '${name}' is invalid. Use lowercase letters, digits, and hyphens only (no slashes, no spaces).`);
  }

  if (name && folderRel && folderRel !== name) {
    errors.push(`${rel}: front-matter name '${name}' must match parent directory '${folderRel}'.`);
  }

  const h1 = firstH1(body);
  if (name && h1 !== name) {
    errors.push(`${rel}: first H1 must be exactly '# ${name}' (got '${h1 ?? "<none>"}')`);
  }

  const expectedLine = `**Skill name:** \`${name}\``;
  if (name && !hasLine(body, expectedLine)) {
    errors.push(`${rel}: missing line '${expectedLine}'`);
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!hasSection(body, section)) {
      errors.push(`${rel}: missing section '${section}' (case-insensitive H2-H6)`);
    }
  }

  if (name && description) {
    skills.push({
      name,
      description: description.replace(/\s+/g, " ").trim(),
      folder: relative(ROOT, dirname(skillMdPath)).split(sep).join("/"),
    });
  }
}

async function validatePluginManifest() {
  const path = join(ROOT, ".claude-plugin", "plugin.json");
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch {
    errors.push(".claude-plugin/plugin.json: missing (required for Claude Code plugin install)");
    return;
  }
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    errors.push(`.claude-plugin/plugin.json: invalid JSON (${e.message})`);
    return;
  }
  if (!json.name) errors.push(".claude-plugin/plugin.json: missing 'name'");
  else if (!NAME_RE.test(json.name)) {
    errors.push(`.claude-plugin/plugin.json: invalid 'name' '${json.name}' (lowercase + hyphens)`);
  }
  if (!json.version) errors.push(".claude-plugin/plugin.json: missing 'version'");
  if (!json.description) errors.push(".claude-plugin/plugin.json: missing 'description'");
}

async function validateExamples(folder) {
  const examplesDir = join(folder, "examples");
  let s;
  try {
    s = await stat(examplesDir);
  } catch {
    return;
  }
  if (!s.isDirectory()) return;
  const entries = await readdir(examplesDir);
  for (const f of entries) {
    if (!f.endsWith(".md")) continue;
    const full = join(examplesDir, f);
    const rel = relative(ROOT, full).split(sep).join("/");
    const text = await readFile(full, "utf8");
    const lines = text.split(/\r?\n/);
    const hasInput = lines.some((l) => /^##\s+Input\b/.test(l));
    const hasExpected = lines.some((l) => /^##\s+Expected output\b/i.test(l));
    if (!hasInput) errors.push(`${rel}: missing '## Input' section`);
    if (!hasExpected) errors.push(`${rel}: missing '## Expected output' section`);
  }
}

async function main() {
  const all = await walk(SKILLS_DIR);
  const skillFiles = all.filter((p) => p.endsWith(`${sep}SKILL.md`) || p.endsWith("/SKILL.md"));

  if (skillFiles.length === 0) {
    errors.push("no SKILL.md files found under skills/");
  }

  for (const f of skillFiles) {
    await validateSkill(f);
    await validateExamples(dirname(f));
  }

  await validatePluginManifest();

  // Regenerate INDEX.md (only if no errors so far we still write — index reflects current state)
  skills.sort((a, b) => a.name.localeCompare(b.name));
  const indexLines = [
    "# Skills Index",
    "",
    "_Auto-generated by `scripts/quality-gate.mjs`. Do not edit by hand._",
    "",
    `Total: ${skills.length} skill(s).`,
    "",
    "| Name | Description | Path |",
    "| --- | --- | --- |",
    ...skills.map((s) => {
      const linkTarget = s.folder.replace(/^skills\//, "");
      return `| \`${s.name}\` | ${s.description} | [\`${s.folder}/\`](${escapeMdLink(linkTarget)}/) |`;
    }),
    "",
  ];
  await writeFile(INDEX_PATH, indexLines.join("\n"), "utf8");

  if (errors.length > 0) {
    console.error("Quality Gate: FAIL");
    for (const e of errors) console.error(` - ${e}`);
    console.error(`\n${errors.length} issue(s) found.`);
    process.exit(1);
  }

  console.log("Quality Gate: PASS");
  console.log(`Validated ${skills.length} skill(s). Index written to ${relative(ROOT, INDEX_PATH).split(sep).join("/")}`);
}

function escapeMdLink(p) {
  return p.replace(/ /g, "%20");
}

main().catch((err) => {
  console.error("Quality Gate crashed:", err);
  process.exit(2);
});
