import mysql from 'mysql2/promise';

async function checkSubSystem() {
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
    
    // التحقق من النظام الفرعي
    const [subSystems] = await connection.execute(`
      SELECT id, name_ar, name_en, code
      FROM custom_sub_systems
      ORDER BY id
    `) as any[];
    
    console.log('\nالأنظمة الفرعية الموجودة:');
    subSystems.forEach((sub: any) => {
      console.log(`  - ID: ${sub.id} | ${sub.name_ar} (${sub.code || 'بدون رمز'})`);
    });
    
    // التحقق من الحسابات المضافة والنظام الفرعي الخاص بها
    const [accounts] = await connection.execute(`
      SELECT 
        a.id,
        a.account_code,
        a.account_name_ar,
        a.sub_system_id,
        s.name_ar as sub_system_name
      FROM custom_accounts a
      LEFT JOIN custom_sub_systems s ON a.sub_system_id = s.id
      WHERE a.account_code LIKE '1010%'
      ORDER BY a.account_code
    `) as any[];
    
    console.log('\nالحسابات المضافة:');
    accounts.forEach((acc: any) => {
      console.log(`  - ${acc.account_code}: ${acc.account_name_ar}`);
      console.log(`    النظام الفرعي: ${acc.sub_system_name || 'غير محدد'} (ID: ${acc.sub_system_id || 'NULL'})`);
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

checkSubSystem();

