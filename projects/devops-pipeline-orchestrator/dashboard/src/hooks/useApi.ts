import { useState, useEffect, useCallback } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function useApi<T>(path: string, interval?: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}${path}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setError(null);
      } else {
        setError(json.error || 'Unknown error');
      }
    } catch (e) {
      setError('Cannot connect to API server');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetch_();
    if (interval) {
      const t = setInterval(fetch_, interval);
      return () => clearInterval(t);
    }
  }, [fetch_, interval]);

  return { data, loading, error, refetch: fetch_ };
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data;
}
