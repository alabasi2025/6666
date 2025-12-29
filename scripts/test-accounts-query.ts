import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq, and } from 'drizzle-orm';
import * as schema from '../drizzle/schemas/customSystemV2';

async function testQuery() {
  let connection: mysql.Connection | null = null;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'energy_management',
    });
    
    console.log('✓ تم الاتصال بقاعدة البيانات\n');
    
    const db = drizzle(connection, { schema, mode: 'default' });
    
    console.log('🔍 اختبار الـ query مع Drizzle:');
    const businessId = 1;
    const subSystemId = 1;
    
    const conditions = [
      eq(schema.customAccounts.businessId, businessId),
      eq(schema.customAccounts.subSystemId, subSystemId)
    ];
    
    console.log('الشروط:', conditions.length);
    console.log('businessId:', businessId);
    console.log('subSystemId:', subSystemId);
    console.log('\n');
    
    const accounts = await db
      .select()
      .from(schema.customAccounts)
      .where(and(...conditions))
      .orderBy(schema.customAccounts.accountCode);
    
    console.log(`✅ نجح! تم العثور على ${accounts.length} حساب:`);
    accounts.forEach(acc => {
      console.log(`  - ${acc.accountCode}: ${acc.accountNameAr}`);
    });
    
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    console.error('تفاصيل الخطأ:', {
      code: error.code,
      sql: error.sql,
      stack: error.stack
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testQuery();

