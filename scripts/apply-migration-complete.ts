import mysql from 'mysql2/promise';

async function applyMigration() {
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
    
    // التحقق من الحقول الموجودة
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'energy_management' 
      AND TABLE_NAME = 'custom_accounts'
    `) as any[];
    
    const existingColumns = columns.map((col: any) => col.COLUMN_NAME);
    console.log('الحقول الموجودة:', existingColumns.join(', '));
    
    // إعادة تسمية الحقول القديمة إذا كانت موجودة
    if (existingColumns.includes('account_number') && !existingColumns.includes('account_code')) {
      console.log('إعادة تسمية account_number إلى account_code...');
      try {
        await connection.execute(`ALTER TABLE custom_accounts CHANGE COLUMN account_number account_code varchar(50) NOT NULL`);
        console.log('✓ تم إعادة تسمية account_number');
      } catch (error: any) {
        console.log('⚠ تحذير:', error.message);
      }
    }
    
    if (existingColumns.includes('account_name') && !existingColumns.includes('account_name_ar')) {
      console.log('إعادة تسمية account_name إلى account_name_ar...');
      try {
        await connection.execute(`ALTER TABLE custom_accounts CHANGE COLUMN account_name account_name_ar varchar(255) NOT NULL`);
        console.log('✓ تم إعادة تسمية account_name');
      } catch (error: any) {
        console.log('⚠ تحذير:', error.message);
      }
    }
    
    // إضافة الحقول الجديدة
    const fieldsToAdd = [
      { name: 'account_name_en', sql: `ALTER TABLE custom_accounts ADD COLUMN account_name_en varchar(255)` },
      { name: 'sub_system_id', sql: `ALTER TABLE custom_accounts ADD COLUMN sub_system_id int AFTER business_id` },
      { name: 'parent_account_id', sql: `ALTER TABLE custom_accounts ADD COLUMN parent_account_id int` },
      { name: 'level', sql: `ALTER TABLE custom_accounts ADD COLUMN level int NOT NULL DEFAULT 1` },
      { name: 'allow_manual_entry', sql: `ALTER TABLE custom_accounts ADD COLUMN allow_manual_entry boolean NOT NULL DEFAULT true` },
      { name: 'requires_cost_center', sql: `ALTER TABLE custom_accounts ADD COLUMN requires_cost_center boolean NOT NULL DEFAULT false` },
    ];

    // تحديث قائمة الحقول بعد إعادة التسمية
    const [updatedColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'energy_management' 
      AND TABLE_NAME = 'custom_accounts'
    `) as any[];
    const updatedExistingColumns = updatedColumns.map((col: any) => col.COLUMN_NAME);

    for (const field of fieldsToAdd) {
      if (!updatedExistingColumns.includes(field.name)) {
        console.log(`إضافة ${field.name}...`);
        try {
          await connection.execute(field.sql);
          console.log(`✓ تم إضافة ${field.name}`);
        } catch (error: any) {
          console.log(`⚠ تحذير في إضافة ${field.name}:`, error.message);
        }
      } else {
        console.log(`✓ ${field.name} موجود بالفعل`);
      }
    }
    
    // إضافة indexes
    const indexes = [
      { name: 'ca_account_code_idx', sql: `CREATE INDEX ca_account_code_idx ON custom_accounts (account_code)` },
      { name: 'ca_sub_system_idx', sql: `CREATE INDEX ca_sub_system_idx ON custom_accounts (sub_system_id)` },
      { name: 'ca_parent_account_idx', sql: `CREATE INDEX ca_parent_account_idx ON custom_accounts (parent_account_id)` },
      { name: 'ca_level_idx', sql: `CREATE INDEX ca_level_idx ON custom_accounts (level)` },
    ];

    for (const index of indexes) {
      try {
        await connection.execute(index.sql);
        console.log(`✓ تم إضافة index ${index.name}`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠ ${index.name} موجود بالفعل`);
        } else {
          console.log(`⚠ تحذير في إضافة ${index.name}:`, error.message);
        }
      }
    }

    console.log('✅ تم تطبيق migration بنجاح!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ في تطبيق migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

applyMigration();

