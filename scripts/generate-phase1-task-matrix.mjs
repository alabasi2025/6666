/**
 * Generate a Phase 1 status matrix by merging:
 * - Extracted blueprint tasks (docs/phase1/PHASE_1_BLUEPRINT_TASKS_EXTRACTED.json)
 * - Existing checklist statuses (PHASE_1_TASKS_CHECKLIST.md)
 *
 * Output:
 * - docs/phase1/PHASE_1_TASKS_STATUS_MATRIX.md
 * - docs/phase1/PHASE_1_TASKS_STATUS_MATRIX.csv
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const DEFAULT_EXTRACTED_JSON = path.join(
  ROOT,
  "docs/phase1/PHASE_1_BLUEPRINT_TASKS_EXTRACTED.json",
);
const DEFAULT_CHECKLIST_MD = path.join(ROOT, "PHASE_1_TASKS_CHECKLIST.md");
const DEFAULT_OUT_MD = path.join(ROOT, "docs/phase1/PHASE_1_TASKS_STATUS_MATRIX.md");
const DEFAULT_OUT_CSV = path.join(ROOT, "docs/phase1/PHASE_1_TASKS_STATUS_MATRIX.csv");

/** @typedef {"✅"|"⚠️"|"❌"|"⏸️"} StatusIcon */

/**
 * Parse checklist file lines like:
 * - [x] ✅ 1.1.1: ...
 * - [ ] 🟡 1.1.6: ...
 * - [ ] ❌ 1.2.8: ...
 *
 * @returns {Map<string, {status: StatusIcon, sourceIcon: string, text: string}>}
 */
function parseChecklistStatuses(md) {
  /** @type {Map<string, {status: StatusIcon, sourceIcon: string, text: string}>} */
  const map = new Map();
  const lines = md.split(/\r?\n/);

  for (const line of lines) {
    // Note: checklist uses 🟡 for partial; we normalize it to ⚠️
    const m = /^\s*-\s*\[[x ]\]\s*(✅|🟡|❌|⏸️)\s+(\d+(?:\.\d+)+)\s*:\s*(.+?)\s*$/.exec(line);
    if (!m) continue;
    const sourceIcon = m[1];
    const id = m[2];
    const text = m[3];
    /** @type {StatusIcon} */
    const status = sourceIcon === "🟡" ? "⚠️" : /** @type {StatusIcon} */ (sourceIcon);
    map.set(id, { status, sourceIcon, text });
  }

  return map;
}

