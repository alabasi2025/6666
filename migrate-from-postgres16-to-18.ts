import "dotenv/config";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import { logger } from "./server/utils/logger.js";

interface TableInfo {
  table_name: string;
  row_count: number;
  columns: string[];
}

async function migrateFromPostgres16To18() {
  console.log("=".repeat(70));
  console.log("🔄 نقل البيانات من PostgreSQL 16 إلى PostgreSQL 18");
  console.log("=".repeat(70));

  // الاتصال بـ PostgreSQL 16 (المصدر)
  const sourcePool = new Pool({
    host: "localhost",
    port: 5432, // PostgreSQL 16
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  // الاتصال بـ PostgreSQL 18 (الهدف)
  const targetPool = new Pool({
    host: "localhost",
    port: 5433, // PostgreSQL 18
    user: "postgres",
    password: "774424555",
    database: "666666",
  });

  try {
    console.log("\n1️⃣  التحقق من الاتصال بـ PostgreSQL 16...");
    await sourcePool.query("SELECT version()");
    console.log("   ✅ تم الاتصال بـ PostgreSQL 16 بنجاح");

    console.log("\n2️⃣  التحقق من الاتصال بـ PostgreSQL 18...");
    await targetPool.query("SELECT version()");
    console.log("   ✅ تم الاتصال بـ PostgreSQL 18 بنجاح");

    // الحصول على قائمة الجداول من PostgreSQL 16
    console.log("\n3️⃣  الحصول على قائمة الجداول من PostgreSQL 16...");
    const tablesResult = await sourcePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`   ✅ تم العثور على ${tables.length} جدول`);

    // تصفية الجداول - تجاهل جداول النظام
    const systemTables = ["__drizzle_migrations"];
    const dataTables = tables.filter(table => !systemTables.includes(table));

    console.log(`\n4️⃣  جاري نقل البيانات من ${dataTables.length} جدول...\n`);

    let totalRowsMigrated = 0;
    let successTables = 0;
    let failedTables: string[] = [];

    for (const tableName of dataTables) {
      try {
        console.log(`   📊 نقل جدول: ${tableName}...`);

        // جلب عدد الصفوف من المصدر
        const countResult = await sourcePool.query(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
        const rowCount = parseInt(countResult.rows[0].cnt || "0");

        if (rowCount === 0) {
          console.log(`      ⚪ فارغ (0 صف) - تم تخطيه`);
          continue;
        }

        console.log(`      📋 عدد الصفوف: ${rowCount}`);

        // التحقق من وجود الجدول في الهدف
        const tableExistsResult = await targetPool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [tableName]);

        if (!tableExistsResult.rows[0].exists) {
          console.log(`      ⚠️  الجدول غير موجود في PostgreSQL 18 - تم تخطيه`);
          failedTables.push(`${tableName} (table not found)`);
          continue;
        }

        // جلب أسماء الأعمدة
        const columnsResult = await sourcePool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);

        const sourceColumns = columnsResult.rows.map(row => row.column_name);

        const targetColumnsResult = await targetPool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);

        const targetColumns = targetColumnsResult.rows.map(row => row.column_name);

        // العثور على الأعمدة المشتركة
        const commonColumns = sourceColumns.filter(col => targetColumns.includes(col));

        if (commonColumns.length === 0) {
          console.log(`      ⚠️  لا توجد أعمدة مشتركة - تم تخطيه`);
          failedTables.push(`${tableName} (no common columns)`);
          continue;
        }

        console.log(`      📝 الأعمدة المشتركة: ${commonColumns.length}`);

        // التحقق من وجود بيانات في الهدف
        const existingCountResult = await targetPool.query(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
        const existingCount = parseInt(existingCountResult.rows[0].cnt || "0");

        if (existingCount > 0) {
          console.log(`      ⚠️  الجدول يحتوي على ${existingCount} صف موجود - سيتم إضافة البيانات`);
          // يمكن إضافة خيار: truncate أو skip
        }

        // جلب البيانات من المصدر
        console.log(`      📥 جلب البيانات من PostgreSQL 16...`);
        const dataResult = await sourcePool.query(`SELECT ${commonColumns.map(c => `"${c}"`).join(", ")} FROM "${tableName}"`);

        if (dataResult.rows.length === 0) {
          console.log(`      ⚪ لا توجد بيانات - تم تخطيه`);
          continue;
        }

        // إدراج البيانات في الهدف
        console.log(`      📤 إدراج البيانات في PostgreSQL 18...`);

        // استخدام COPY أو INSERT حسب حجم البيانات
        if (dataResult.rows.length < 1000) {
          // استخدام INSERT للملفات الصغيرة
          for (const row of dataResult.rows) {
            const values = commonColumns.map(col => row[col]);
            const placeholders = commonColumns.map((_, i) => `$${i + 1}`).join(", ");
            const columnNames = commonColumns.map(c => `"${c}"`).join(", ");

            try {
              await targetPool.query(
                `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                values
              );
            } catch (error: any) {
              // تجاهل أخطاء التكرار
              if (!error.message.includes("duplicate") && !error.message.includes("unique")) {
                throw error;
              }
            }
          }
        } else {
          // استخدام COPY للملفات الكبيرة
          // نسخ البيانات عبر CSV مؤقت
          const tempFile = path.join(process.cwd(), `temp_${tableName}_${Date.now()}.csv`);
          const csvContent = [
            commonColumns.join(","),
            ...dataResult.rows.map(row =>
              commonColumns.map(col => {
                const value = row[col];
                if (value === null) return "\\N";
                if (typeof value === "string") {
                  return `"${value.replace(/"/g, '""')}"`;
                }
                return String(value);
              }).join(",")
            )
          ].join("\n");

          fs.writeFileSync(tempFile, csvContent, "utf-8");

          try {
            // استخدام COPY في PostgreSQL
            const copyQuery = `
              COPY "${tableName}" (${commonColumns.map(c => `"${c}"`).join(", ")}) 
              FROM STDIN WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"')
            `;

            // قراءة الملف وإرساله
            const fileContent = fs.readFileSync(tempFile, "utf-8");
            const lines = fileContent.split("\n").slice(1); // تخطي العنوان
            
            // إدراج البيانات باستخدام INSERT بدلاً من COPY (لأن COPY يحتاج صلاحيات خاصة)
            const batchSize = 100;
            for (let i = 0; i < lines.length; i += batchSize) {
              const batch = lines.slice(i, i + batchSize).filter(line => line.trim());
              
              for (const line of batch) {
                const values = line.split(",").map(v => {
                  if (v === "\\N") return null;
                  if (v.startsWith('"') && v.endsWith('"')) {
                    return v.slice(1, -1).replace(/""/g, '"');
                  }
                  return v;
                });

                if (values.length === commonColumns.length) {
                  const placeholders = commonColumns.map((_, i) => `$${i + 1}`).join(", ");
                  const columnNames = commonColumns.map(c => `"${c}"`).join(", ");

                  try {
                    await targetPool.query(
                      `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                      values
                    );
                  } catch (error: any) {
                    if (!error.message.includes("duplicate") && !error.message.includes("unique")) {
                      console.log(`      ⚠️  خطأ في صف واحد: ${error.message.substring(0, 50)}`);
                    }
                  }
                }
              }
            }

            // حذف الملف المؤقت
            fs.unlinkSync(tempFile);
          } catch (error: any) {
            // حذف الملف المؤقت في حالة الخطأ
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
            throw error;
          }
        }

        // التحقق من عدد الصفوف بعد الإدراج
        const finalCountResult = await targetPool.query(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
        const finalCount = parseInt(finalCountResult.rows[0].cnt || "0");

        totalRowsMigrated += finalCount - existingCount;
        successTables++;

        console.log(`      ✅ تم النقل بنجاح (${finalCount - existingCount} صف جديد)`);
        console.log(`      📊 الإجمالي في PostgreSQL 18: ${finalCount} صف\n`);

      } catch (error: any) {
        console.log(`      ❌ خطأ في نقل الجدول: ${error.message}`);
        failedTables.push(`${tableName} (${error.message.substring(0, 50)})`);
      }
    }

    // نقل جدول migrations
    console.log(`\n5️⃣  نقل جدول __drizzle_migrations...`);
    try {
      const migrationsResult = await sourcePool.query(`SELECT * FROM "__drizzle_migrations" ORDER BY id`);
      
      if (migrationsResult.rows.length > 0) {
        // التحقق من وجود الجدول في الهدف
        const tableExistsResult = await targetPool.query(`
          SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '__drizzle_migrations'
          )
        `);

        if (tableExistsResult.rows[0].exists) {
          // حذف البيانات الموجودة أولاً
          await targetPool.query(`DELETE FROM "__drizzle_migrations"`);

          // إدراج البيانات
          for (const migration of migrationsResult.rows) {
            await targetPool.query(
              `INSERT INTO "__drizzle_migrations" (id, hash, created_at) VALUES ($1, $2, $3)`,
              [migration.id, migration.hash, migration.created_at]
            );
          }

          console.log(`   ✅ تم نقل ${migrationsResult.rows.length} migration`);
        }
      }
    } catch (error: any) {
      console.log(`   ⚠️  خطأ في نقل migrations: ${error.message}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ اكتمل نقل البيانات!");
    console.log("=".repeat(70));
    console.log(`\n📊 ملخص النقل:`);
    console.log(`   ✅ الجداول الناجحة: ${successTables}`);
    console.log(`   ❌ الجداول الفاشلة: ${failedTables.length}`);
    console.log(`   📝 إجمالي الصفوف المنقولة: ${totalRowsMigrated}`);

    if (failedTables.length > 0) {
      console.log(`\n⚠️  الجداول التي فشل نقلها:`);
      failedTables.forEach(table => console.log(`   - ${table}`));
    }

    await sourcePool.end();
    await targetPool.end();

    console.log("\n✅ اكتمل النقل بنجاح!");
    console.log("\n💡 الخطوة التالية:");
    console.log("   1. تحديث ملف .env لاستخدام PostgreSQL 18:");
    console.log("      DATABASE_URL=postgresql://postgres:774424555@localhost:5433/666666");
    console.log("   2. إعادة تشغيل السيرفر");

  } catch (error: any) {
    console.error("\n❌ خطأ أثناء نقل البيانات:", error.message);
    
    if (error.code === "ECONNREFUSED") {
      console.error("\n💡 تأكد من:");
      console.error("   - PostgreSQL 16 يعمل على المنفذ 5432");
      console.error("   - PostgreSQL 18 يعمل على المنفذ 5433");
    }
    
    await sourcePool.end();
    await targetPool.end();
    process.exit(1);
  }
}

migrateFromPostgres16To18();
