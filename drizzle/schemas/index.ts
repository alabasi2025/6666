// ===================================================================
// Drizzle Schemas Index - PostgreSQL Only
// ===================================================================
// ملاحظة: جميع ملفات schemas/ القديمة التي تستخدم MySQL تم أرشفتها
// schema.ts الرئيسي يحتوي على جميع الجداول بصيغة PostgreSQL
// ===================================================================

// الملفات المحولة إلى PostgreSQL فقط:
export * from "./billing-enhanced";  // ✅ تم التحويل
export * from "./mobile-apps";        // ✅ تم التحويل

// ملاحظة: باقي الملفات موجودة في schema.ts الرئيسي
// organization, users, accounting, assets, maintenance, inventory, etc.
// جميعها موجودة في drizzle/schema.ts بصيغة PostgreSQL
