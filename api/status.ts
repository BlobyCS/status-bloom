export const config = { runtime: "edge" };

const MONITOR_ID = "802022031";
const API_URL = "https://api.uptimerobot.com/v2/getMonitors";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const apiKey = process.env.UPTIMEROBOT_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key missing" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
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

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `UptimeRobot HTTP ${res.status}` }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const monitor = data?.monitors?.[0];

    if (!monitor) {
      return new Response(
        JSON.stringify({ error: "Monitor not found" }),
        { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
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
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}
