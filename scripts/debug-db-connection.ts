import { db } from '../server/db.js';
import { customAccounts } from '../drizzle/schemas/customSystemV2.js';
import { eq, and } from 'drizzle-orm';

async function debugDbConnection() {
  try {
    console.log('1. فحص db instance...');
    console.log('db type:', typeof db);
    console.log('db:', db);
    
    console.log('\n2. فحص customAccounts schema...');
    console.log('customAccounts:', customAccounts);
    
    console.log('\n3. محاولة تنفيذ query بسيط...');
    const testQuery = await db.execute(`SELECT 1 as test`);
    console.log('✓ Test query نجح:', testQuery);
    
    console.log('\n4. محاولة جلب الحسابات...');
    const businessId = 1;
    const subSystemId = 1;
    
    const conditions = [
      eq(customAccounts.businessId, businessId),
      eq(customAccounts.subSystemId, subSystemId)
    ];
    
    console.log('Conditions:', conditions);
    
    const accounts = await db
      .select()
      .from(customAccounts)
      .where(and(...conditions))
      .orderBy(customAccounts.accountCode);
    
    console.log(`✓ تم العثور على ${accounts.length} حساب:`);
    accounts.forEach((acc: any) => {
      console.log(`  - ${acc.accountCode}: ${acc.accountNameAr}`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL:', error.sql);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

debugDbConnection();

