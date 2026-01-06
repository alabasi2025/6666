import { Client as PgClient } from 'pg';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import { logger } from './server/utils/logger';

async function migrateStations() {
  const mysqlConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: '666666',
    charset: 'utf8mb4',
  };

  const pgConfig = {
    connectionString: process.env.DATABASE_URL,
  };

  let mysqlConnection: mysql.Connection | null = null;
  let pgClient: PgClient | null = null;

  try {
    // Connect to MySQL
    logger.info("🔌 الاتصال بقاعدة MySQL...");
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    logger.info("✅ تم الاتصال بـ MySQL");

    // Connect to PostgreSQL
    logger.info("🔌 الاتصال بقاعدة PostgreSQL...");
    pgClient = new PgClient(pgConfig);
    await pgClient.connect();
    logger.info("✅ تم الاتصال بـ PostgreSQL");

    const tableName = "stations";

    // Check if table exists in PostgreSQL
    const pgTableExists = await pgClient.query(`SELECT to_regclass('public."${tableName}"')`);
    if (!pgTableExists.rows[0].to_regclass) {
      logger.error(`❌ الجدول ${tableName} غير موجود في PostgreSQL`);
      return;
    }

    // Get columns from MySQL
    const [mysqlColumnsResult] = await mysqlConnection.query(`SHOW COLUMNS FROM \`${tableName}\``);
    const mysqlColumns = (mysqlColumnsResult as any[]).map(col => col.Field);

    // Get columns from PostgreSQL
    const pgColumnsResult = await pgClient.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = '${tableName}'
      ORDER BY ordinal_position;
    `);
    const pgColumns = pgColumnsResult.rows.map(row => row.column_name);

    // Find common columns
    const commonColumns = mysqlColumns.filter(col => pgColumns.includes(col));

    logger.info(`\n📋 الأعمدة المشتركة (${commonColumns.length}):`);
    logger.info(`   ${commonColumns.join(', ')}`);

    if (commonColumns.length === 0) {
      logger.error("❌ لا توجد أعمدة مشتركة بين MySQL و PostgreSQL");
      return;
    }

    // Check existing data in PostgreSQL
    const existingCount = await pgClient.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const existingRows = parseInt(existingCount.rows[0]?.count || '0');
    
    if (existingRows > 0) {
      logger.info(`\n⚠️  يوجد ${existingRows} صف موجود في PostgreSQL`);
      logger.info("💡 سيتم حذف البيانات الموجودة أولاً...");
      await pgClient.query(`DELETE FROM "${tableName}"`);
      logger.info("✅ تم حذف البيانات الموجودة");
    }

    // Fetch data from MySQL
    logger.info(`\n📥 جاري جلب البيانات من MySQL...`);
    const [rows] = await mysqlConnection.query(`SELECT ${commonColumns.map(col => `\`${col}\``).join(', ')} FROM \`${tableName}\``);

    if ((rows as any[]).length === 0) {
      logger.info("ℹ️  الجدول فارغ في MySQL - لا توجد بيانات للنقل");
      return;
    }

    logger.info(`✅ تم جلب ${(rows as any[]).length} صف من MySQL`);

    // Insert data into PostgreSQL
    logger.info(`\n📤 جاري إدراج البيانات في PostgreSQL...`);
    let rowsMigrated = 0;
    let rowsSkipped = 0;

    for (const row of (rows as any[])) {
      try {
        const columns = commonColumns.map(col => `"${col}"`).join(', ');
        const placeholders = commonColumns.map((_, i) => `$${i + 1}`).join(', ');
        const values = commonColumns.map(col => {
          const value = row[col];
          // Handle null, undefined, and date objects
          if (value === null || value === undefined) return null;
          if (value instanceof Date) return value;
          // Handle MySQL date strings
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
            return new Date(value);
          }
          return value;
        });

        await pgClient.query(
          `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders})`,
          values
        );
        rowsMigrated++;
      } catch (error: any) {
        logger.warn(`  ⚠️  خطأ في صف ID=${row.id || 'unknown'}: ${error.message}`);
        rowsSkipped++;
      }
    }

    logger.info("\n============================================================");
    logger.info("📊 ملخص عملية نقل المحطات:");
    logger.info("============================================================");
    logger.info(`✅ صفوف تم نقلها: ${rowsMigrated}`);
    logger.info(`⏭️  صفوف تم تخطيها: ${rowsSkipped}`);
    logger.info(`📦 إجمالي الصفوف: ${(rows as any[]).length}`);
    logger.info("============================================================");

    // Verify
    const verifyCount = await pgClient.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const finalCount = parseInt(verifyCount.rows[0]?.count || '0');
    logger.info(`\n✅ عدد المحطات في PostgreSQL بعد النقل: ${finalCount}`);

    if (finalCount > 0) {
      const sample = await pgClient.query(`SELECT id, code, name_ar FROM "${tableName}" LIMIT 5`);
      logger.info("\n📋 عينة من المحطات المنقولة:");
      sample.rows.forEach((row, i) => {
        logger.info(`  ${i + 1}. ID: ${row.id}, Code: ${row.code}, Name: ${row.name_ar}`);
      });
    }

    logger.info("\n🎉 تم إكمال عملية نقل المحطات!");

  } catch (error) {
    logger.error("❌ فشل في عملية نقل المحطات:", { error });
  } finally {
    if (mysqlConnection) await mysqlConnection.end();
    if (pgClient) await pgClient.end();
  }
}

migrateStations();

