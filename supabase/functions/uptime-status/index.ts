import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MONITOR_ID = "802022031";
const API_URL = "https://api.uptimerobot.com/v2/getMonitors";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate last 30 days dates
function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

// Parse logs to determine daily status
function parseLogs(logs: any[], days: string[]): { date: string; status: 'up' | 'down' | 'degraded'; uptime: number }[] {
  const dayStatus: Record<string, { downMinutes: number; degradedMinutes: number }> = {};
  
  // Initialize all days as fully operational
  days.forEach(day => {
    dayStatus[day] = { downMinutes: 0, degradedMinutes: 0 };
  });

  // Process logs - type 1 = down, type 2 = up
  logs.forEach((log: any) => {
    if (log.type === 1) { // Down event
      const startDate = new Date(log.datetime * 1000);
      const duration = log.duration || 0; // duration in seconds
      const endDate = new Date(startDate.getTime() + duration * 1000);
      
      // Mark affected days
      let current = new Date(startDate);
      while (current <= endDate) {
        const dayKey = current.toISOString().split('T')[0];
        if (dayStatus[dayKey]) {
          // Calculate minutes down for this day
          const dayStart = new Date(dayKey);
          const dayEnd = new Date(dayKey);
          dayEnd.setDate(dayEnd.getDate() + 1);
          
          const effectiveStart = startDate > dayStart ? startDate : dayStart;
          const effectiveEnd = endDate < dayEnd ? endDate : dayEnd;
          
          const minutesDown = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / 60000);
          dayStatus[dayKey].downMinutes += minutesDown;
        }
        current.setDate(current.getDate() + 1);
      }
    }
  });

  // Convert to array with status
  return days.map(day => {
    const { downMinutes } = dayStatus[day];
    const totalMinutes = 24 * 60;
    const uptime = Math.max(0, Math.min(100, ((totalMinutes - downMinutes) / totalMinutes) * 100));
    
    let status: 'up' | 'down' | 'degraded' = 'up';
    if (downMinutes > 60) status = 'down';
    else if (downMinutes > 0) status = 'degraded';
    
    return { date: day, status, uptime };
  });
}

// Extract incidents from logs
function parseIncidents(logs: any[], monitorName: string): any[] {
  const incidents: any[] = [];
  
  // type 1 = down, type 2 = up (recovery)
  logs.forEach((log: any, index: number) => {
    if (log.type === 1) { // Down event
      const startDate = new Date(log.datetime * 1000);
      const duration = log.duration || 0;
      const resolvedAt = duration > 0 ? new Date(startDate.getTime() + duration * 1000) : null;
      
      // Determine severity based on duration
      let severity: 'minor' | 'major' | 'critical' = 'minor';
      if (duration > 3600) severity = 'critical'; // > 1 hour
      else if (duration > 600) severity = 'major'; // > 10 minutes
      
      incidents.push({
        id: `incident-${log.datetime}`,
        serviceId: 'bloby-eu',
        serviceName: monitorName,
        status: resolvedAt ? 'resolved' : 'ongoing',
        title: resolvedAt ? 'Service Outage' : 'Ongoing Outage',
        description: log.reason?.detail || 'Service was unreachable',
        startedAt: startDate.toISOString(),
        resolvedAt: resolvedAt?.toISOString() || null,
        severity,
      });
    }
  });
  
  // Sort by start time descending (newest first)
  return incidents.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("UPTIMEROBOT_API_KEY");
    
    if (!apiKey) {
      console.error("UPTIMEROBOT_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "API key missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching UptimeRobot data for monitor:", MONITOR_ID);

    const body = new URLSearchParams({
      api_key: apiKey,
      monitors: MONITOR_ID,
      format: "json",
      response_times: "1",
      response_times_limit: "1",
      all_time_uptime_ratio: "1",
      custom_uptime_ratios: "30-90",
      logs: "1",
      logs_limit: "50",
    });

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = await res.json();
    console.log("UptimeRobot response stat:", data.stat);

    if (data.stat === "fail") {
      console.error("UptimeRobot error:", data.error);
      return new Response(
        JSON.stringify({ error: data.error?.message || "UptimeRobot API error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const monitor = data?.monitors?.[0];
    
    if (!monitor) {
      return new Response(
        JSON.stringify({ error: "Monitor not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [uptime30d, uptime90d] = monitor.custom_uptime_ratio?.split("-").map(Number) ?? [null, null];
    const status = monitor.status === 2 ? "up" : monitor.status === 8 ? "degraded" : "down";
    
    // Generate 30 day history
    const last30Days = getLast30Days();
    const history = parseLogs(monitor.logs || [], last30Days);
    const incidents = parseIncidents(monitor.logs || [], monitor.friendly_name || "bloby.eu");
    
    console.log("Parsed incidents:", incidents.length);

    return new Response(
      JSON.stringify({
        id: monitor.id,
        name: monitor.friendly_name || "bloby.eu",
        url: monitor.url,
        status,
        latency: monitor.response_times?.[0]?.value ?? null,
        uptime30d,
        uptime90d,
        allTimeUptime: monitor.all_time_uptime_ratio ? Number(monitor.all_time_uptime_ratio) : null,
        lastCheck: new Date().toISOString(),
        history,
        incidents,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in uptime-status function:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});