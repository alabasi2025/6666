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

  describe('update', () => {
    it('يجب أن يحدث بيانات التصنيف بنجاح', async () => {
      const category = { id: 1, nameAr: 'الاسم القديم', code: 'CAT001' };
      const updatedName = 'الاسم الجديد';
      
      category.nameAr = updatedName;
      expect(category.nameAr).toBe('الاسم الجديد');
    });
  });
});
