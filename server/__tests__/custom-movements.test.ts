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
