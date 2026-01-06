import { Client } from 'pg';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import { logger } from './server/utils/logger';

async function checkStations() {
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
  let pgClient: Client | null = null;

  try {
    // Connect to MySQL
    logger.info("🔌 الاتصال بقاعدة MySQL...");
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    logger.info("✅ تم الاتصال بـ MySQL");

    // Connect to PostgreSQL
    logger.info("🔌 الاتصال بقاعدة PostgreSQL...");
    pgClient = new Client(pgConfig);
    await pgClient.connect();
    logger.info("✅ تم الاتصال بـ PostgreSQL");

    // Check stations in MySQL
    const [mysqlStations] = await mysqlConnection.query("SELECT COUNT(*) as count FROM `stations`");
    const mysqlCount = (mysqlStations as any[])[0]?.count || 0;
    logger.info(`\n📊 عدد المحطات في MySQL: ${mysqlCount}`);

    if (mysqlCount > 0) {
      const [mysqlData] = await mysqlConnection.query("SELECT * FROM `stations` LIMIT 5");
      logger.info("📋 عينة من بيانات MySQL:");
      (mysqlData as any[]).forEach((row, i) => {
        logger.info(`  ${i + 1}. ID: ${row.id}, Code: ${row.code}, Name: ${row.name_ar || row.nameAr}`);
      });
    }

    // Check stations in PostgreSQL
    const pgResult = await pgClient.query("SELECT COUNT(*) as count FROM stations");
    const pgCount = parseInt(pgResult.rows[0]?.count || '0');
    logger.info(`\n📊 عدد المحطات في PostgreSQL: ${pgCount}`);

    if (pgCount > 0) {
      const pgData = await pgClient.query("SELECT * FROM stations LIMIT 5");
      logger.info("📋 عينة من بيانات PostgreSQL:");
      pgData.rows.forEach((row, i) => {
        logger.info(`  ${i + 1}. ID: ${row.id}, Code: ${row.code}, Name: ${row.name_ar || row.nameAr}`);
      });
    }

    // Check columns
    logger.info("\n🔍 التحقق من الأعمدة...");
    const [mysqlColumns] = await mysqlConnection.query("SHOW COLUMNS FROM `stations`");
    const mysqlCols = (mysqlColumns as any[]).map(col => col.Field);
    logger.info(`  MySQL: ${mysqlCols.length} عمود`);

    const pgColumns = await pgClient.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'stations'
      ORDER BY ordinal_position;
    `);
    const pgCols = pgColumns.rows.map(row => row.column_name);
    logger.info(`  PostgreSQL: ${pgCols.length} عمود`);

    const commonCols = mysqlCols.filter(col => pgCols.includes(col));
    logger.info(`  الأعمدة المشتركة: ${commonCols.length}`);
    logger.info(`  الأعمدة المشتركة: ${commonCols.join(', ')}`);

    if (mysqlCount > 0 && pgCount === 0) {
      logger.info("\n⚠️  المحطات موجودة في MySQL لكن غير موجودة في PostgreSQL!");
      logger.info("💡 سيتم نقل البيانات الآن...");
      return { shouldMigrate: true, mysqlCount, pgCount, commonCols };
    }

    return { shouldMigrate: false, mysqlCount, pgCount, commonCols };

  } catch (error) {
    logger.error("❌ خطأ:", { error });
    return { shouldMigrate: false, error };
  } finally {
    if (mysqlConnection) await mysqlConnection.end();
    if (pgClient) await pgClient.end();
  }
}

checkStations().then(result => {
  if (result.shouldMigrate) {
    logger.info("\n🚀 بدء عملية النقل...");
    process.exit(0);
  } else {
    process.exit(0);
  }
});

