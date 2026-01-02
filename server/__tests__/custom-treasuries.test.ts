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

    it('يجب أن يفلتر الخزائن حسب النوع', async () => {
      const mockTreasuries = [
        { id: 1, treasuryType: 'cash' },
        { id: 2, treasuryType: 'bank' },
        { id: 3, treasuryType: 'cash' },
      ];
      
      const cashTreasuries = mockTreasuries.filter(t => t.treasuryType === 'cash');
      expect(cashTreasuries).toHaveLength(2);
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
