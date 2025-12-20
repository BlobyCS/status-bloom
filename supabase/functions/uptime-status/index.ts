import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MONITOR_ID = "802022031";
const API_URL = "https://api.uptimerobot.com/v2/getMonitors";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
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
    });

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = await res.json();
    console.log("UptimeRobot response:", JSON.stringify(data));

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
