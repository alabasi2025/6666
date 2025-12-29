import { db } from '../server/db.js';
import { customAccounts } from '../drizzle/schemas/customSystemV2.js';
import { eq, and } from 'drizzle-orm';

async function testDrizzleQueryDirect() {
  try {
    console.log('=== اختبار Drizzle Query مباشرة ===\n');
    
    console.log('1. فحص db instance...');
    console.log('db type:', typeof db);
    console.log('db exists:', !!db);
    console.log('');
    
    console.log('2. فحص customAccounts schema...');
    console.log('customAccounts exists:', !!customAccounts);
    console.log('table name:', customAccounts[Symbol.for('drizzle:Name')]);
    console.log('');
    
    console.log('3. بناء الـ query...');
    const businessId = 1;
    const subSystemId = 1;
    
    const conditions = [
      eq(customAccounts.businessId, businessId),
      eq(customAccounts.subSystemId, subSystemId)
    ];
    
    console.log('Conditions:', conditions.length);
    console.log('');
    
    console.log('4. تنفيذ الـ query...');
    try {
      const accounts = await db
        .select()
        .from(customAccounts)
        .where(and(...conditions))
        .orderBy(customAccounts.accountCode);
      
      console.log(`✅ نجح! تم العثور على ${accounts.length} حساب:`);
      accounts.forEach((acc: any) => {
        console.log(`  - ${acc.accountCode}: ${acc.accountNameAr}`);
      });
    } catch (queryError: any) {
      console.error('❌ فشل الـ query:', queryError.message);
      console.error('Error code:', queryError.code);
      console.error('SQL:', queryError.sql);
      console.error('Stack:', queryError.stack);
      
      // محاولة query بسيط
      console.log('\n5. محاولة query بسيط...');
      try {
        const simpleResult = await db.execute(`SELECT 1 as test`);
        console.log('✅ الـ query البسيط نجح:', simpleResult);
      } catch (simpleError: any) {
        console.error('❌ حتى الـ query البسيط فشل:', simpleError.message);
      }
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ عام:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDrizzleQueryDirect();

