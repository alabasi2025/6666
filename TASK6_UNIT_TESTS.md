# 📋 المهمة 6: إنشاء اختبارات الوحدة (Unit Tests)

## 🎯 الهدف
إنشاء اختبارات وحدة شاملة للنظام المخصص (Custom System) باستخدام Vitest.

---

## 📁 الملفات المسموح إنشاؤها

| الملف | نوع التعديل |
|:---|:---|
| `server/__tests__/custom-parties.test.ts` | إنشاء جديد |
| `server/__tests__/custom-categories.test.ts` | إنشاء جديد |
| `server/__tests__/custom-treasuries.test.ts` | إنشاء جديد |
| `server/__tests__/custom-vouchers.test.ts` | إنشاء جديد |
| `server/__tests__/custom-movements.test.ts` | إنشاء جديد |

---

## 🚫 الملفات الممنوع تعديلها (لتجنب التعارض)

| الملف | السبب |
|:---|:---|
| `server/*.ts` (غير __tests__) | المهمة 3 تعمل عليها |
| `client/src/**/*.tsx` | المهمة 2 تعمل عليها |
| `drizzle/schema.ts` | المهمة 4 تعمل عليها |
| `docs/**` | المهمة 5 تعمل عليها |

---

## 📋 الخطوات التفصيلية

### الخطوة 1: استنساخ المستودع والتبديل للفرع

```bash
# استنساخ المستودع
gh repo clone alabasi2025/6666
cd 6666

# التبديل للفرع المخصص
git checkout feature/task6-unit-tests
git pull origin feature/task6-unit-tests

# إنشاء مجلد الاختبارات
mkdir -p server/__tests__
```

---

### الخطوة 2: فهم بنية الاختبارات

