import mysql from 'mysql2/promise';

async function verifyAllAccounts() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'energy_management',
    });
    
    console.log('=== التحقق من الحسابات المضافة ===\n');
    
    // الحسابات المطلوبة
    const requiredAccounts = [
      { code: '1010', name: 'صناديق التحصيل والتوريد', level: 1, type: 'رئيسي' },
      { code: '1010-1', name: 'صناديق التحصيل والتوريد الدهمية', level: 2, type: 'فرعي' },
      { code: '1010-2', name: 'صناديق التحصيل والتوريد الصبالية', level: 2, type: 'فرعي' },
      { code: '1010-3', name: 'صناديق التحصيل والتوريد غليل', level: 2, type: 'فرعي' },
    ];
    
    console.log('📋 الحسابات المطلوبة:');
    requiredAccounts.forEach((acc, idx) => {
      console.log(`  ${idx + 1}. ${acc.code}: ${acc.name} (${acc.type}, مستوى ${acc.level})`);
    });
    console.log('');
    
    // التحقق من الحسابات الموجودة
    const [accounts] = await connection.execute(`
      SELECT id, account_code, account_name_ar, sub_system_id, parent_account_id, level, account_type, is_active
      FROM custom_accounts
      WHERE account_code LIKE '1010%'
      ORDER BY account_code
    `) as any[];
    
    console.log(`📊 الحسابات الموجودة في قاعدة البيانات: ${accounts.length}`);
    console.log('');
    
    if (accounts.length === 0) {
      console.log('❌ لا توجد حسابات!');
      await connection.end();
      process.exit(1);
    }
    
    // عرض الحسابات الموجودة
    accounts.forEach((acc: any, idx: number) => {
      const parentInfo = acc.parent_account_id ? ` (الحساب الأب: ${acc.parent_account_id})` : ' (حساب رئيسي)';
      console.log(`  ${idx + 1}. ${acc.account_code}: ${acc.account_name_ar}`);
      console.log(`     - ID: ${acc.id}, المستوى: ${acc.level}, النوع: ${acc.account_type}${parentInfo}`);
      console.log(`     - النظام الفرعي: ${acc.sub_system_id}, الحالة: ${acc.is_active ? 'نشط' : 'غير نشط'}`);
      console.log('');
    });
    
    // التحقق من أن جميع الحسابات المطلوبة موجودة
    const foundCodes = accounts.map((acc: any) => acc.account_code);
    const missingAccounts = requiredAccounts.filter(req => !foundCodes.includes(req.code));
    
    if (missingAccounts.length > 0) {
      console.log('⚠️  الحسابات المفقودة:');
      missingAccounts.forEach(acc => {
        console.log(`  - ${acc.code}: ${acc.name}`);
      });
      console.log('');
    } else {
      console.log('✅ جميع الحسابات المطلوبة موجودة!\n');
    }
    
    // التحقق من الربط بالنظام الفرعي
    const accountsInSubSystem = accounts.filter((acc: any) => acc.sub_system_id === 1);
    console.log(`📌 الحسابات المرتبطة بالنظام الفرعي "أعمال الحديدة" (sub_system_id=1): ${accountsInSubSystem.length}`);
    
    if (accountsInSubSystem.length !== accounts.length) {
      console.log('⚠️  بعض الحسابات غير مرتبطة بالنظام الفرعي!');
      const notLinked = accounts.filter((acc: any) => acc.sub_system_id !== 1);
      notLinked.forEach(acc => {
        console.log(`  - ${acc.account_code}: ${acc.account_name_ar} (sub_system_id: ${acc.sub_system_id})`);
      });
    } else {
      console.log('✅ جميع الحسابات مرتبطة بالنظام الفرعي "أعمال الحديدة"\n');
    }
    
    await connection.end();
    console.log('✅ انتهى التحقق بنجاح');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

verifyAllAccounts();

