import mysql from 'mysql2/promise';

async function insertAccountTypes() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '666666',
    charset: 'utf8mb4'
  });

  try {
    // حذف البيانات الموجودة
    await connection.execute('TRUNCATE TABLE custom_account_types');
    console.log('✓ تم حذف البيانات القديمة');

    // إدراج البيانات الجديدة
    const accountTypes = [
      { code: 'asset', nameAr: 'أصول', nameEn: 'Assets', color: '#10b981', icon: 'TrendingUp', order: 1 },
      { code: 'liability', nameAr: 'التزامات', nameEn: 'Liabilities', color: '#ef4444', icon: 'TrendingDown', order: 2 },
      { code: 'equity', nameAr: 'حقوق ملكية', nameEn: 'Equity', color: '#8b5cf6', icon: 'Users', order: 3 },
      { code: 'revenue', nameAr: 'إيرادات', nameEn: 'Revenue', color: '#3b82f6', icon: 'ArrowUpCircle', order: 4 },
      { code: 'expense', nameAr: 'مصروفات', nameEn: 'Expenses', color: '#f59e0b', icon: 'ArrowDownCircle', order: 5 }
    ];

    for (const type of accountTypes) {
      await connection.execute(
        `INSERT INTO custom_account_types 
        (business_id, type_code, type_name_ar, type_name_en, color, icon, display_order, is_active, is_system_type)
        VALUES (1, ?, ?, ?, ?, ?, ?, 1, 1)`,
        [type.code, type.nameAr, type.nameEn, type.color, type.icon, type.order]
      );
      console.log(`✓ تم إدراج: ${type.nameAr}`);
    }

    console.log('\n✅ تم إدراج جميع أنواع الحسابات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await connection.end();
  }
}

insertAccountTypes();
