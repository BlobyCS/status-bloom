export type ServiceStatus = 'up' | 'degraded' | 'down';

export interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  status: ServiceStatus;
  latency: number | null;
  lastCheck: string;
  uptime30d: number;
  uptime90d: number;
}

export interface StatusCheck {
  id: string;
  serviceId: string;
  status: ServiceStatus;
  latency: number | null;
  timestamp: string;
  responseCode: number | null;
  errorMessage: string | null;
}

export interface Incident {
  id: string;
  serviceId: string;
  serviceName: string;
  status: 'ongoing' | 'resolved';
  title: string;
  description: string;
  startedAt: string;
  resolvedAt: string | null;
  severity: 'minor' | 'major' | 'critical';
}

export interface UptimeDay {
  date: string;
  status: ServiceStatus;
  uptime: number;
}

export interface SystemStatus {
  overall: ServiceStatus;
  message: string;
  servicesUp: number;
  servicesTotal: number;
}
