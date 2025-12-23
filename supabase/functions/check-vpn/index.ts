const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IpApiResponse {
  ip: string;
  security?: {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    hosting: boolean;
  };
  error?: boolean;
  reason?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || 'unknown';

    console.log('Checking IP:', clientIp);

    // Skip check for localhost/private IPs
    if (clientIp === 'unknown' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.')) {
      console.log('Skipping VPN check for local IP');
      return new Response(
        JSON.stringify({ allowed: true, ip: clientIp, reason: 'local' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use vpnapi.io free tier (1000 requests/day)
    const vpnApiKey = Deno.env.get('VPNAPI_KEY');
    let isVpn = false;
    let checkMethod = 'none';

    if (vpnApiKey) {
      // Use vpnapi.io if key is available
      const response = await fetch(`https://vpnapi.io/api/${clientIp}?key=${vpnApiKey}`);
      const data = await response.json() as IpApiResponse;
      
      console.log('VPN API response:', JSON.stringify(data));

      if (data.security) {
        isVpn = data.security.vpn || data.security.proxy || data.security.tor;
        checkMethod = 'vpnapi.io';
      }
    } else {
      // Fallback: use ip-api.com (free, no key needed, but less accurate)
      const response = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,proxy,hosting`);
      const data = await response.json();
      
      console.log('IP-API response:', JSON.stringify(data));

      if (data.status === 'success') {
        isVpn = data.proxy || data.hosting;
        checkMethod = 'ip-api.com';
      }
    }

    if (isVpn) {
      console.log('VPN/Proxy detected for IP:', clientIp);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          ip: clientIp, 
          reason: 'vpn_detected',
          message: 'Access denied. VPN or proxy detected.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('IP allowed:', clientIp, 'method:', checkMethod);
    return new Response(
      JSON.stringify({ allowed: true, ip: clientIp }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('VPN check error:', error);
    // On error, allow access (fail open for availability)
    return new Response(
      JSON.stringify({ allowed: true, error: 'check_failed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
