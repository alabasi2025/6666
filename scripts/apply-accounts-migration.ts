import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

async function applyMigration() {
  try {
    console.log('جاري تطبيق migration للحسابات...');
    
    // التحقق من وجود الحقول أولاً
    const [columns] = await db.execute(sql`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'custom_accounts'
    `) as any[];
    
    const existingColumns = columns.map((col: any) => col.COLUMN_NAME);
    console.log('الحقول الموجودة:', existingColumns);
    
    // إعادة تسمية الحقول القديمة إذا كانت موجودة
    if (existingColumns.includes('account_number') && !existingColumns.includes('account_code')) {
      console.log('إعادة تسمية account_number إلى account_code...');
      await db.execute(sql`ALTER TABLE custom_accounts CHANGE COLUMN account_number account_code varchar(50) NOT NULL`);
    }
    
    if (existingColumns.includes('account_name') && !existingColumns.includes('account_name_ar')) {
      console.log('إعادة تسمية account_name إلى account_name_ar...');
      await db.execute(sql`ALTER TABLE custom_accounts CHANGE COLUMN account_name account_name_ar varchar(255) NOT NULL`);
    }
    
    // إضافة الحقول الجديدة إذا لم تكن موجودة
    if (!existingColumns.includes('account_name_en')) {
      console.log('إضافة account_name_en...');
      await db.execute(sql`ALTER TABLE custom_accounts ADD COLUMN account_name_en varchar(255) AFTER account_name_ar`);
    }
    
    if (!existingColumns.includes('sub_system_id')) {
      console.log('إضافة sub_system_id...');
      await db.execute(sql`ALTER TABLE custom_accounts ADD COLUMN sub_system_id int AFTER business_id`);
    }
    
    if (!existingColumns.includes('parent_account_id')) {
      console.log('إضافة parent_account_id...');
      await db.execute(sql`ALTER TABLE custom_accounts ADD COLUMN parent_account_id int AFTER parent_id`);
    }
    
    if (!existingColumns.includes('level')) {
      console.log('إضافة level...');
      await db.execute(sql`ALTER TABLE custom_accounts ADD COLUMN level int NOT NULL DEFAULT 1 AFTER parent_account_id`);
    }
    
    if (!existingColumns.includes('allow_manual_entry')) {
      console.log('إضافة allow_manual_entry...');
      await db.execute(sql`ALTER TABLE custom_accounts ADD COLUMN allow_manual_entry boolean NOT NULL DEFAULT true`);
    }
    
    if (!existingColumns.includes('requires_cost_center')) {
      console.log('إضافة requires_cost_center...');
      await db.execute(sql`ALTER TABLE custom_accounts ADD COLUMN requires_cost_center boolean NOT NULL DEFAULT false`);
    }
    
    // إضافة indexes
    try {
      await db.execute(sql`CREATE INDEX IF NOT EXISTS ca_account_code_idx ON custom_accounts (account_code)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS ca_sub_system_idx ON custom_accounts (sub_system_id)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS ca_parent_account_idx ON custom_accounts (parent_account_id)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS ca_level_idx ON custom_accounts (level)`);
    } catch (error: any) {
      if (!error.message?.includes('Duplicate key')) {
        console.log('⚠ تحذير في إضافة indexes:', error.message);
      }
    }

    console.log('✅ تم تطبيق migration بنجاح!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ في تطبيق migration:', error.message);
    process.exit(1);
  }
}

applyMigration();