function escapeMdCell(s) {
  return String(s ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeCsvCell(s) {
  const v = String(s ?? "");
  const escaped = v.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Minimal evidence hints by task group (kept as file paths only).
 * @param {string} id
 * @returns {string[]}
 */
function evidenceForId(id) {
  if (id.startsWith("1.1.")) return ["drizzle/schema.ts", "server/db-modules/business.ts", "server/routers.ts"];
  if (id.startsWith("1.2.")) return ["drizzle/schema.ts", "server/auth.ts", "server/permissions/*", "client/src/pages/Login.tsx", "client/src/pages/users/UsersManagement.tsx"];
  if (id.startsWith("1.3.")) return ["client/src/pages/Dashboard.tsx", "client/src/pages/organization/Businesses.tsx", "client/src/pages/organization/Branches.tsx", "client/src/pages/organization/Stations.tsx"];
  if (id.startsWith("1.4.")) return ["server/billingRouter.ts", "client/src/pages/billing/customers/CustomersManagement.tsx", "client/src/pages/customers/CustomerDetails.tsx"];
  if (id.startsWith("2.1.")) return ["server/billingRouter.ts", "client/src/pages/billing/invoicing/MeterReadingsManagement.tsx"];
  if (id.startsWith("2.2.")) return ["server/billingRouter.ts", "client/src/pages/billing/invoicing/InvoicesManagement.tsx"];
  if (id.startsWith("2.3.")) return ["drizzle/schema.ts", "client/src/pages/developer/Integrations.tsx", "server/billingRouter.ts"];
  if (id.startsWith("2.4.")) return ["server/notifications/*", "client/src/pages/developer/Integrations.tsx", "drizzle/schema.ts"];
  if (id.startsWith("3.")) return ["drizzle/schema.ts", "server/customerSystemRouter.ts"];
  if (id.startsWith("4.")) return ["server/accountingRouter.ts", "client/src/pages/accounting/*", "server/customSystemRouter.ts", "client/src/pages/custom/*"];
  if (id.startsWith("5.")) return [];
  if (id.startsWith("6.") || id.startsWith("7.")) return [];
  if (id.startsWith("8.")) return ["server/inventoryRouter.ts", "client/src/pages/inventory/*"];
  if (id.startsWith("9.")) return ["server/maintenanceRouter.ts", "client/src/pages/maintenance/*"];
  return [];
}

/**
 * Manual overrides for items that are frequently overestimated if we only rely on checklist icons.
 * This is intentionally small and focused on integrations/automation.
 *
 * @type {Record<string, {status: StatusIcon, note: string}>}
 */
const OVERRIDES = {
  // Stations: there is a full create/edit screen, but not a dedicated advanced "settings" module.
  "1.3.4": { status: "⚠️", note: "إعدادات المحطة موجودة ضمن نموذج إنشاء/تعديل المحطة، لكن لا شاشة إعدادات متقدمة منفصلة." },

  // Payment gateways: current system has internal payments + integrations CRUD, but no real gateway webhooks/verification.
  "2.3.3": { status: "❌", note: "لا يوجد نموذج معاملات بوابة دفع/ويبهوكس؛ الموجود حالياً تسجيل يدوي للمدفوعات." },
  "2.3.4": { status: "❌", note: "لا يوجد Webhook/Handler لنجاح الدفع من بوابة دفع." },
  "2.3.5": { status: "❌", note: "لا يوجد مسار دفعات فاشلة/Refunds مرتبط ببوابة دفع." },
  "2.3.8": { status: "❌", note: "لا يوجد نظام تحقق Payment Verification من مزود خارجي." },

  // SMS/WhatsApp: notification skeleton exists; WhatsApp channel not implemented.
  "2.4.2": { status: "❌", note: "لا توجد قناة WhatsApp في server/notifications/channels." },
  "2.4.5": { status: "❌", note: "لا يوجد إرسال فواتير تلقائي عبر SMS/WhatsApp." },
  "2.4.6": { status: "❌", note: "لا يوجد تذكير مجدول للمتأخرات." },
};

/**
 * Get status + note for an extracted item.
 * @param {{type:"bullet"|"table", id:string, text?:string, cells?:string[], line:number, sectionPath?:string}} item
 * @param {Map<string, {status: StatusIcon, sourceIcon: string, text: string}>} checklist
 */
function resolveStatus(item, checklist) {
  const id = item.id;

  // Start from checklist if present (mainly for bullet tasks like 1.1.1)
  let status = checklist.get(id)?.status;
  let note = "";

  // Apply manual override
  if (OVERRIDES[id]) {
    status = OVERRIDES[id].status;
    note = OVERRIDES[id].note;
  }

  // If unknown, default to ❌ for now (explicitly indicates not found in our checklist-based audit)
  if (!status) status = "❌";

  return { status, note };
}

function itemText(item) {
  if (item.type === "bullet") return item.text || "";
  // table: keep cells except first ID
  return (item.cells || []).slice(1).join(" | ");
}

function renderMarkdown(items, meta, checklistMeta, checklistMap) {
  const generatedAt = new Date().toISOString();

  /** @type {Record<StatusIcon, number>} */
  const counts = { "✅": 0, "⚠️": 0, "❌": 0, "⏸️": 0 };

  const bySection = new Map();
  for (const it of items) {
    const key = it.sectionPath || "(no heading context)";
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(it);
  }

  const lines = [];
  lines.push(`# Phase 1 Tasks Status Matrix (Audited)`);
  lines.push(``);
  lines.push(`- **Generated at**: \`${generatedAt}\``);
  lines.push(`- **Blueprint source**: \`${meta.sourcePath}\``);
  lines.push(`- **Blueprint total lines**: ${meta.totalLines}`);
  lines.push(`- **Extracted items**: ${items.length}`);
  lines.push(`- **Checklist source**: \`${checklistMeta.path}\``);
  lines.push(`- **Legend**: ✅ منفذ، ⚠️ منفذ جزئياً، ❌ غير منفذ، ⏸️ يحتاج مراجعة`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  for (const [section, sectionItems] of bySection.entries()) {
    lines.push(`## ${section}`);
    lines.push(``);
    lines.push(`| ID | Status | Type | Task | Blueprint line | Evidence | Notes |`);
    lines.push(`|---:|:------:|:-----|:-----|--------------:|:---------|:------|`);

    for (const it of sectionItems) {
      const { status, note } = resolveStatus(it, checklistMap);
      counts[status]++;

      const ev = evidenceForId(it.id);
      const evCell = ev.length ? ev.map((p) => `\`${p}\``).join("<br/>") : "";
      const task = itemText(it);

      lines.push(
        `| ${escapeMdCell(it.id)} | ${status} | ${it.type} | ${escapeMdCell(task)} | ${it.line} | ${evCell} | ${escapeMdCell(note)} |`,
      );
    }

    lines.push(``);
  }

  lines.splice(8, 0, `- **Status counts**: ✅ ${counts["✅"]} | ⚠️ ${counts["⚠️"]} | ❌ ${counts["❌"]} | ⏸️ ${counts["⏸️"]}`);

  return { markdown: lines.join("\n"), counts };
}

function renderCsv(items, checklistMap) {
  const header = [
    "id",
    "status",
    "type",
    "task",
    "blueprint_line",
    "section_path",
    "evidence",
    "notes",
  ];
  const rows = [header.map(escapeCsvCell).join(",")];

  for (const it of items) {
    const { status, note } = resolveStatus(it, checklistMap);
    const task = itemText(it);
    const ev = evidenceForId(it.id).join("; ");

    rows.push([
      it.id,
      status,
      it.type,
      task,
      String(it.line),
      it.sectionPath || "",
      ev,
      note,
    ].map(escapeCsvCell).join(","));
  }

  return rows.join("\n");
}

function main() {
  const extractedJsonPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_EXTRACTED_JSON;
  const checklistPath = process.argv[3] ? path.resolve(process.argv[3]) : DEFAULT_CHECKLIST_MD;
  const outMdPath = process.argv[4] ? path.resolve(process.argv[4]) : DEFAULT_OUT_MD;
  const outCsvPath = process.argv[5] ? path.resolve(process.argv[5]) : DEFAULT_OUT_CSV;

  const extracted = JSON.parse(fs.readFileSync(extractedJsonPath, "utf8"));
  const checklistMd = fs.readFileSync(checklistPath, "utf8");
  const checklistMap = parseChecklistStatuses(checklistMd);

  const { markdown } = renderMarkdown(
    extracted.items,
    extracted.meta,
    { path: checklistPath },
    checklistMap,
  );

  fs.mkdirSync(path.dirname(outMdPath), { recursive: true });
  fs.writeFileSync(outMdPath, markdown, "utf8");
  fs.writeFileSync(outCsvPath, renderCsv(extracted.items, checklistMap), "utf8");

  console.log(`Wrote: ${outMdPath}`);
  console.log(`Wrote: ${outCsvPath}`);
}

main();


