import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface UptimeRobotMonitor {
  id: number;
  friendly_name: string;
  url: string;
  status: number;
  response_times?: { value: number }[];
  custom_uptime_ratio?: string;
  all_time_uptime_ratio: string;
}

interface UptimeRobotResponse {
  stat: "ok" | "fail";
  monitors?: UptimeRobotMonitor[];
  error?: { message: string };
}

type MonitorStatus = "up" | "degraded" | "down";

interface MonitorResult {
  id: string;
  name: string;
  url: string;
  status: MonitorStatus;
  latency: number | null;
  uptime30d: number | null;
  uptime90d: number | null;
  allTimeUptime: number | null;
  lastCheck: string;
}

const MONITOR_ID = "802022031";
const API_URL = "https://api.uptimerobot.com/v2/getMonitors";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

const STATUS_MAP: Record<number, MonitorStatus> = {
  2: "up",
  8: "degraded",
  9: "down",
  0: "down",
  1: "down",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });

function parseRatios(ratio?: string): [number | null, number | null] {
  if (!ratio) return [null, null];
  const [r30, r90] = ratio.split("-").map(Number);
  return [
    Number.isFinite(r30) ? r30 : null,
    Number.isFinite(r90) ? r90 : null,
  ];
}

async function fetchMonitor(apiKey: string): Promise<UptimeRobotMonitor> {
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

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = (await res.json()) as UptimeRobotResponse;

  if (data.stat !== "ok" || !data.monitors?.length) {
    throw new Error(data.error?.message || "Monitor not found");
  }

  return data.monitors[0];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const apiKey = Deno.env.get("UPTIMEROBOT_API_KEY");
    if (!apiKey) return json({ error: "API key missing" }, 500);

    const monitor = await fetchMonitor(apiKey);
    const [uptime30d, uptime90d] = parseRatios(monitor.custom_uptime_ratio);

    const result: MonitorResult = {
      id: monitor.id.toString(),
      name: monitor.friendly_name || "bloby.eu",
      url: monitor.url,
      status: STATUS_MAP[monitor.status] ?? "down",
      latency: monitor.response_times?.[0]?.value ?? null,
      uptime30d,
      uptime90d,
      allTimeUptime: Number(monitor.all_time_uptime_ratio) || null,
      lastCheck: new Date().toISOString(),
    };

    return json(result);
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      500,
    );
  }
});
