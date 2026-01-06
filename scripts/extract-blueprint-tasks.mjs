/**
 * Extract tasks from a Markdown blueprint file into JSON + Markdown outputs.
 *
 * Why:
 * - The blueprint is very large (17k+ lines). This script extracts all numbered tasks
 *   (bullet items مثل: "- 1.1.1: ..." and table rows مثل: "| 1.1 | ... |").
 *
 * Usage (PowerShell):
 *   node scripts/extract-blueprint-tasks.mjs "C:\path\PHASE_1_DETAILED(1).md" "docs/phase1"
 */

import fs from "node:fs";
import path from "node:path";

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n");
}

function safeMkdir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function trimOuterPipes(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return null;
  // Keep trailing pipe optional; split still works.
  const parts = trimmed.split("|").map((p) => p.trim());
  // Remove leading and trailing empty due to split behavior: ["", "a", "b", ""]
  if (parts.length >= 2 && parts[0] === "") parts.shift();
  if (parts.length >= 2 && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

function isTableSeparatorRow(cells) {
  // Typical: ["---", "----", ...]
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function isNumberedId(value) {
  // Examples: 1.1, 1.1.1, 12.3.4.5
  return /^\d+(?:\.\d+)*$/.test(value);
}

function renderMarkdown(items, meta) {
  const lines = [];
  lines.push(`# Phase 1 Blueprint - Extracted Tasks`);
  lines.push(``);
  lines.push(`- **Source**: \`${meta.sourcePath}\``);
  lines.push(`- **Generated at**: \`${meta.generatedAt}\``);
  lines.push(`- **Total lines**: ${meta.totalLines}`);
  lines.push(`- **Extracted items**: ${items.length}`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  // Group by section path for readability
  const bySection = new Map();
  for (const it of items) {
    const key = it.sectionPath || "(no heading context)";
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(it);
  }

  for (const [section, sectionItems] of bySection.entries()) {
    lines.push(`## ${section}`);
    lines.push(``);
    lines.push(`| ID | Type | Text | Line |`);
    lines.push(`|---:|:-----|:-----|----:|`);
    for (const it of sectionItems) {
      const text = it.type === "bullet"
        ? it.text
        : it.cells.slice(1).join(" | ");
      lines.push(`| ${it.id} | ${it.type} | ${escapeMd(text)} | ${it.line} |`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}

function escapeMd(s) {
  return String(s ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function main() {
  const [sourcePathArg, outDirArg] = process.argv.slice(2);
  if (!sourcePathArg || !outDirArg) {
    console.error("Usage: node scripts/extract-blueprint-tasks.mjs <source.md> <outDir>");
    process.exit(1);
  }

  const sourcePath = path.resolve(sourcePathArg);
  const outDir = path.resolve(outDirArg);
  safeMkdir(outDir);

  const raw = fs.readFileSync(sourcePath, "utf8");
  const text = normalizeNewlines(raw);
  const lines = text.split("\n");

  /** @type {{level:number, text:string, line:number}[]} */
  const headingStack = [];

  /** @type {Array<any>} */
  const items = [];

  function setHeading(level, text, lineNo) {
    while (headingStack.length && headingStack[headingStack.length - 1].level >= level) {
      headingStack.pop();
    }
    headingStack.push({ level, text, line: lineNo });
  }

  function currentSectionPath() {
    // Skip the top-level title if present; keep it simple and readable.
    return headingStack.map((h) => h.text).join(" > ").trim() || "";
  }

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];

    const mh = /^(#{1,6})\s+(.*)$/.exec(line);
    if (mh) {
      const level = mh[1].length;
      const text = mh[2].trim();
      setHeading(level, text, lineNo);
      continue;
    }

    const mb = /^\s*-\s*(\d+(?:\.\d+)+)\s*:\s*(.+?)\s*$/.exec(line);
    if (mb) {
      items.push({
        type: "bullet",
        id: mb[1],
        text: mb[2].trim(),
        line: lineNo,
        sectionPath: currentSectionPath(),
        raw: line,
      });
      continue;
    }

    // Table row tasks: | 1.1 | ... |
    const cells = trimOuterPipes(line);
    if (cells && cells.length >= 2) {
      if (isTableSeparatorRow(cells)) continue;
      const id = cells[0];
      if (isNumberedId(id)) {
        items.push({
          type: "table",
          id,
          cells,
          line: lineNo,
          sectionPath: currentSectionPath(),
          raw: line,
        });
      }
    }
  }

  const meta = {
    sourcePath,
    generatedAt: new Date().toISOString(),
    totalLines: lines.length,
  };

  const outJson = path.join(outDir, "PHASE_1_BLUEPRINT_TASKS_EXTRACTED.json");
  const outMd = path.join(outDir, "PHASE_1_BLUEPRINT_TASKS_EXTRACTED.md");

  fs.writeFileSync(outJson, JSON.stringify({ meta, items }, null, 2), "utf8");
  fs.writeFileSync(outMd, renderMarkdown(items, meta), "utf8");

  console.log(`Extracted ${items.length} items`);
  console.log(`- JSON: ${outJson}`);
  console.log(`- MD:   ${outMd}`);
}

main();





