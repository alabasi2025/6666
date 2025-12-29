import mysql from 'mysql2/promise';

async function checkTables() {
  let connection: mysql.Connection | null = null;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'energy_management',
    });
    
    console.log('✓ تم الاتصال بقاعدة البيانات');
    
    // التحقق من الجداول المتعلقة بالأنظمة الفرعية
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'energy_management'
      AND TABLE_NAME LIKE '%sub%' OR TABLE_NAME LIKE '%system%'
      ORDER BY TABLE_NAME
    `) as any[];
    
    console.log('\nالجداول المتعلقة بالأنظمة:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.TABLE_NAME}`);
    });
    
    // محاولة التحقق من جدول custom_sub_systems
    try {
      const [rows] = await connection.execute(`
        SELECT COUNT(*) as count FROM custom_sub_systems
      `) as any[];
      console.log(`\nعدد السجلات في custom_sub_systems: ${rows[0].count}`);
      
      if (rows[0].count > 0) {
        const [data] = await connection.execute(`
          SELECT * FROM custom_sub_systems LIMIT 5
        `) as any[];
        console.log('\nأول 5 سجلات:');
        data.forEach((row: any, index: number) => {
          console.log(`  ${index + 1}. ID: ${row.id}, Name: ${row.name_ar || row.name_en || 'N/A'}`);
        });
      }
    } catch (error: any) {
      console.log(`\n⚠ لا يمكن الوصول إلى custom_sub_systems: ${error.message}`);
    }
    
    // التحقق من الحسابات المضافة
    const [accounts] = await connection.execute(`
      SELECT id, account_code, account_name_ar, sub_system_id
      FROM custom_accounts
      WHERE account_code LIKE '1010%'
      ORDER BY account_code
    `) as any[];
    
    console.log(`\nالحسابات المضافة (sub_system_id = ${accounts[0]?.sub_system_id || 'NULL'}):`);
    accounts.forEach((acc: any) => {
      console.log(`  - ${acc.account_code}: ${acc.account_name_ar} (sub_system_id: ${acc.sub_system_id})`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTables();

