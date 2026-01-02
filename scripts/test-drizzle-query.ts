import { db } from '../server/db.js';
import { customAccounts } from '../drizzle/schemas/customSystemV2.js';
import { eq, and } from 'drizzle-orm';

async function testDrizzleQuery() {
  try {
    console.log('اختبار Drizzle query...');
    
    const businessId = 1;
    const subSystemId = 1;
    
    const conditions = [eq(customAccounts.businessId, businessId)];
    if (subSystemId) {
      conditions.push(eq(customAccounts.subSystemId, parseInt(String(subSystemId))));
    }
    
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
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    console.error('SQL:', error.sql);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDrizzleQuery();

