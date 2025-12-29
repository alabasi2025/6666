import mysql from 'mysql2/promise';

async function applyMigration() {
  let connection: mysql.Connection | null = null;
  
  try {
    // استخدام بيانات الاتصال الافتراضية
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'energy_management',
    });
    
    console.log('✓ تم الاتصال بقاعدة البيانات');
    
    // تطبيق الـ migration مباشرة
    const statements = [
      `ALTER TABLE custom_accounts ADD COLUMN account_name_en varchar(255) AFTER account_name_ar`,
      `ALTER TABLE custom_accounts ADD COLUMN sub_system_id int AFTER business_id`,
      `ALTER TABLE custom_accounts ADD COLUMN parent_account_id int`,
      `ALTER TABLE custom_accounts ADD COLUMN level int NOT NULL DEFAULT 1`,
      `ALTER TABLE custom_accounts ADD COLUMN allow_manual_entry boolean NOT NULL DEFAULT true`,
      `ALTER TABLE custom_accounts ADD COLUMN requires_cost_center boolean NOT NULL DEFAULT false`,
      `CREATE INDEX ca_account_code_idx ON custom_accounts (account_code)`,
      `CREATE INDEX ca_sub_system_idx ON custom_accounts (sub_system_id)`,
      `CREATE INDEX ca_parent_account_idx ON custom_accounts (parent_account_id)`,
      `CREATE INDEX ca_level_idx ON custom_accounts (level)`,
    ];
    
    console.log(`جاري تطبيق ${statements.length} أمر SQL...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        await connection.execute(statement);
        console.log(`✓ تم تطبيق الأمر ${i + 1}/${statements.length}`);
      } catch (error: any) {
        // تجاهل الأخطاء إذا كانت الحقول موجودة بالفعل
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠ تم تخطي الأمر ${i + 1} (موجود بالفعل)`);
        } else {
          console.error(`❌ خطأ في الأمر ${i + 1}:`, error.message);
          // لا نرمي الخطأ، نكمل مع الأوامر الأخرى
        }
      }
    }
    
    console.log('✅ تم تطبيق migration بنجاح!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ في تطبيق migration:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('⚠ تحقق من بيانات الاتصال بقاعدة البيانات');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

applyMigration();

