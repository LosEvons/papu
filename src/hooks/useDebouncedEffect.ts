/**
 * Custom hook for debounced effects.
 * Runs the effect after the specified delay and supports cleanup.
 */

import { useEffect, useRef } from 'react';

/**
 * A debounced effect hook that runs the effect callback after the specified delay.
 * Useful for delaying expensive operations like persisting data.
 *
 * @param effect - Effect callback function (can return a cleanup function)
 * @param deps - Dependency array for the effect
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 */
export function useDebouncedEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
  delay: number = 300
): void {
  const cleanupRef = useRef<void | (() => void)>(undefined);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Run cleanup from previous effect if it exists
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current();
      }
      // Run the effect and store its cleanup
      cleanupRef.current = effect();
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps array is intentionally spread to avoid infinite re-renders while still triggering on changes
  }, deps);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current();
      }
    };
  }, []);
}
