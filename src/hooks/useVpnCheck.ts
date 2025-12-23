import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VpnCheckResult {
  allowed: boolean;
  ip?: string;
  reason?: string;
  message?: string;
  loading: boolean;
  error?: string;
}

export function useVpnCheck() {
  const [result, setResult] = useState<VpnCheckResult>({ allowed: true, loading: true });

  useEffect(() => {
    const checkVpn = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-vpn');
        
        if (error) {
          console.error('VPN check error:', error);
          // Fail open - allow on error
          setResult({ allowed: true, loading: false, error: error.message });
          return;
        }

        setResult({
          allowed: data.allowed,
          ip: data.ip,
          reason: data.reason,
          message: data.message,
          loading: false,
        });
      } catch (err) {
        console.error('VPN check failed:', err);
        // Fail open
        setResult({ allowed: true, loading: false, error: 'Check failed' });
      }
    };

    checkVpn();
  }, []);

  return result;
}
