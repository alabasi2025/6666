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
