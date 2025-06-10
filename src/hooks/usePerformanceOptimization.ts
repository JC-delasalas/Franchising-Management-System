
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';

export const useStableCallback = <T extends (...args: any[]) => any>(callback: T): T => {
  const ref = useRef<T>(callback);
  ref.current = callback;
  
  return useCallback(((...args: any[]) => ref.current(...args)) as T, []);
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useMemoizedProps = <T extends Record<string, any>>(props: T): T => {
  return useMemo(() => props, Object.values(props));
};

export const useShallowMemo = <T>(value: T): T => {
  const ref = useRef<T>(value);
  
  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value);
    const hasChanged = keys.some(key => (value as any)[key] !== (ref.current as any)?.[key]);
    
    if (hasChanged) {
      ref.current = value;
    }
  } else if (value !== ref.current) {
    ref.current = value;
  }
  
  return ref.current;
};
