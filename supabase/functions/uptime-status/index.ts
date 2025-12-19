import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Types
interface UptimeRobotMonitor {
  id: number;
  friendly_name: string;
  url: string;
  status: number;
  response_times?: Array<{ value: number }>;
  custom_uptime_ratio?: string;
  all_time_uptime_ratio: string;
}

interface UptimeRobotResponse {
  stat: string;
  monitors?: UptimeRobotMonitor[];
  error?: { message: string };
}

interface MonitorResult {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'degraded' | 'down';
  latency: number | null;
  uptime30d: number;
  uptime90d: number;
  lastCheck: string;
  allTimeUptime: number;
}

// Constants
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Monitor ID without 'm' prefix (UptimeRobot requires numeric ID)
const MONITOR_ID = '802022031';

const UPTIMEROBOT_API_URL = 'https://api.uptimerobot.com/v2/getMonitors';

// Status mapping
const STATUS_MAP: Record<number, 'up' | 'degraded' | 'down'> = {
  2: 'up',      // Up
  8: 'degraded', // Seems down
  9: 'down',    // Down
  0: 'down',    // Paused
  1: 'down',    // Not checked yet
};

// Helper functions
function createJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

function createErrorResponse(message: string, status = 500): Response {
  console.error(`Error (${status}):`, message);
  return createJsonResponse({ error: message }, status);
}

function parseUptimeRatios(ratioString: string | undefined): [number, number] {
  if (!ratioString) return [99, 99];
  
  const ratios = ratioString.split('-').map(Number);
  return [
    ratios[0] ?? 99,
    ratios[1] ?? 99,
  ];
}

function getMonitorStatus(statusCode: number): 'up' | 'degraded' | 'down' {
  return STATUS_MAP[statusCode] ?? 'down';
}

async function fetchUptimeRobotData(apiKey: string, monitorId: string): Promise<UptimeRobotResponse> {
  const params = new URLSearchParams({
    api_key: apiKey,
    monitors: monitorId,
    format: 'json',
    response_times: '1',
    response_times_limit: '1',
    all_time_uptime_ratio: '1',
    custom_uptime_ratios: '30-90',
  });

  const response = await fetch(UPTIMEROBOT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`UptimeRobot API returned ${response.status}: ${response.statusText}`);
  }

  return await response.json() as UptimeRobotResponse;
}

function transformMonitorData(monitor: UptimeRobotMonitor): MonitorResult {
  const [uptime30d, uptime90d] = parseUptimeRatios(monitor.custom_uptime_ratio);
  const status = getMonitorStatus(monitor.status);
  const latency = monitor.response_times?.[0]?.value ?? null;
  const allTimeUptime = parseFloat(monitor.all_time_uptime_ratio) || 99;

  return {
    id: monitor.id.toString(),
    name: monitor.friendly_name || 'bloby.eu',
    url: monitor.url,
    status,
    latency,
    uptime30d,
    uptime90d,
    lastCheck: new Date().toISOString(),
    allTimeUptime,
  };
}

// Main handler
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    // Validate API key
    const apiKey = Deno.env.get('UPTIMEROBOT_API_KEY');
    if (!apiKey) {
      return createErrorResponse('API key not configured', 500);
    }

    console.log(`[${new Date().toISOString()}] Fetching monitor data:`, MONITOR_ID);

    // Fetch data from UptimeRobot
    const data = await fetchUptimeRobotData(apiKey, MONITOR_ID);

    // Validate response
    if (data.stat !== 'ok') {
      const errorMessage = data.error?.message || 'Unknown API error';
      return createErrorResponse(errorMessage, 500);
    }

    // Check if monitor exists
    const monitor = data.monitors?.[0];
    if (!monitor) {
      return createErrorResponse('Monitor not found', 404);
    }

    // Transform and return data
    const result = transformMonitorData(monitor);
    console.log('[Success] Returning monitor data:', result);

    return createJsonResponse(result);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(message, 500);
  }
});

console.log('🚀 Uptime status function is running...');
