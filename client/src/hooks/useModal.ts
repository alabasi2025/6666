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
