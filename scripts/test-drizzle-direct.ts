import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { customAccounts } from '../drizzle/schemas/customSystemV2.js';
import { eq, and } from 'drizzle-orm';

async function testDrizzleDirect() {
  try {
    // إنشاء اتصال مباشر
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'energy_management',
    });
    
    const db = drizzle(connection);
    
    console.log('اختبار Drizzle query مباشرة...');
    
    const businessId = 1;
    const subSystemId = 1;
    
    const conditions = [
      eq(customAccounts.businessId, businessId),
      eq(customAccounts.subSystemId, subSystemId)
    ];
    
    console.log('تنفيذ الـ query...');
    const accounts = await db
      .select()
      .from(customAccounts)
      .where(and(...conditions))
      .orderBy(customAccounts.accountCode);
    
    console.log(`✓ تم العثور على ${accounts.length} حساب:`);
    accounts.forEach((acc: any) => {
      console.log(`  - ${acc.accountCode}: ${acc.accountNameAr}`);
    });
    
    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    console.error('SQL:', error.sql);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDrizzleDirect();

