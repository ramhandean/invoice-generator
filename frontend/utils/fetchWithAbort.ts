import { useEffect, useRef, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance';

/**
 * Hook to fetch data with AbortController for race condition prevention
 * @param url - API endpoint URL
 * @param enabled - Whether to fetch or not (default: true)
 */
export function useFetchWithAbort<T>(
  url: string,
  enabled: boolean = true,
  onSuccess?: (data: T) => void,
  onError?: (error: any) => void
) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await axiosInstance.get<T>(url, {
        signal: abortControllerRef.current.signal,
      });

      if (isMountedRef.current && onSuccess) {
        onSuccess(response.data);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && isMountedRef.current && onError) {
        onError(error);
      }
    }
  }, [url, enabled, onSuccess, onError]);

  return fetchData;
}
