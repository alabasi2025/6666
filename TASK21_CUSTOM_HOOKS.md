# 📋 المهمة 21: إنشاء Custom Hooks

## 🎯 الهدف
إنشاء مجموعة من React Custom Hooks القابلة لإعادة الاستخدام.

## 📁 الفرع
```
feature/task21-custom-hooks
```

## ⏱️ الوقت المتوقع
3-4 ساعات

---

## 📂 الملفات المطلوب إنشاؤها

```
client/src/hooks/
├── useDebounce.ts        # تأخير القيم
├── useLocalStorage.ts    # التخزين المحلي
├── usePagination.ts      # التصفح
├── useSearch.ts          # البحث
├── useSort.ts            # الترتيب
├── useFilter.ts          # الفلترة
├── useForm.ts            # النماذج
├── useModal.ts           # النوافذ المنبثقة
├── useToast.ts           # الإشعارات
├── useClipboard.ts       # الحافظة
└── index.ts              # ملف التصدير
```

## 🚫 الملفات الممنوع تعديلها
- `server/**/*`
- `client/src/pages/**/*`
- `client/src/components/**/*` - الموجودة حالياً

---

## 📝 خطوات التنفيذ

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task21-custom-hooks
```

### الخطوة 2: إنشاء المجلد
```bash
mkdir -p client/src/hooks
```

### الخطوة 3: إنشاء ملف useDebounce.ts
```typescript
// client/src/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

/**
 * Hook لتأخير تحديث القيمة
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook لتأخير تنفيذ دالة
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const id = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(id);
  };
}
```

### الخطوة 4: إنشاء ملف useLocalStorage.ts
```typescript
// client/src/hooks/useLocalStorage.ts

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook للتخزين المحلي
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // قراءة القيمة الأولية
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // تحديث القيمة
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.dispatchEvent(new Event('local-storage'));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // حذف القيمة
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  // الاستماع للتغييرات من tabs أخرى
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}
```

### الخطوة 5: إنشاء ملف usePagination.ts
```typescript
// client/src/hooks/usePagination.ts

import { useState, useMemo, useCallback } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  canNextPage: boolean;
  canPrevPage: boolean;
}

/**
 * Hook للتصفح
 */
export function usePagination(
  initialPage: number = 1,
  initialPageSize: number = 10
): PaginationState & PaginationActions {
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItemsState] = useState(0);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / pageSize) || 1,
    [totalItems, pageSize]
  );

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);

  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setPageState(1); // العودة للصفحة الأولى
  }, []);

  const setTotalItems = useCallback((total: number) => {
    setTotalItemsState(total);
  }, []);

  const nextPage = useCallback(() => {
    setPage(page + 1);
  }, [page, setPage]);

  const prevPage = useCallback(() => {
    setPage(page - 1);
  }, [page, setPage]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [setPage, totalPages]);

  const canNextPage = page < totalPages;
  const canPrevPage = page > 1;

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    canNextPage,
    canPrevPage,
  };
}
```

### الخطوة 6: إنشاء ملف useSearch.ts
```typescript
// client/src/hooks/useSearch.ts

import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export interface SearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  debounceMs?: number;
}

export interface SearchResult<T> {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  isSearching: boolean;
  clearSearch: () => void;
}

/**
 * Hook للبحث
 */
export function useSearch<T>({
  data,
  searchFields,
  debounceMs = 300,
}: SearchOptions<T>): SearchResult<T> {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);
  const isSearching = query !== debouncedQuery;

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return data;
    }

    const lowerQuery = debouncedQuery.toLowerCase();

    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      })
    );
  }, [data, debouncedQuery, searchFields]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch,
  };
}
```

### الخطوة 7: إنشاء ملف useSort.ts
```typescript
// client/src/hooks/useSort.ts

