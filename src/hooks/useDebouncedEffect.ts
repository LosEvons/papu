import { useEffect, useRef } from 'react';

export function useDebouncedEffect(effect: () => void | (() => void), deps: any[], delay = 300) {
  const cleanupRef = useRef<void | (() => void) | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      if (cleanupRef.current) {
        // previous cleanup already run
        cleanupRef.current = null;
      }
      const res = effect();
      cleanupRef.current = typeof res === 'function' ? res : null;
    }, delay);

    return () => {
      clearTimeout(id);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}