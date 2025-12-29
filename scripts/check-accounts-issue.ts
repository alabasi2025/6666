import mysql from 'mysql2/promise';

async function checkIssue() {
  let connection: mysql.Connection | null = null;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'energy_management',
    });
    
    console.log('✓ تم الاتصال بقاعدة البيانات\n');
    
    // التحقق من الأنظمة الفرعية
    const [subSystems] = await connection.execute(`
      SELECT id, name_ar, name_en, code
      FROM custom_sub_systems
      ORDER BY id
    `) as any[];
    
    console.log('الأنظمة الفرعية الموجودة في قاعدة البيانات:');
    if (subSystems.length === 0) {
      console.log('  ❌ لا توجد أنظمة فرعية في قاعدة البيانات!');
    } else {
      subSystems.forEach((sub: any) => {
        console.log(`  - ID: ${sub.id} | ${sub.name_ar || sub.name_en || 'بدون اسم'}`);
      });
    }
    
    // التحقق من الحسابات
    const [accounts] = await connection.execute(`
      SELECT id, account_code, account_name_ar, sub_system_id
      FROM custom_accounts
      WHERE account_code LIKE '1010%'
      ORDER BY account_code
    `) as any[];
    
    console.log(`\nالحسابات المضافة (${accounts.length} حساب):`);
    accounts.forEach((acc: any) => {
      console.log(`  - ${acc.account_code}: ${acc.account_name_ar}`);
      console.log(`    sub_system_id: ${acc.sub_system_id}`);
    });
    
    // التحقق من النظام الفرعي "أعمال الحديدة" في الواجهة
    // قد يكون موجوداً في جدول آخر أو في نظام آخر
    console.log('\nالتحقق من جداول أخرى...');
    
    // البحث في جميع الجداول عن "أعمال الحديدة"
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'energy_management'
      AND TABLE_NAME LIKE '%sub%' OR TABLE_NAME LIKE '%system%'
    `) as any[];
    
    console.log('الجداول المتعلقة:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.TABLE_NAME}`);
    });
    
    // محاولة العثور على النظام الفرعي في جدول آخر
    try {
      const [altSubSystems] = await connection.execute(`
        SELECT * FROM custom_sub_systems LIMIT 10
      `) as any[];
      
      if (altSubSystems.length > 0) {
        console.log('\nبيانات الأنظمة الفرعية:');
        altSubSystems.forEach((sub: any, index: number) => {
          console.log(`  ${index + 1}.`, sub);
        });
      }
    } catch (error: any) {
      console.log(`\n⚠ لا يمكن قراءة custom_sub_systems: ${error.message}`);
    }
    
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

checkIssue();

