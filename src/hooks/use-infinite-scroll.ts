import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  isFetching: boolean;
  setIsFetching: (isFetching: boolean) => void;
}

export const useInfiniteScroll = (
  callback: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn => {
  const { threshold = 300, enabled = true } = options;
  const [isFetching, setIsFetching] = useState(false);
  const callbackRef = useRef(callback);

  // Actualizar la referencia del callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleScroll = useCallback(() => {
    if (!enabled || isFetching) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold) {
      setIsFetching(true);
      const result = callbackRef.current();
      
      // Si el callback devuelve una promesa, esperamos a que termine
      if (result instanceof Promise) {
        result.finally(() => setIsFetching(false));
      } else {
        setIsFetching(false);
      }
    }
  }, [enabled, isFetching, threshold]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll, enabled]);

  return { isFetching, setIsFetching };
};

// Hook para detectar cuando un elemento es visible en el viewport
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callbackRef.current();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
        ...options,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [options]);

  return targetRef;
};