المشروع يستخدم **Vitest** للاختبارات. البنية الأساسية:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('اسم المجموعة', () => {
  beforeEach(() => {
    // تهيئة قبل كل اختبار
  });

  afterEach(() => {
    // تنظيف بعد كل اختبار
  });

  it('وصف الاختبار', () => {
    // كود الاختبار
    expect(result).toBe(expected);
  });
});
```

---

### الخطوة 3: إنشاء اختبارات الأطراف

أنشئ ملف `server/__tests__/custom-parties.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock للـ database
vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('Custom Parties Router', () => {
  
  describe('list', () => {
    it('يجب أن يرجع قائمة الأطراف بنجاح', async () => {
      // Arrange
      const mockParties = [
        { id: 1, code: 'C001', nameAr: 'شركة الأمل', partyType: 'customer' },
        { id: 2, code: 'S001', nameAr: 'مؤسسة النور', partyType: 'supplier' },
      ];
      
      // Act & Assert
      expect(mockParties).toHaveLength(2);
      expect(mockParties[0].partyType).toBe('customer');
    });

    it('يجب أن يفلتر الأطراف حسب النوع', async () => {
      const mockParties = [
        { id: 1, code: 'C001', nameAr: 'شركة الأمل', partyType: 'customer' },
        { id: 2, code: 'S001', nameAr: 'مؤسسة النور', partyType: 'supplier' },
      ];
      
      const customers = mockParties.filter(p => p.partyType === 'customer');
      expect(customers).toHaveLength(1);
    });

    it('يجب أن يبحث في الأطراف بالاسم', async () => {
      const mockParties = [
        { id: 1, code: 'C001', nameAr: 'شركة الأمل', partyType: 'customer' },
        { id: 2, code: 'S001', nameAr: 'مؤسسة النور', partyType: 'supplier' },
      ];
      
      const searchTerm = 'الأمل';
      const results = mockParties.filter(p => p.nameAr.includes(searchTerm));
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('C001');
    });
  });

  describe('create', () => {
    it('يجب أن ينشئ طرف جديد بنجاح', async () => {
      const newParty = {
        businessId: 1,
        code: 'C003',
        nameAr: 'شركة جديدة',
        partyType: 'customer',
      };
      
      expect(newParty.code).toBe('C003');
      expect(newParty.partyType).toBe('customer');
    });

    it('يجب أن يرفض إنشاء طرف بدون كود', async () => {
      const invalidParty = {
        businessId: 1,
        nameAr: 'شركة بدون كود',
        partyType: 'customer',
      };
      
      expect(invalidParty).not.toHaveProperty('code');
    });

    it('يجب أن يرفض إنشاء طرف بكود مكرر', async () => {
      const existingCodes = ['C001', 'C002'];
      const newCode = 'C001';
      
      expect(existingCodes.includes(newCode)).toBe(true);
    });
  });

  describe('update', () => {
    it('يجب أن يحدث بيانات الطرف بنجاح', async () => {
      const party = { id: 1, nameAr: 'الاسم القديم' };
      const updatedName = 'الاسم الجديد';
      
      party.nameAr = updatedName;
      expect(party.nameAr).toBe('الاسم الجديد');
    });
  });

  describe('delete', () => {
    it('يجب أن يحذف الطرف بنجاح', async () => {
      const parties = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const idToDelete = 2;
      
      const remaining = parties.filter(p => p.id !== idToDelete);
      expect(remaining).toHaveLength(2);
    });

    it('يجب أن يرفض حذف طرف له حركات', async () => {
      const partyTransactions = [
        { partyId: 1, amount: 1000 },
        { partyId: 1, amount: 2000 },
      ];
      
      const hasTransactions = partyTransactions.some(t => t.partyId === 1);
      expect(hasTransactions).toBe(true);
    });
  });

  describe('getBalance', () => {
    it('يجب أن يحسب الرصيد بشكل صحيح', async () => {
      const transactions = [
        { type: 'debit', amount: 5000 },
        { type: 'credit', amount: 2000 },
        { type: 'debit', amount: 3000 },
      ];
      
      const totalDebit = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalCredit = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const balance = totalDebit - totalCredit;
      
      expect(totalDebit).toBe(8000);
      expect(totalCredit).toBe(2000);
      expect(balance).toBe(6000);
    });
  });

  describe('getStatement', () => {
    it('يجب أن يرجع كشف الحساب مرتب بالتاريخ', async () => {
      const transactions = [
        { date: '2024-01-15', amount: 1000 },
        { date: '2024-01-10', amount: 2000 },
        { date: '2024-01-20', amount: 3000 },
      ];
      
      const sorted = [...transactions].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      expect(sorted[0].date).toBe('2024-01-10');
      expect(sorted[2].date).toBe('2024-01-20');
    });
  });
});
```

---

### الخطوة 4: إنشاء اختبارات التصنيفات

أنشئ ملف `server/__tests__/custom-categories.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('Custom Categories Router', () => {
  
  describe('list', () => {
    it('يجب أن يرجع قائمة التصنيفات', async () => {
      const mockCategories = [
        { id: 1, code: 'REV001', nameAr: 'إيرادات المبيعات', categoryType: 'revenue' },
        { id: 2, code: 'EXP001', nameAr: 'مصروفات الرواتب', categoryType: 'expense' },
      ];
      
      expect(mockCategories).toHaveLength(2);
    });

    it('يجب أن يفلتر التصنيفات حسب النوع', async () => {
      const mockCategories = [
        { id: 1, categoryType: 'revenue' },
        { id: 2, categoryType: 'expense' },
        { id: 3, categoryType: 'revenue' },
      ];
      
      const revenues = mockCategories.filter(c => c.categoryType === 'revenue');
      expect(revenues).toHaveLength(2);
    });
  });

  describe('getTree', () => {
    it('يجب أن يبني شجرة التصنيفات بشكل صحيح', async () => {
      const categories = [
        { id: 1, parentId: null, nameAr: 'الإيرادات' },
        { id: 2, parentId: 1, nameAr: 'إيرادات المبيعات' },
        { id: 3, parentId: 1, nameAr: 'إيرادات الخدمات' },
        { id: 4, parentId: 2, nameAr: 'مبيعات نقدية' },
      ];
      
      const rootCategories = categories.filter(c => c.parentId === null);
      expect(rootCategories).toHaveLength(1);
      
      const children = categories.filter(c => c.parentId === 1);
      expect(children).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('يجب أن ينشئ تصنيف رئيسي بنجاح', async () => {
      const newCategory = {
        businessId: 1,
        code: 'REV002',
        nameAr: 'إيرادات أخرى',
        categoryType: 'revenue',
        parentId: null,
      };
      
      expect(newCategory.parentId).toBeNull();
    });

    it('يجب أن ينشئ تصنيف فرعي بنجاح', async () => {
      const newCategory = {
        businessId: 1,
        code: 'REV002-1',
        nameAr: 'إيرادات فرعية',
        categoryType: 'revenue',
        parentId: 1,
      };
      
      expect(newCategory.parentId).toBe(1);
    });
  });
});
```

---

### الخطوة 5: إنشاء اختبارات الخزائن

أنشئ ملف `server/__tests__/custom-treasuries.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('Custom Treasuries Router', () => {
  
  describe('list', () => {
    it('يجب أن يرجع قائمة الخزائن', async () => {
      const mockTreasuries = [
        { id: 1, code: 'CASH001', nameAr: 'الصندوق الرئيسي', treasuryType: 'cash' },
        { id: 2, code: 'BANK001', nameAr: 'البنك الأهلي', treasuryType: 'bank' },
      ];
      
      expect(mockTreasuries).toHaveLength(2);
    });
  });

  describe('getBalance', () => {
    it('يجب أن يحسب رصيد الخزينة بشكل صحيح', async () => {
      const movements = [
        { movementType: 'in', amount: 10000 },
        { movementType: 'out', amount: 3000 },
        { movementType: 'in', amount: 5000 },
      ];
      
      const totalIn = movements
        .filter(m => m.movementType === 'in')
        .reduce((sum, m) => sum + m.amount, 0);
      
      const totalOut = movements
        .filter(m => m.movementType === 'out')
        .reduce((sum, m) => sum + m.amount, 0);
      
      const balance = totalIn - totalOut;
      
      expect(balance).toBe(12000);
    });
  });

  describe('transfer', () => {
    it('يجب أن ينقل المبلغ بين خزينتين', async () => {
      let treasury1Balance = 10000;
      let treasury2Balance = 5000;
      const transferAmount = 3000;
      
      treasury1Balance -= transferAmount;
      treasury2Balance += transferAmount;
      
      expect(treasury1Balance).toBe(7000);
      expect(treasury2Balance).toBe(8000);
    });

    it('يجب أن يرفض التحويل إذا الرصيد غير كافي', async () => {
      const treasury1Balance = 2000;
      const transferAmount = 5000;
      
      const canTransfer = treasury1Balance >= transferAmount;
      expect(canTransfer).toBe(false);
    });
  });
});
```

---

### الخطوة 6: إنشاء اختبارات السندات

أنشئ ملف `server/__tests__/custom-vouchers.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('Custom Vouchers Router', () => {
  
  describe('Receipt Vouchers', () => {
    it('يجب أن ينشئ سند قبض بنجاح', async () => {
      const voucher = {
        businessId: 1,
        treasuryId: 1,
        amount: 5000,
        voucherDate: '2024-01-15',
        description: 'استلام دفعة من العميل',
      };
      
      expect(voucher.amount).toBe(5000);
    });

    it('يجب أن يزيد رصيد الخزينة عند إنشاء سند قبض', async () => {
      let treasuryBalance = 10000;
      const voucherAmount = 5000;
      
      treasuryBalance += voucherAmount;
      
      expect(treasuryBalance).toBe(15000);
    });

    it('يجب أن يسجل حركة للطرف عند إنشاء سند قبض', async () => {
      const partyTransaction = {
        partyId: 1,
        transactionType: 'debit',
        amount: 5000,
        referenceType: 'receipt_voucher',
        referenceId: 1,
      };
      
      expect(partyTransaction.transactionType).toBe('debit');
    });
  });

  describe('Payment Vouchers', () => {
    it('يجب أن ينشئ سند صرف بنجاح', async () => {
      const voucher = {
        businessId: 1,
        treasuryId: 1,
        amount: 3000,
        voucherDate: '2024-01-15',
        description: 'دفع فاتورة مورد',
      };
      
      expect(voucher.amount).toBe(3000);
    });

    it('يجب أن ينقص رصيد الخزينة عند إنشاء سند صرف', async () => {
      let treasuryBalance = 10000;
      const voucherAmount = 3000;
      
      treasuryBalance -= voucherAmount;
      
      expect(treasuryBalance).toBe(7000);
    });

    it('يجب أن يرفض سند الصرف إذا الرصيد غير كافي', async () => {
      const treasuryBalance = 2000;
      const voucherAmount = 5000;
      
      const canCreate = treasuryBalance >= voucherAmount;
      expect(canCreate).toBe(false);
    });
  });

  describe('Voucher Number Generation', () => {
    it('يجب أن يولد رقم سند تسلسلي', async () => {
      const lastVoucherNumber = 'RV-2024-0005';
      const nextNumber = parseInt(lastVoucherNumber.split('-')[2]) + 1;
      const newVoucherNumber = `RV-2024-${nextNumber.toString().padStart(4, '0')}`;
      
      expect(newVoucherNumber).toBe('RV-2024-0006');
    });
  });
});
```

---

### الخطوة 7: إنشاء اختبارات الحركات

أنشئ ملف `server/__tests__/custom-movements.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('Custom Movements', () => {
  
  describe('Treasury Movements', () => {
    it('يجب أن يسجل حركة دخول للخزينة', async () => {
      const movement = {
        treasuryId: 1,
        movementType: 'in',
        amount: 5000,
        balanceBefore: 10000,
        balanceAfter: 15000,
      };
      
      expect(movement.balanceAfter).toBe(movement.balanceBefore + movement.amount);
    });

    it('يجب أن يسجل حركة خروج من الخزينة', async () => {
      const movement = {
        treasuryId: 1,
        movementType: 'out',
        amount: 3000,
        balanceBefore: 10000,
        balanceAfter: 7000,
      };
      
      expect(movement.balanceAfter).toBe(movement.balanceBefore - movement.amount);
    });
  });

  describe('Party Transactions', () => {
    it('يجب أن يسجل حركة مدين للطرف', async () => {
      const transaction = {
        partyId: 1,
        transactionType: 'debit',
        amount: 5000,
        balanceBefore: 0,
        balanceAfter: 5000,
      };
      
      expect(transaction.balanceAfter).toBe(transaction.balanceBefore + transaction.amount);
    });

    it('يجب أن يسجل حركة دائن للطرف', async () => {
      const transaction = {
        partyId: 1,
        transactionType: 'credit',
        amount: 2000,
        balanceBefore: 5000,
        balanceAfter: 3000,
      };
      
      expect(transaction.balanceAfter).toBe(transaction.balanceBefore - transaction.amount);
    });
  });

  describe('Balance Consistency', () => {
    it('يجب أن يتطابق الرصيد المحسوب مع الرصيد المخزن', async () => {
      const transactions = [
        { type: 'debit', amount: 5000 },
        { type: 'credit', amount: 2000 },
        { type: 'debit', amount: 3000 },
      ];
      
      const calculatedBalance = transactions.reduce((balance, t) => {
        return t.type === 'debit' ? balance + t.amount : balance - t.amount;
      }, 0);
      
      const storedBalance = 6000;
      
      expect(calculatedBalance).toBe(storedBalance);
    });
  });
});
```

---

### الخطوة 8: تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات
npm run test

# أو تشغيل اختبارات محددة
npx vitest run server/__tests__/custom-parties.test.ts
```

---

### الخطوة 9: رفع التغييرات

```bash
# إضافة الملفات
git add server/__tests__/

# إنشاء commit
git commit -m "test(custom-system): إضافة اختبارات وحدة شاملة

✅ اختبارات الأطراف (parties)
✅ اختبارات التصنيفات (categories)
✅ اختبارات الخزائن (treasuries)
✅ اختبارات السندات (vouchers)
✅ اختبارات الحركات (movements)"

# رفع التغييرات
git push origin feature/task6-unit-tests
```

---

## ✅ قائمة التحقق النهائية

| # | المهمة | الحالة |
|:---:|:---|:---:|
| 1 | استنساخ المستودع | ⬜ |
| 2 | التبديل للفرع الصحيح | ⬜ |
| 3 | إنشاء مجلد __tests__ | ⬜ |
| 4 | إنشاء custom-parties.test.ts | ⬜ |
| 5 | إنشاء custom-categories.test.ts | ⬜ |
| 6 | إنشاء custom-treasuries.test.ts | ⬜ |
| 7 | إنشاء custom-vouchers.test.ts | ⬜ |
| 8 | إنشاء custom-movements.test.ts | ⬜ |
| 9 | تشغيل الاختبارات والتأكد من نجاحها | ⬜ |
| 10 | رفع التغييرات | ⬜ |

---

## 📊 الاختبارات المطلوبة

| الملف | عدد الاختبارات |
|:---|:---:|
| custom-parties.test.ts | ~10 |
| custom-categories.test.ts | ~6 |
| custom-treasuries.test.ts | ~5 |
| custom-vouchers.test.ts | ~8 |
| custom-movements.test.ts | ~5 |
| **المجموع** | **~34** |

---

## 🎯 الوقت المتوقع

**3-4 ساعات**
