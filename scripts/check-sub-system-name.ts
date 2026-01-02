import mysql from 'mysql2/promise';

async function checkSubSystemName() {
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
    
    // التحقق من النظام الفرعي برقم 1
    const [subSystems] = await connection.execute(`
      SELECT id, name_ar, name_en, code, description
      FROM custom_sub_systems
      WHERE id = 1
    `) as any[];
    
    if (subSystems.length > 0) {
      const sub = subSystems[0];
      console.log(`\nالنظام الفرعي برقم ID = 1:`);
      console.log(`  - الاسم بالعربية: ${sub.name_ar || 'غير محدد'}`);
      console.log(`  - الاسم بالإنجليزية: ${sub.name_en || 'غير محدد'}`);
      console.log(`  - الرمز: ${sub.code || 'غير محدد'}`);
      console.log(`  - الوصف: ${sub.description || 'غير محدد'}`);
    } else {
      console.log('\n❌ لا يوجد نظام فرعي برقم ID = 1');
    }
    
    // التحقق من جميع الأنظمة الفرعية
    const [allSubSystems] = await connection.execute(`
      SELECT id, name_ar, name_en, code
      FROM custom_sub_systems
      ORDER BY id
    `) as any[];
    
    console.log(`\nجميع الأنظمة الفرعية (${allSubSystems.length}):`);
    allSubSystems.forEach((sub: any) => {
      console.log(`  - ID: ${sub.id} | ${sub.name_ar || sub.name_en || 'بدون اسم'} (${sub.code || 'بدون رمز'})`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSubSystemName();

