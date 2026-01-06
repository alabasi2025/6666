import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "drizzle", "schema.ts");
let content = fs.readFileSync(schemaPath, "utf-8");

// استبدال pgEnum بشكل صحيح
// مثال: pgEnum("type", ["a", "b"]) -> varchar("type", { length: 50 })
content = content.replace(
  /pgEnum\("([^"]+)",\s*\[[^\]]+\]\)/g,
  (match, fieldName) => {
    return `varchar("${fieldName}", { length: 50 })`;
  }
);

// إزالة import pgEnum
content = content.replace(/,\s*pgEnum\s*,?/g, "");
content = content.replace(/pgEnum\s*,?\s*/g, "");

fs.writeFileSync(schemaPath, content, "utf-8");
console.log("✅ تم إصلاح جميع pgEnum");

