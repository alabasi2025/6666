import express from 'express';
import { db } from '../server/db.js';
import { customAccounts } from '../drizzle/schemas/customSystemV2.js';
import { eq, and } from 'drizzle-orm';

async function testAPIRouteDirect() {
  try {
    console.log('=== اختبار API Route مباشرة ===\n');
    
    // محاكاة req و res
    const mockReq = {
      user: { businessId: 1 },
      query: { subSystemId: '1' }
    } as any;
    
    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => {
          console.log(`Response Status: ${code}`);
          console.log('Response Data:', JSON.stringify(data, null, 2));
          return mockRes;
        }
      }),
      json: (data: any) => {
        console.log('Response Data:', JSON.stringify(data, null, 2));
        return mockRes;
      }
    } as any;
    
    console.log('1. فحص req.user.businessId...');
    const businessId = mockReq.user?.businessId;
    if (!businessId) {
      console.error('❌ معرف النشاط التجاري مطلوب');
      process.exit(1);
    }
    console.log(`✓ businessId: ${businessId}\n`);
    
    console.log('2. فحص req.query...');
    const { subSystemId, accountType, isActive } = mockReq.query;
    console.log(`✓ subSystemId: ${subSystemId}`);
    console.log(`✓ accountType: ${accountType}`);
    console.log(`✓ isActive: ${isActive}\n`);
    
    console.log('3. بناء شروط البحث...');
    const conditions = [eq(customAccounts.businessId, businessId)];
    
    if (subSystemId) {
      const subSystemIdValue = parseInt(String(subSystemId));
      conditions.push(eq(customAccounts.subSystemId, subSystemIdValue));
    }
    
    if (accountType) {
      const accountTypeValue = String(accountType) as "asset" | "liability" | "equity" | "revenue" | "expense";
      conditions.push(eq(customAccounts.accountType, accountTypeValue));
    }
    
    if (isActive !== undefined) {
      conditions.push(eq(customAccounts.isActive, isActive === "true"));
    }
    
    console.log(`✓ عدد الشروط: ${conditions.length}\n`);
    
    console.log('4. تنفيذ الـ query...');
    const accounts = await db
      .select()
      .from(customAccounts)
      .where(and(...conditions))
      .orderBy(customAccounts.accountCode);
    
    console.log(`✅ نجح! تم العثور على ${accounts.length} حساب:`);
    accounts.forEach((acc: any) => {
      console.log(`  - ${acc.accountCode}: ${acc.accountNameAr}`);
    });
    console.log('');
    
    console.log('5. إرسال الـ response...');
    mockRes.json(accounts);
    
    console.log('\n✅ انتهى الاختبار بنجاح');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL:', error.sql);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// تعيين DATABASE_URL إذا لم يكن موجوداً
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://root@localhost:3306/energy_management';
}

testAPIRouteDirect();

