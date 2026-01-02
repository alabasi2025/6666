import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function addMainAccount() {
  let connection: mysql.Connection | null = null;
  
  try {
    // الاتصال بقاعدة البيانات
    const dbUrl = process.env.DATABASE_URL || 'mysql://root@localhost:3306/energy_management';
    
    // تحليل DATABASE_URL
    let host = 'localhost';
    let port = 3306;
    let user = 'root';
    let password = '';
    let database = 'energy_management';
    
    try {
      const url = new URL(dbUrl);
      host = url.hostname;
      port = url.port ? parseInt(url.port) : 3306;
      user = url.username || 'root';
      password = url.password || '';
      database = url.pathname.replace('/', '') || 'energy_management';
    } catch (e) {
      // إذا فشل تحليل URL، استخدام القيم الافتراضية
      console.log('⚠️  استخدام القيم الافتراضية للاتصال بقاعدة البيانات');
    }
    
    console.log(`🔌 الاتصال بقاعدة البيانات: ${user}@${host}:${port}/${database}`);
    
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });
    
    console.log('✓ تم الاتصال بقاعدة البيانات');
    
    // البحث عن النظام الفرعي "أعمال الحديدة"
    const [subSystems] = await connection.execute(`
      SELECT id, code, name_ar, name_en, business_id
      FROM custom_sub_systems
      WHERE name_ar LIKE '%حديدة%' OR name_ar LIKE '%حديده%' OR name_en LIKE '%Hadidah%' OR name_en LIKE '%Hadida%'
      ORDER BY id
    `) as any[];
    
    if (subSystems.length === 0) {
      console.log('❌ لم يتم العثور على النظام الفرعي "أعمال الحديدة"');
      console.log('\nالأنظمة الفرعية الموجودة:');
      const [allSubSystems] = await connection.execute(`
        SELECT id, code, name_ar, name_en
        FROM custom_sub_systems
        ORDER BY name_ar
      `) as any[];
      allSubSystems.forEach((sub: any) => {
        console.log(`  - ${sub.id}: ${sub.name_ar} (${sub.name_en || 'N/A'}) - Code: ${sub.code}`);
      });
      process.exit(1);
      return;
    }
    
    const subSystem = subSystems[0];
    console.log(`✓ تم العثور على النظام الفرعي: ${subSystem.name_ar} (ID: ${subSystem.id}, Code: ${subSystem.code})`);
    
    // الحصول على businessId
    const businessId = subSystem.business_id;
    console.log(`✓ Business ID: ${businessId}`);
    
    // طلب بيانات الحساب من المستخدم
    console.log('\n📝 إدخال بيانات الحساب الرئيسي:');
    console.log('النظام الفرعي: أعمال الحديدة');
    console.log('نوع الحساب: رئيسي (parentAccountId = null, level = 1)');
    
    // بيانات الحساب الافتراضية (يمكن تعديلها)
    const accountData = {
      businessId: businessId,
      subSystemId: subSystem.id,
      accountNumber: '1000', // رمز الحساب الرئيسي
      accountName: 'حساب رئيسي - أعمال الحديدة', // الاسم بالعربية
      accountType: 'asset', // نوع الحساب: asset, liability, equity, revenue, expense
      parentId: null, // حساب رئيسي (لا يوجد حساب أب)
      level: 1, // المستوى الأول
      description: 'حساب رئيسي للنظام الفرعي أعمال الحديدة',
      isActive: true,
      createdBy: 1, // يمكن تعديله حسب المستخدم الحالي
    };
    
    // التحقق من عدم وجود حساب بنفس الرمز
    const [existing] = await connection.execute(`
      SELECT id, account_number, account_name
      FROM custom_accounts
      WHERE business_id = ? AND account_number = ?
    `, [businessId, accountData.accountNumber]) as any[];
    
    if (existing.length > 0) {
      console.log(`\n⚠️  تحذير: يوجد حساب بنفس الرمز "${accountData.accountNumber}":`);
      console.log(`   ID: ${existing[0].id}, الاسم: ${existing[0].account_name}`);
      console.log('\nهل تريد المتابعة؟ (سيتم تحديث الحساب الموجود)');
      // في حالة الإنتاج، يمكن إضافة تأكيد من المستخدم
    }
    
    // إضافة الحساب
    console.log('\n🔄 جاري إضافة الحساب...');
    
    const [result] = await connection.execute(`
      INSERT INTO custom_accounts (
        business_id,
        account_number,
        account_name,
        account_type,
        parent_id,
        description,
        is_active,
        created_by,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        account_name = VALUES(account_name),
        account_type = VALUES(account_type),
        parent_id = VALUES(parent_id),
        description = VALUES(description),
        is_active = VALUES(is_active),
        updated_at = NOW()
    `, [
      accountData.businessId,
      accountData.accountNumber,
      accountData.accountName,
      accountData.accountType,
      accountData.parentId,
      accountData.description,
      accountData.isActive,
      accountData.createdBy,
    ]) as any;
    
    const accountId = result.insertId || existing[0]?.id;
    
    console.log(`✓ تم إضافة/تحديث الحساب بنجاح!`);
    console.log(`   ID: ${accountId}`);
    console.log(`   الرمز: ${accountData.accountNumber}`);
    console.log(`   الاسم: ${accountData.accountName}`);
    console.log(`   النوع: ${accountData.accountType}`);
    console.log(`   المستوى: ${accountData.level}`);
    console.log(`   النظام الفرعي: ${subSystem.name_ar} (ID: ${subSystem.id})`);
    
    // التحقق من الحساب المضاف
    const [addedAccount] = await connection.execute(`
      SELECT id, account_number, account_name, account_type, parent_id, is_active
      FROM custom_accounts
      WHERE id = ?
    `, [accountId]) as any[];
    
    if (addedAccount.length > 0) {
      console.log('\n✓ تم التحقق من الحساب:');
      console.log(JSON.stringify(addedAccount[0], null, 2));
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addMainAccount();

