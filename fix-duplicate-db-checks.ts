import fs from "fs";

/**
 * سكريبت لإصلاح مشكلة التحقق المكرر من قاعدة البيانات
 * في ملف customSystemRouter.ts
 */

const filePath = "./server/customSystemRouter.ts";

console.log("🔧 إصلاح مشكلة التحقق المكرر من قاعدة البيانات...\n");

// قراءة الملف
let content = fs.readFileSync(filePath, "utf8");
const originalContent = content;

// Pattern 1: if (!db) throw Error + if (!db) return []
const pattern1 = /(\s+)if \(!db\) throw new Error\("Database not available"\);[\r\n]+\s+if \(!db\) return \[\];/g;
const replacement1 = `$1if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });`;

// Pattern 2: if (!db) throw Error + if (!db) return null
const pattern2 = /(\s+)if \(!db\) throw new Error\("Database not available"\);[\r\n]+\s+if \(!db\) return null;/g;
const replacement2 = `$1if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });`;

// Pattern 3: if (!db) throw Error + if (!db) throw TRPCError
const pattern3 = /(\s+)if \(!db\) throw new Error\("Database not available"\);[\r\n]+\s+if \(!db\) throw new TRPCError\(\{ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' \}\);/g;
const replacement3 = `$1if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });`;

let replacementCount = 0;

// تطبيق الإصلاحات
content = content.replace(pattern1, (...args) => {
  replacementCount++;
  console.log(`✅ تم إصلاح Pattern 1 (السطر ~${args[args.length - 2]})`);
  return replacement1;
});

content = content.replace(pattern2, (...args) => {
  replacementCount++;
  console.log(`✅ تم إصلاح Pattern 2 (السطر ~${args[args.length - 2]})`);
  return replacement2;
});

content = content.replace(pattern3, (...args) => {
  replacementCount++;
  console.log(`✅ تم إصلاح Pattern 3 (السطر ~${args[args.length - 2]})`);
  return replacement3;
});

if (replacementCount > 0) {
  // حفظ النسخة الاحتياطية
  fs.writeFileSync(filePath + ".backup", originalContent);
  console.log(`\n💾 تم حفظ نسخة احتياطية: ${filePath}.backup`);
  
  // حفظ الملف المعدل
  fs.writeFileSync(filePath, content);
  console.log(`✅ تم إصلاح ${replacementCount} موضع في ${filePath}`);
  console.log("\n🎉 تم الإصلاح بنجاح!");
} else {
  console.log("ℹ️  لم يتم العثور على مشاكل للإصلاح");
}

