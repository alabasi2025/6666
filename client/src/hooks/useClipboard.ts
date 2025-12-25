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
