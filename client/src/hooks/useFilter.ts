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
