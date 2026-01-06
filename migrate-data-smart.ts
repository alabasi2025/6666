import mysql from "mysql2/promise";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const mysqlConfig = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "666666",
};

const pgConfig = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "774424555",
  database: "666666",
};

async function getMySQLColumns(
  connection: mysql.Connection,
  tableName: string
): Promise<string[]> {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    `SHOW COLUMNS FROM \`${tableName}\``
  );
  return rows.map((row) => row.Field as string);
}

async function getPostgresColumns(
  pgPool: Pool,
  tableName: string
): Promise<string[]> {
  const result = await pgPool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = $1
    ORDER BY ordinal_position;
  `, [tableName]);
  return result.rows.map((row) => row.column_name);
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
  data: any[],
  mysqlColumns: string[],
  pgColumns: string[]
): Promise<number> {
  if (data.length === 0) return 0;

  // إنشاء mapping بين أعمدة MySQL و PostgreSQL
  // فقط الأعمدة الموجودة في كلا الجدولين
  const commonColumns = mysqlColumns.filter((col) => pgColumns.includes(col));
  
  if (commonColumns.length === 0) {
    console.log(`    ⚠️  لا توجد أعمدة مشتركة - تم التخطي`);
    return 0;
  }

  const columnsStr = commonColumns.map((col) => `"${col}"`).join(", ");

  // إدراج صف واحد في كل مرة لتجنب الأخطاء
  let successCount = 0;
  for (const row of data) {
    try {
      const values = commonColumns.map((col) => {
        const value = row[col];
        if (value === null || value === undefined) return null;
        if (value instanceof Date) return value.toISOString();
        if (Buffer.isBuffer(value)) {
          try {
            return JSON.parse(value.toString("utf8"));
          } catch {
            return value.toString("utf8");
          }
        }
        return value;
      });

      const placeholders = commonColumns.map((_, i) => `$${i + 1}`).join(", ");
      const query = `INSERT INTO "${tableName}" (${columnsStr}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
      
      await pgPool.query(query, values);
      successCount++;
    } catch (error: any) {
      if (error.code !== "23505") {
        // تجاهل duplicate key errors فقط
        console.log(`    ⚠️  خطأ في صف: ${error.message.substring(0, 100)}`);
      }
    }
  }

  return successCount;
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

    const [tables] = await mysqlConnection.execute<mysql.RowDataPacket[]>(
      "SHOW TABLES"
    );
    const tableNames = tables.map((row) => Object.values(row)[0] as string);

    const systemTables = ["__drizzle_migrations"];
    const dataTables = tableNames.filter(
      (table) => !systemTables.some((st) => table.includes(st))
    );

    console.log(`📊 جاري نقل البيانات من ${dataTables.length} جدول...\n`);

    let totalRows = 0;
    let successTables = 0;
    let skippedTables = 0;

    for (const table of dataTables) {
      try {
        // التحقق من وجود الجدول في PostgreSQL
        const tableExists = await pgPool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);

        if (!tableExists.rows[0].exists) {
          console.log(`📦 ${table}...`);
          console.log(`  ⏭️  الجدول غير موجود في PostgreSQL - تم التخطي`);
          skippedTables++;
          continue;
        }

        console.log(`📦 ${table}...`);

        // الحصول على الأعمدة
        const mysqlColumns = await getMySQLColumns(mysqlConnection, table);
        const pgColumns = await getPostgresColumns(pgPool, table);

        // الحصول على البيانات
        const data = await getTableData(mysqlConnection, table);

        if (data.length === 0) {
          console.log(`  ⏭️  الجدول فارغ - تم التخطي`);
          continue;
        }

        console.log(`  📥 جاري نقل ${data.length} صف...`);

        // إدراج البيانات
        const inserted = await insertDataToPostgres(
          pgPool,
          table,
          data,
          mysqlColumns,
          pgColumns
        );

        if (inserted > 0) {
          console.log(`  ✅ تم نقل ${inserted}/${data.length} صف بنجاح`);
          totalRows += inserted;
          successTables++;
        } else {
          console.log(`  ⚠️  لم يتم نقل أي صف`);
        }
      } catch (error: any) {
        console.error(`  ❌ خطأ: ${error.message.substring(0, 100)}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 ملخص عملية النقل:");
    console.log("=".repeat(60));
    console.log(`✅ جداول ناجحة: ${successTables}`);
    console.log(`⏭️  جداول تم تخطيها: ${skippedTables}`);
    console.log(`📦 إجمالي الصفوف المنقولة: ${totalRows}`);
    console.log("=".repeat(60));

    if (mysqlConnection) await mysqlConnection.end();
    if (pgPool) await pgPool.end();

    console.log("\n🎉 تم إكمال عملية النقل!");
  } catch (error: any) {
    console.error("❌ خطأ عام:", error.message);
    if (mysqlConnection) await mysqlConnection.end();
    if (pgPool) await pgPool.end();
    process.exit(1);
  }
}

migrateData();