import { useState, useMemo, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortState<T> {
  field: keyof T | null;
  direction: SortDirection;
}

export interface SortResult<T> {
  sortedData: T[];
  sortField: keyof T | null;
  sortDirection: SortDirection;
  sort: (field: keyof T) => void;
  clearSort: () => void;
}

/**
 * Hook للترتيب
 */
export function useSort<T>(data: T[], defaultField?: keyof T): SortResult<T> {
  const [sortState, setSortState] = useState<SortState<T>>({
    field: defaultField || null,
    direction: 'asc',
  });

  const sortedData = useMemo(() => {
    if (!sortState.field) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortState.field!];
      const bValue = b[sortState.field!];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue, 'ar');
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue), 'ar');
      }

      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortState]);

  const sort = useCallback((field: keyof T) => {
    setSortState((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const clearSort = useCallback(() => {
    setSortState({ field: null, direction: 'asc' });
  }, []);

  return {
    sortedData,
    sortField: sortState.field,
    sortDirection: sortState.direction,
    sort,
    clearSort,
  };
}
```

### الخطوة 8: إنشاء ملف useFilter.ts
```typescript
// client/src/hooks/useFilter.ts

import { useState, useMemo, useCallback } from 'react';

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';

export interface Filter<T> {
  field: keyof T;
  operator: FilterOperator;
  value: unknown;
}

export interface FilterResult<T> {
  filteredData: T[];
  filters: Filter<T>[];
  addFilter: (filter: Filter<T>) => void;
  removeFilter: (field: keyof T) => void;
  updateFilter: (field: keyof T, value: unknown) => void;
  clearFilters: () => void;
  hasFilters: boolean;
}

/**
 * Hook للفلترة
 */
export function useFilter<T>(data: T[]): FilterResult<T> {
  const [filters, setFilters] = useState<Filter<T>[]>([]);

  const filteredData = useMemo(() => {
    if (filters.length === 0) {
      return data;
    }

    return data.filter((item) =>
      filters.every((filter) => {
        const value = item[filter.field];
        const filterValue = filter.value;

        switch (filter.operator) {
          case 'eq':
            return value === filterValue;
          case 'ne':
            return value !== filterValue;
          case 'gt':
            return (value as number) > (filterValue as number);
          case 'gte':
            return (value as number) >= (filterValue as number);
          case 'lt':
            return (value as number) < (filterValue as number);
          case 'lte':
            return (value as number) <= (filterValue as number);
          case 'in':
            return (filterValue as unknown[]).includes(value);
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          default:
            return true;
        }
      })
    );
  }, [data, filters]);

  const addFilter = useCallback((filter: Filter<T>) => {
    setFilters((prev) => {
      const existing = prev.findIndex((f) => f.field === filter.field);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = filter;
        return updated;
      }
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((field: keyof T) => {
    setFilters((prev) => prev.filter((f) => f.field !== field));
  }, []);

  const updateFilter = useCallback((field: keyof T, value: unknown) => {
    setFilters((prev) =>
      prev.map((f) => (f.field === field ? { ...f, value } : f))
    );
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  return {
    filteredData,
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    hasFilters: filters.length > 0,
  };
}
```

### الخطوة 9: إنشاء ملف useForm.ts
```typescript
// client/src/hooks/useForm.ts

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => FormErrors;
  onSubmit: (values: T) => void | Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldError: (field: keyof T, error: string) => void;
  reset: () => void;
  setValues: (values: Partial<T>) => void;
}

/**
 * Hook للنماذج
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    }
    return true;
  }, [validate, values]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      
      setValuesState((prev) => ({ ...prev, [name]: newValue }));
    },
    []
  );

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateForm();
    },
    [validateForm]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      
      // تحديد جميع الحقول كـ touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  const setFieldValue = useCallback((field: keyof T, value: unknown) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
    setValues,
  };
}
```

### الخطوة 10: إنشاء ملف useModal.ts
```typescript
// client/src/hooks/useModal.ts

import { useState, useCallback } from 'react';

export interface ModalState<T = unknown> {
  isOpen: boolean;
  data: T | null;
}

export interface UseModalReturn<T = unknown> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Hook للنوافذ المنبثقة
 */
export function useModal<T = unknown>(initialOpen = false): UseModalReturn<T> {
  const [state, setState] = useState<ModalState<T>>({
    isOpen: initialOpen,
    data: null,
  });

  const open = useCallback((data?: T) => {
    setState({ isOpen: true, data: data || null });
  }, []);

  const close = useCallback(() => {
    setState({ isOpen: false, data: null });
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  return {
    isOpen: state.isOpen,
    data: state.data,
    open,
    close,
    toggle,
  };
}

/**
 * Hook لإدارة نوافذ متعددة
 */
export function useModals<K extends string>() {
  const [openModals, setOpenModals] = useState<Set<K>>(new Set());

  const open = useCallback((key: K) => {
    setOpenModals((prev) => new Set(prev).add(key));
  }, []);

  const close = useCallback((key: K) => {
    setOpenModals((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const toggle = useCallback((key: K) => {
    setOpenModals((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const isOpen = useCallback((key: K) => openModals.has(key), [openModals]);

  const closeAll = useCallback(() => {
    setOpenModals(new Set());
  }, []);

  return { open, close, toggle, isOpen, closeAll };
}
```

### الخطوة 11: إنشاء ملف useToast.ts
```typescript
// client/src/hooks/useToast.ts

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface UseToastReturn {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  clearAll: () => void;
}

/**
 * Hook للإشعارات
 */
export function useToast(defaultDuration = 5000): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = defaultDuration) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const toast: Toast = { id, type, message, duration };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [defaultDuration, removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => addToast('success', message, duration),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => addToast('error', message, duration),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => addToast('warning', message, duration),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast('info', message, duration),
    [addToast]
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearAll,
  };
}
```

### الخطوة 12: إنشاء ملف useClipboard.ts
```typescript
// client/src/hooks/useClipboard.ts

import { useState, useCallback } from 'react';

export interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * Hook للحافظة
 */
export function useClipboard(resetDelay = 2000): UseClipboardReturn {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        console.warn('Clipboard API not available');
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);

        if (resetDelay > 0) {
          setTimeout(() => {
            setCopied(false);
          }, resetDelay);
        }

        return true;
      } catch (error) {
        console.error('Failed to copy:', error);
        setCopied(false);
        return false;
      }
    },
    [resetDelay]
  );

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  return { copied, copy, reset };
}
```

### الخطوة 13: إنشاء ملف index.ts
```typescript
// client/src/hooks/index.ts

export * from './useDebounce';
export * from './useLocalStorage';
export * from './usePagination';
export * from './useSearch';
export * from './useSort';
export * from './useFilter';
export * from './useForm';
export * from './useModal';
export * from './useToast';
export * from './useClipboard';
```

### الخطوة 14: رفع التغييرات
```bash
git add client/src/hooks/
git commit -m "feat(hooks): إضافة Custom Hooks

- useDebounce: تأخير القيم
- useLocalStorage: التخزين المحلي
- usePagination: التصفح
- useSearch: البحث
- useSort: الترتيب
- useFilter: الفلترة
- useForm: النماذج
- useModal: النوافذ المنبثقة
- useToast: الإشعارات
- useClipboard: الحافظة"

git push origin feature/task21-custom-hooks
```

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء مجلد `client/src/hooks/`
- [ ] إنشاء ملف `useDebounce.ts`
- [ ] إنشاء ملف `useLocalStorage.ts`
- [ ] إنشاء ملف `usePagination.ts`
- [ ] إنشاء ملف `useSearch.ts`
- [ ] إنشاء ملف `useSort.ts`
- [ ] إنشاء ملف `useFilter.ts`
- [ ] إنشاء ملف `useForm.ts`
- [ ] إنشاء ملف `useModal.ts`
- [ ] إنشاء ملف `useToast.ts`
- [ ] إنشاء ملف `useClipboard.ts`
- [ ] إنشاء ملف `index.ts`
- [ ] التأكد من عدم وجود أخطاء TypeScript
- [ ] رفع التغييرات إلى الفرع
