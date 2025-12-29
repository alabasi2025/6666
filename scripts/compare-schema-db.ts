import mysql from 'mysql2/promise';

async function compareSchemaDB() {
  try {
    console.log('=== مقارنة الـ Schema مع قاعدة البيانات ===\n');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'energy_management',
    });
    
    // الحقول المتوقعة من الـ schema
    const schemaFields = [
      'id', 'business_id', 'sub_system_id', 'account_code', 'account_name_ar', 
      'account_name_en', 'account_type', 'parent_account_id', 'level', 
      'description', 'is_active', 'allow_manual_entry', 'requires_cost_center', 
      'created_by', 'created_at', 'updated_at'
    ];
    
    // الحقول الموجودة في قاعدة البيانات
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'energy_management'
      AND TABLE_NAME = 'custom_accounts'
      ORDER BY ORDINAL_POSITION
    `) as any[];
    
    const dbFields = columns.map((col: any) => col.COLUMN_NAME);
    
    console.log('📋 الحقول في الـ Schema:', schemaFields.length);
    schemaFields.forEach(field => console.log(`  ✓ ${field}`));
    console.log('');
    
    console.log('📋 الحقول في قاعدة البيانات:', dbFields.length);
    dbFields.forEach(field => console.log(`  ✓ ${field}`));
    console.log('');
    
    // المقارنة
    const missingInDB = schemaFields.filter(f => !dbFields.includes(f));
    const extraInDB = dbFields.filter(f => !schemaFields.includes(f));
    
    if (missingInDB.length > 0) {
      console.log('❌ الحقول الموجودة في الـ Schema لكن غير موجودة في قاعدة البيانات:');
      missingInDB.forEach(field => console.log(`  - ${field}`));
      console.log('');
    }
    
    if (extraInDB.length > 0) {
      console.log('⚠️  الحقول الموجودة في قاعدة البيانات لكن غير موجودة في الـ Schema:');
      extraInDB.forEach(field => {
        const col = columns.find((c: any) => c.COLUMN_NAME === field);
        console.log(`  - ${field} (${col?.DATA_TYPE}, nullable: ${col?.IS_NULLABLE})`);
      });
      console.log('');
    }
    
    if (missingInDB.length === 0 && extraInDB.length === 0) {
      console.log('✅ الـ Schema يطابق قاعدة البيانات تماماً\n');
    }
    
    // اختبار الـ query مع الحقول الصحيحة فقط
    console.log('🔍 اختبار الـ query مع الحقول من الـ Schema فقط:');
    const [testQuery] = await connection.execute(`
      SELECT ${schemaFields.join(', ')}
      FROM custom_accounts
      WHERE business_id = ? AND sub_system_id = ?
      ORDER BY account_code
    `, [1, 1]) as any[];
    
    console.log(`✓ الـ query يعمل - عدد النتائج: ${testQuery.length}`);
    if (testQuery.length > 0) {
      console.log('\nالنتائج:');
      testQuery.forEach((acc: any) => {
        console.log(`  - ${acc.account_code}: ${acc.account_name_ar}`);
      });
    }
    console.log('');
    
    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

compareSchemaDB();

