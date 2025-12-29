import mysql from 'mysql2/promise';

async function debugAccountsAPI() {
  try {
    console.log('=== فحص شامل لمشكلة الحسابات ===\n');
    
    // 1. الاتصال بقاعدة البيانات
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'energy_management',
    });
    
    console.log('✓ تم الاتصال بقاعدة البيانات\n');
    
    // 2. فحص وجود الجدول
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'energy_management' 
      AND TABLE_NAME = 'custom_accounts'
    `) as any[];
    
    if (tables.length === 0) {
      console.error('❌ الجدول custom_accounts غير موجود!');
      await connection.end();
      process.exit(1);
    }
    console.log('✓ الجدول custom_accounts موجود\n');
    
    // 3. فحص بنية الجدول
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'energy_management'
      AND TABLE_NAME = 'custom_accounts'
      ORDER BY ORDINAL_POSITION
    `) as any[];
    
    console.log('📋 بنية الجدول:');
    columns.forEach((col: any) => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`);
    });
    console.log('');
    
    // 4. فحص البيانات الموجودة
    const [accounts] = await connection.execute(`
      SELECT id, business_id, sub_system_id, account_code, account_name_ar, account_type, level
      FROM custom_accounts
      WHERE business_id = 1 AND sub_system_id = 1
      ORDER BY account_code
    `) as any[];
    
    console.log(`📊 عدد الحسابات الموجودة (business_id=1, sub_system_id=1): ${accounts.length}`);
    if (accounts.length > 0) {
      console.log('\nالحسابات:');
      accounts.forEach((acc: any) => {
        console.log(`  - ${acc.account_code}: ${acc.account_name_ar} (id: ${acc.id}, type: ${acc.account_type}, level: ${acc.level})`);
      });
    }
    console.log('');
    
    // 5. اختبار الـ query الذي يستخدمه Drizzle
    console.log('🔍 اختبار الـ query الذي يستخدمه Drizzle:');
    const [testQuery] = await connection.execute(`
      SELECT id, business_id, sub_system_id, account_code, account_name_ar, account_name_en, account_type, parent_account_id, level, description, is_active, allow_manual_entry, requires_cost_center, created_by, created_at, updated_at
      FROM custom_accounts
      WHERE (custom_accounts.business_id = ? AND custom_accounts.sub_system_id = ?)
      ORDER BY custom_accounts.account_code
    `, [1, 1]) as any[];
    
    console.log(`✓ الـ query يعمل بشكل صحيح - عدد النتائج: ${testQuery.length}`);
    if (testQuery.length > 0) {
      console.log('\nالنتائج:');
      testQuery.forEach((acc: any) => {
        console.log(`  - ${acc.account_code}: ${acc.account_name_ar}`);
      });
    }
    console.log('');
    
    // 6. فحص الـ indexes
    const [indexes] = await connection.execute(`
      SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = 'energy_management'
      AND TABLE_NAME = 'custom_accounts'
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `) as any[];
    
    console.log('📑 الـ indexes الموجودة:');
    const indexMap = new Map<string, string[]>();
    indexes.forEach((idx: any) => {
      if (!indexMap.has(idx.INDEX_NAME)) {
        indexMap.set(idx.INDEX_NAME, []);
      }
      indexMap.get(idx.INDEX_NAME)!.push(idx.COLUMN_NAME);
    });
    indexMap.forEach((cols, name) => {
      console.log(`  - ${name}: ${cols.join(', ')}`);
    });
    console.log('');
    
    await connection.end();
    console.log('✅ انتهى الفحص بنجاح');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

debugAccountsAPI();

