import { Client } from 'pg';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import { logger } from './server/utils/logger';

async function checkAllTables() {
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

    // Get all tables from MySQL
    const [mysqlTables] = await mysqlConnection.query("SHOW TABLES");
    const tableNames = (mysqlTables as any[]).map(row => Object.values(row)[0]);

    logger.info(`\n📊 عدد الجداول في MySQL: ${tableNames.length}`);
    
    const tableStats: { table: string; mysqlCount: number; pgCount: number }[] = [];

    for (const tableName of tableNames) {
      try {
        // Count in MySQL
        const [mysqlCountResult] = await mysqlConnection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        const mysqlCount = (mysqlCountResult as any[])[0]?.count || 0;

        // Check if table exists in PostgreSQL
        const pgTableExists = await pgClient.query(`SELECT to_regclass('public."${tableName}"')`);
        if (!pgTableExists.rows[0].to_regclass) {
          tableStats.push({ table: tableName, mysqlCount, pgCount: -1 });
          continue;
        }

        // Count in PostgreSQL
        const pgCountResult = await pgClient.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const pgCount = parseInt(pgCountResult.rows[0]?.count || '0');

        if (mysqlCount > 0 || pgCount > 0) {
          tableStats.push({ table: tableName, mysqlCount, pgCount });
        }
      } catch (error: any) {
        logger.warn(`  ⚠️  خطأ في الجدول ${tableName}: ${error.message}`);
      }
    }

    // Sort by MySQL count descending
    tableStats.sort((a, b) => b.mysqlCount - a.mysqlCount);

    logger.info("\n📋 ملخص الجداول:");
    logger.info("=".repeat(80));
    logger.info(`${"الجدول".padEnd(30)} ${"MySQL".padEnd(10)} ${"PostgreSQL".padEnd(12)} ${"الحالة"}`);
    logger.info("=".repeat(80));

    for (const stat of tableStats) {
      const status = stat.pgCount === -1 
        ? "❌ غير موجود" 
        : stat.mysqlCount === stat.pgCount 
          ? "✅ متطابق" 
          : stat.mysqlCount > stat.pgCount 
            ? `⚠️  ناقص (${stat.mysqlCount - stat.pgCount})` 
            : `ℹ️  أكثر (${stat.pgCount - stat.mysqlCount})`;
      
      logger.info(`${stat.table.padEnd(30)} ${String(stat.mysqlCount).padEnd(10)} ${stat.pgCount === -1 ? "N/A".padEnd(12) : String(stat.pgCount).padEnd(12)} ${status}`);
    }

    // Focus on stations
    logger.info("\n🔍 تفاصيل جدول stations:");
    const stationsStat = tableStats.find(s => s.table === 'stations');
    if (stationsStat) {
      if (stationsStat.mysqlCount > 0 && stationsStat.pgCount === 0) {
        logger.info("⚠️  المحطات موجودة في MySQL لكن غير موجودة في PostgreSQL!");
        logger.info("💡 يجب نقل البيانات");
      } else if (stationsStat.mysqlCount === 0 && stationsStat.pgCount === 0) {
        logger.info("ℹ️  جدول stations فارغ في كلا القاعدتين");
      } else {
        logger.info(`✅ المحطات: MySQL=${stationsStat.mysqlCount}, PostgreSQL=${stationsStat.pgCount}`);
      }
    }

  } catch (error) {
    logger.error("❌ خطأ:", { error });
  } finally {
    if (mysqlConnection) await mysqlConnection.end();
    if (pgClient) await pgClient.end();
  }
}

checkAllTables();

