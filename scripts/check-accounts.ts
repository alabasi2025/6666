import mysql from 'mysql2/promise';

async function checkAccounts() {
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
    
    // التحقق من الحسابات الموجودة
    const [accounts] = await connection.execute(`
      SELECT id, account_code, account_name_ar, sub_system_id, parent_account_id, level
      FROM custom_accounts
      WHERE account_code LIKE '1010%'
      ORDER BY account_code
    `) as any[];
    
    if (accounts.length === 0) {
      console.log('❌ لا توجد حسابات برمز 1010');
      console.log('الحسابات المطلوبة:');
      console.log('  - 1010: صناديق التحصيل والتوريد (رئيسي)');
      console.log('  - 1010-1: صناديق التحصيل والتوريد الدهمية');
      console.log('  - 1010-2: صناديق التحصيل والتوريد الصبالية');
      console.log('  - 1010-3: صناديق التحصيل والتوريد غليل');
    } else {
      console.log(`✓ تم العثور على ${accounts.length} حساب:`);
      accounts.forEach((acc: any) => {
        console.log(`  - ${acc.account_code}: ${acc.account_name_ar} (ID: ${acc.id}, Level: ${acc.level})`);
      });
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

checkAccounts();

