import mysql from 'mysql2/promise';

async function addAccounts() {
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
    
    const businessId = 1; // businessId للـ demo user
    const subSystemId = 1; // أعمال الحديدة
    const userId = 1; // created_by
    
    // إضافة الحساب الرئيسي
    console.log('إضافة الحساب الرئيسي...');
    const [mainResult] = await connection.execute(`
      INSERT INTO custom_accounts (
        business_id, sub_system_id, account_code, account_name_ar, account_name_en,
        account_type, parent_account_id, level, description,
        is_active, allow_manual_entry, requires_cost_center, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      businessId, subSystemId, '1010', 'صناديق التحصيل والتوريد', 'Collection and Supply Boxes',
      'asset', null, 1, 'حساب رئيسي لصناديق التحصيل والتوريد',
      true, true, false, userId
    ]) as any;
    
    const mainAccountId = mainResult.insertId;
    console.log(`✓ تم إضافة الحساب الرئيسي (ID: ${mainAccountId})`);
    
    // إضافة الحسابات الفرعية
    const subAccounts = [
      {
        code: '1010-1',
        nameAr: 'صناديق التحصيل والتوريد الدهمية',
        nameEn: 'Collection and Supply Boxes - Dahmiya',
        description: 'حساب فرعي لصناديق التحصيل والتوريد الدهمية'
      },
      {
        code: '1010-2',
        nameAr: 'صناديق التحصيل والتوريد الصبالية',
        nameEn: 'Collection and Supply Boxes - Sabaliya',
        description: 'حساب فرعي لصناديق التحصيل والتوريد الصبالية'
      },
      {
        code: '1010-3',
        nameAr: 'صناديق التحصيل والتوريد غليل',
        nameEn: 'Collection and Supply Boxes - Ghaleel',
        description: 'حساب فرعي لصناديق التحصيل والتوريد غليل'
      }
    ];
    
    for (const subAccount of subAccounts) {
      console.log(`إضافة ${subAccount.nameAr}...`);
      const [subResult] = await connection.execute(`
        INSERT INTO custom_accounts (
          business_id, sub_system_id, account_code, account_name_ar, account_name_en,
          account_type, parent_account_id, level, description,
          is_active, allow_manual_entry, requires_cost_center, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        businessId, subSystemId, subAccount.code, subAccount.nameAr, subAccount.nameEn,
        'asset', mainAccountId, 2, subAccount.description,
        true, true, false, userId
      ]) as any;
      
      console.log(`✓ تم إضافة ${subAccount.nameAr} (ID: ${subResult.insertId})`);
    }
    
    console.log('✅ تم إضافة جميع الحسابات بنجاح!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('⚠ الحساب موجود بالفعل');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addAccounts();

