import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('UPTIMEROBOT_API_KEY');
    
    if (!apiKey) {
      console.error('UPTIMEROBOT_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Monitor ID for bloby.eu
    const monitorId = 'm802022031-0f970a766a44ddf4f9672bf0';

    console.log('Fetching UptimeRobot data for monitor:', monitorId);

    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api_key: apiKey,
        monitors: monitorId,
        format: 'json',
        response_times: '1',
        response_times_limit: '1',
        all_time_uptime_ratio: '1',
        custom_uptime_ratios: '30-90',
      }).toString(),
    });

    const data = await response.json();
    console.log('UptimeRobot response:', JSON.stringify(data));

    if (data.stat !== 'ok') {
      console.error('UptimeRobot error:', data.error);
      return new Response(JSON.stringify({ error: data.error?.message || 'API error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const monitor = data.monitors?.[0];
    
    if (!monitor) {
      return new Response(JSON.stringify({ error: 'Monitor not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // UptimeRobot status codes:
    // 0 = paused, 1 = not checked yet, 2 = up, 8 = seems down, 9 = down
    let status: 'up' | 'degraded' | 'down';
    switch (monitor.status) {
      case 2:
        status = 'up';
        break;
      case 8:
        status = 'degraded';
        break;
      case 9:
      case 0:
      case 1:
      default:
        status = 'down';
        break;
    }

    const uptimeRatios = monitor.custom_uptime_ratio?.split('-').map(Number) || [99, 99];
    const latency = monitor.response_times?.[0]?.value || null;

    const result = {
      id: monitor.id.toString(),
      name: monitor.friendly_name || 'bloby.eu',
      url: monitor.url,
      status,
      latency,
      uptime30d: uptimeRatios[0] || 99,
      uptime90d: uptimeRatios[1] || 99,
      lastCheck: new Date().toISOString(),
      allTimeUptime: parseFloat(monitor.all_time_uptime_ratio) || 99,
    };

    console.log('Returning result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in uptime-status function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
