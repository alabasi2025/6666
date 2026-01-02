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
