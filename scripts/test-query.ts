import mysql from 'mysql2/promise';

async function testQuery() {
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
    
    // اختبار الـ query مباشرة
    const [accounts] = await connection.execute(`
      SELECT 
        id, 
        business_id, 
        sub_system_id, 
        account_code, 
        account_name_ar, 
        account_name_en, 
        account_type, 
        parent_account_id, 
        level, 
        description, 
        is_active, 
        allow_manual_entry, 
        requires_cost_center, 
        created_by, 
        created_at, 
        updated_at
      FROM custom_accounts
      WHERE business_id = ? AND sub_system_id = ?
      ORDER BY account_code
    `, [1, 1]) as any[];
    
    console.log(`\n✓ تم العثور على ${accounts.length} حساب:`);
    accounts.forEach((acc: any) => {
      console.log(`  - ${acc.account_code}: ${acc.account_name_ar}`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    console.error('SQL:', error.sql);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testQuery();

