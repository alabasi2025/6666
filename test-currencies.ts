import { getDb } from './server/db';
import { customCurrencies } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function checkCurrencies() {
  console.log('فحص العملات المتاحة...');

  const db = await getDb();
  if (!db) {
    console.log('❌ لا يمكن الاتصال بقاعدة البيانات');
    return;
  }

  try {
    const currencies = await db.select().from(customCurrencies).where(eq(customCurrencies.businessId, 1));
    console.log(`✅ عدد العملات: ${currencies.length}`);
    currencies.forEach(c => {
      console.log(`  - ${c.code}: ${c.nameAr}`);
    });

    if (currencies.length === 0) {
      console.log('⚠️ لا توجد عملات، قد تحتاج إلى إنشاء عملات أولاً');
    }
  } catch (error) {
    console.log('❌ خطأ في جلب العملات:', error);
  }
}

checkCurrencies().catch(console.error);















