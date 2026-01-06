import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "drizzle", "schema.ts");

let content = fs.readFileSync(schemaPath, "utf-8");

// استبدال جميع حالات varchar("_enum_" بـ اسم العمود الصحيح
// نحتاج إلى استخراج اسم المتغير قبل varchar("_enum_")

// نمط: variableName: varchar("_enum_", ...)
const enumPattern = /(\w+):\s*varchar\("_enum_"/g;

let match;
const replacements: Array<{ old: string; new: string }> = [];

// جمع جميع الاستبدالات
while ((match = enumPattern.exec(content)) !== null) {
  const variableName = match[1];
  const oldString = `${variableName}: varchar("_enum_"`;
  const newString = `${variableName}: varchar("${variableName}"`;
  
  if (!replacements.find(r => r.old === oldString)) {
    replacements.push({ old: oldString, new: newString });
  }
}

// تطبيق الاستبدالات
for (const replacement of replacements) {
  content = content.replace(new RegExp(replacement.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.new);
}

fs.writeFileSync(schemaPath, content, "utf-8");

console.log(`✅ تم إصلاح ${replacements.length} عمود enum`);
console.log("📋 الأعمدة التي تم إصلاحها:");
replacements.forEach((r, i) => {
  const varName = r.old.split(":")[0];
  console.log(`  ${i + 1}. ${varName}`);
});

