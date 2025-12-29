import axios from 'axios';

const API_BASE = 'http://localhost:9700/api/custom-system/v2';
const SUB_SYSTEM_ID = 1; // أعمال الحديدة

async function addAccounts() {
  try {
    console.log('جاري إضافة الحسابات...');

    // إضافة الحساب الرئيسي
    const mainAccount = {
      subSystemId: SUB_SYSTEM_ID,
      accountCode: '1010',
      accountNameAr: 'صناديق التحصيل والتوريد',
      accountNameEn: 'Collection and Supply Boxes',
      accountType: 'asset',
      level: 1,
      description: 'حساب رئيسي لصناديق التحصيل والتوريد',
      isActive: true,
      allowManualEntry: true,
      requiresCostCenter: false,
      requiresParty: false,
    };

    console.log('إضافة الحساب الرئيسي...');
    const mainResponse = await axios.post(`${API_BASE}/accounts`, mainAccount);
    console.log('✅ تم إضافة الحساب الرئيسي:', mainResponse.data);
    const mainAccountId = mainResponse.data.id;

    // إضافة الحسابات الفرعية
    const subAccounts = [
      {
        subSystemId: SUB_SYSTEM_ID,
        accountCode: '1010-1',
        accountNameAr: 'صناديق التحصيل والتوريد الدهمية',
        accountNameEn: 'Collection and Supply Boxes - Dahmiya',
        accountType: 'asset',
        parentAccountId: mainAccountId,
        level: 2,
        description: 'حساب فرعي لصناديق التحصيل والتوريد الدهمية',
        isActive: true,
        allowManualEntry: true,
        requiresCostCenter: false,
        requiresParty: false,
      },
      {
        subSystemId: SUB_SYSTEM_ID,
        accountCode: '1010-2',
        accountNameAr: 'صناديق التحصيل والتوريد الصبالية',
        accountNameEn: 'Collection and Supply Boxes - Sabaliya',
        accountType: 'asset',
        parentAccountId: mainAccountId,
        level: 2,
        description: 'حساب فرعي لصناديق التحصيل والتوريد الصبالية',
        isActive: true,
        allowManualEntry: true,
        requiresCostCenter: false,
        requiresParty: false,
      },
      {
        subSystemId: SUB_SYSTEM_ID,
        accountCode: '1010-3',
        accountNameAr: 'صناديق التحصيل والتوريد غليل',
        accountNameEn: 'Collection and Supply Boxes - Ghaleel',
        accountType: 'asset',
        parentAccountId: mainAccountId,
        level: 2,
        description: 'حساب فرعي لصناديق التحصيل والتوريد غليل',
        isActive: true,
        allowManualEntry: true,
        requiresCostCenter: false,
        requiresParty: false,
      },
    ];

    for (const subAccount of subAccounts) {
      console.log(`إضافة ${subAccount.accountNameAr}...`);
      const subResponse = await axios.post(`${API_BASE}/accounts`, subAccount);
      console.log('✅ تم إضافة الحساب الفرعي:', subResponse.data);
    }

    console.log('✅ تم إضافة جميع الحسابات بنجاح!');
  } catch (error: any) {
    console.error('❌ خطأ:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.request) {
      console.error('Request:', error.request);
    }
    process.exit(1);
  }
}

addAccounts();

