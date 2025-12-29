import mysql from 'mysql2/promise';

async function checkStructure() {
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
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'energy_management' 
      AND TABLE_NAME = 'custom_accounts'
      ORDER BY ORDINAL_POSITION
    `) as any[];
    
    console.log('الحقول الموجودة في custom_accounts:');
    columns.forEach((col: any) => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}, nullable: ${col.IS_NULLABLE}, default: ${col.COLUMN_DEFAULT})`);
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

checkStructure();

