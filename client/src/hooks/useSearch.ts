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
