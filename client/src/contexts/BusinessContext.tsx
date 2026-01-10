/**
 * Business Context Provider
 * يوفر معلومات الـ Business الحالية لجميع المكونات
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { trpc } from '../lib/trpc';

// ============================================
// Types
// ============================================

interface Business {
  id: number;
  nameAr: string;
  nameEn?: string | null;
  code?: string | null;
  type?: string | null;
  isActive: boolean;
}

interface BusinessContextType {
  businessId: number;
  business: Business | null;
  isLoading: boolean;
  error: string | null;
  setBusinessId: (id: number) => void;
  refreshBusiness: () => Promise<void>;
}

// ============================================
// Context
// ============================================

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

// ============================================
// Provider Props
// ============================================

interface BusinessProviderProps {
  children: ReactNode;
  defaultBusinessId?: number;
}

// ============================================
// Provider Component
// ============================================

export function BusinessProvider({ children, defaultBusinessId = 1 }: BusinessProviderProps) {
  const [businessId, setBusinessId] = useState<number>(defaultBusinessId);
  const [business, setBusiness] = useState<Business | null>(null);
  
  // ✅ استخدام useQuery hook بدلاً من query مباشرة
  const { data: businesses, isLoading, error: queryError, refetch } = trpc.business.list.useQuery();
  
  // معالجة البيانات عند تغيير businessId أو businesses
  useEffect(() => {
    if (businesses && businesses.length > 0) {
      const selectedBusiness = businesses.find(b => b.id === businessId) || businesses[0];
      setBusiness(selectedBusiness);
      if (selectedBusiness.id !== businessId) {
        setBusinessId(selectedBusiness.id);
      }
    } else if (!isLoading) {
      // إذا لم توجد بيانات بعد التحميل، استخدم القيمة الافتراضية
      setBusiness({
        id: businessId,
        nameAr: 'المحطة الافتراضية',
        nameEn: 'Default Business',
        code: 'BUS001',
        type: 'station',
        isActive: true,
      });
    }
  }, [businesses, businessId, isLoading]);

  // دالة لإعادة تحميل البيانات
  const refreshBusiness = async () => {
    await refetch();
  };
  
  // معالجة الأخطاء
  const error = queryError ? (queryError.message || 'فشل في تحميل بيانات المحطة') : null;

  const value: BusinessContextType = {
    businessId,
    business,
    isLoading,
    error,
    setBusinessId,
    refreshBusiness,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

// ============================================
// Custom Hook
// ============================================

export function useBusinessContext(): BusinessContextType {
  const context = useContext(BusinessContext);
  
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  
  return context;
}

// ============================================
// Convenience Hook (للحصول على businessId مباشرة)
// ============================================

export function useBusinessId(): number {
  const { businessId } = useBusinessContext();
  return businessId;
}

// ============================================
// Export
// ============================================

export default BusinessContext;
