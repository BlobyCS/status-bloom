import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Incident } from '@/types/status';

export interface DayHistory {
  date: string;
  status: 'up' | 'degraded' | 'down';
  uptime: number;
}

export interface UptimeStatus {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'degraded' | 'down';
  latency: number | null;
  uptime30d: number;
  uptime90d: number;
  lastCheck: string;
  allTimeUptime: number;
  history: DayHistory[];
  incidents: Incident[];
}

export function useUptimeStatus() {
  const [data, setData] = useState<UptimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: fnError } = await supabase.functions.invoke('uptime-status');

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      setData(result);
    } catch (err) {
      console.error('Error fetching uptime status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { data, loading, error, refetch: fetchStatus };
}
