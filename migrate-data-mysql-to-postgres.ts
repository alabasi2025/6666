import mysql from "mysql2/promise";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

// إعدادات MySQL القديمة
const mysqlConfig = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "666666",
};

// إعدادات PostgreSQL الجديدة
const pgConfig = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "774424555",
  database: "666666",
};

async function getTableNames(connection: mysql.Connection): Promise<string[]> {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    "SHOW TABLES"
  );
  return rows.map((row) => Object.values(row)[0] as string);
}

async function getTableData(
  connection: mysql.Connection,
  tableName: string
): Promise<any[]> {
  const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);
  return rows as any[];
}

async function insertDataToPostgres(
  pgPool: Pool,
  tableName: string,
  data: any[]
): Promise<number> {
  if (data.length === 0) return 0;

  // الحصول على أسماء الأعمدة
  const columns = Object.keys(data[0]);
  const columnsStr = columns.map((col) => `"${col}"`).join(", ");

  // إنشاء placeholders
  const values = data.map((row, idx) => {
    const rowValues = columns.map((col, colIdx) => {
      const paramNum = idx * columns.length + colIdx + 1;
      return `$${paramNum}`;
    });
    return `(${rowValues.join(", ")})`;
  });

  // إنشاء query
  const query = `INSERT INTO "${tableName}" (${columnsStr}) VALUES ${values.join(
    ", "
  )} ON CONFLICT DO NOTHING`;

  // تحضير القيم
  const flatValues = data.flatMap((row) =>
    columns.map((col) => {
      const value = row[col];
      // تحويل null و undefined
      if (value === null || value === undefined) return null;
      // تحويل Date إلى string
      if (value instanceof Date) return value.toISOString();
      // تحويل Buffer إلى string (للـ JSON)
      if (Buffer.isBuffer(value)) return value.toString("utf8");
      return value;
    })
  );

  try {
    await pgPool.query(query, flatValues);
    return data.length;
  } catch (error: any) {
    // إذا فشل، جرب إدراج صف واحد في كل مرة
    if (error.code === "23505") {
      // Duplicate key - skip
      return 0;
    }
    console.error(`  ⚠️  خطأ في إدراج البيانات: ${error.message}`);
    // جرب إدراج صف واحد في كل مرة
    let successCount = 0;
    for (const row of data) {
      try {
        const rowValues = columns.map((col) => {
          const value = row[col];
          if (value === null || value === undefined) return null;
          if (value instanceof Date) return value.toISOString();
          if (Buffer.isBuffer(value)) return value.toString("utf8");
          return value;
        });
        const singleQuery = `INSERT INTO "${tableName}" (${columnsStr}) VALUES (${columns
          .map((_, i) => `$${i + 1}`)
          .join(", ")}) ON CONFLICT DO NOTHING`;
        await pgPool.query(singleQuery, rowValues);
        successCount++;
      } catch (err: any) {
        if (err.code !== "23505") {
          // تجاهل duplicate key errors
          console.error(`    ⚠️  خطأ في صف: ${err.message}`);
        }
      }
    }
    return successCount;
  }
}

async function migrateData() {
  let mysqlConnection: mysql.Connection | null = null;
  let pgPool: Pool | null = null;

  try {
    console.log("🔌 الاتصال بقاعدة MySQL...");
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log("✅ تم الاتصال بـ MySQL\n");

    console.log("🔌 الاتصال بقاعدة PostgreSQL...");
    pgPool = new Pool(pgConfig);
    await pgPool.query("SELECT 1");
    console.log("✅ تم الاتصال بـ PostgreSQL\n");

    // الحصول على قائمة الجداول
    console.log("📋 جاري الحصول على قائمة الجداول...");
    const tables = await getTableNames(mysqlConnection);
    console.log(`✅ تم العثور على ${tables.length} جدول\n`);

    // تصفية الجداول - تجاهل جداول system
    const systemTables = [
      "__drizzle_migrations",
      "information_schema",
      "performance_schema",
      "mysql",
      "sys",
    ];
    const dataTables = tables.filter(
      (table) => !systemTables.some((st) => table.includes(st))
    );

    console.log(`📊 جاري نقل البيانات من ${dataTables.length} جدول...\n`);

    let totalRows = 0;
    let successTables = 0;
    let failedTables = 0;

    for (const table of dataTables) {
      try {
        console.log(`📦 ${table}...`);
        
        // الحصول على البيانات من MySQL
        const data = await getTableData(mysqlConnection, table);
        
        if (data.length === 0) {
          console.log(`  ⏭️  الجدول فارغ - تم التخطي`);
          continue;
        }

        console.log(`  📥 جاري نقل ${data.length} صف...`);

        // إدراج البيانات في PostgreSQL
        const inserted = await insertDataToPostgres(pgPool, table, data);
        
        if (inserted > 0) {
          console.log(`  ✅ تم نقل ${inserted} صف بنجاح`);
          totalRows += inserted;
          successTables++;
        } else {
          console.log(`  ⚠️  لم يتم نقل أي صف (قد تكون البيانات موجودة مسبقاً)`);
        }
      } catch (error: any) {
        console.error(`  ❌ خطأ في نقل ${table}: ${error.message}`);
        failedTables++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 ملخص عملية النقل:");
    console.log("=".repeat(60));
    console.log(`✅ جداول ناجحة: ${successTables}`);
    console.log(`❌ جداول فاشلة: ${failedTables}`);
    console.log(`📦 إجمالي الصفوف المنقولة: ${totalRows}`);
    console.log("=".repeat(60));

    if (mysqlConnection) await mysqlConnection.end();
    if (pgPool) await pgPool.end();

    console.log("\n🎉 تم إكمال عملية النقل!");
  } catch (error: any) {
    console.error("❌ خطأ عام:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("⚠️  تأكد من أن MySQL و PostgreSQL يعملان");
    }
    if (mysqlConnection) await mysqlConnection.end();
    if (pgPool) await pgPool.end();
    process.exit(1);
  }
}

migrateData();

