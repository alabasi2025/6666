import { Client } from 'pg';
import 'dotenv/config';
import { logger } from './server/utils/logger';

async function insertSampleStations() {
  const pgConfig = {
    connectionString: process.env.DATABASE_URL,
  };

  const pgClient = new Client(pgConfig);

  try {
    await pgClient.connect();
    logger.info("✅ تم الاتصال بـ PostgreSQL");

    // Check existing stations
    const existing = await pgClient.query('SELECT COUNT(*) as count FROM stations');
    const count = parseInt(existing.rows[0]?.count || '0');
    logger.info(`\n📊 عدد المحطات الحالي: ${count}`);

    if (count > 0) {
      logger.info("✅ المحطات موجودة بالفعل");
      const sample = await pgClient.query('SELECT id, code, name_ar, business_id FROM stations LIMIT 5');
      logger.info("\n📋 عينة من المحطات:");
      sample.rows.forEach((row, i) => {
        logger.info(`  ${i + 1}. ID: ${row.id}, Code: ${row.code}, Name: ${row.name_ar}, Business: ${row.business_id}`);
      });
      return;
    }

    // Get businesses to link stations
    const businesses = await pgClient.query('SELECT id, code, name_ar FROM businesses LIMIT 5');
    if (businesses.rows.length === 0) {
      logger.error("❌ لا توجد شركات في قاعدة البيانات. يجب إضافة شركات أولاً.");
      return;
    }

    logger.info(`\n📋 الشركات المتاحة: ${businesses.rows.length}`);
    businesses.rows.forEach(b => {
      logger.info(`  - ID: ${b.id}, Code: ${b.code}, Name: ${b.name_ar}`);
    });

    // Get branches
    const branches = await pgClient.query('SELECT id, code, name_ar, business_id FROM branches LIMIT 10');
    logger.info(`\n📋 الفروع المتاحة: ${branches.rows.length}`);

    // Insert sample stations
    logger.info("\n📤 إضافة محطات تجريبية...");
    
    const sampleStations = [
      {
        business_id: businesses.rows[0]?.id || 1,
        branch_id: branches.rows.find(b => b.business_id === businesses.rows[0]?.id)?.id || null,
        code: 'ST001',
        name_ar: 'محطة تجريبية 1',
        name_en: 'Sample Station 1',
        type: 'transmission',
        status: 'active',
        is_active: true,
      },
      {
        business_id: businesses.rows[0]?.id || 1,
        branch_id: branches.rows.find(b => b.business_id === businesses.rows[0]?.id)?.id || null,
        code: 'ST002',
        name_ar: 'محطة تجريبية 2',
        name_en: 'Sample Station 2',
        type: 'distribution',
        status: 'active',
        is_active: true,
      },
    ];

    for (const station of sampleStations) {
      try {
        await pgClient.query(`
          INSERT INTO stations (
            business_id, branch_id, code, name_ar, name_en, 
            type, status, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `, [
          station.business_id,
          station.branch_id,
          station.code,
          station.name_ar,
          station.name_en,
          station.type,
          station.status,
          station.is_active,
        ]);
        logger.info(`  ✅ تم إضافة: ${station.code} - ${station.name_ar}`);
      } catch (error: any) {
        logger.error(`  ❌ خطأ في إضافة ${station.code}: ${error.message}`);
      }
    }

    // Verify
    const final = await pgClient.query('SELECT COUNT(*) as count FROM stations');
    logger.info(`\n✅ عدد المحطات بعد الإضافة: ${parseInt(final.rows[0]?.count || '0')}`);

  } catch (error) {
    logger.error("❌ خطأ:", { error });
  } finally {
    await pgClient.end();
  }
}

insertSampleStations();

