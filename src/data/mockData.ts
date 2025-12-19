import { Service, Incident, UptimeDay, SystemStatus } from '@/types/status';

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'API Gateway',
    description: 'Main REST API endpoint for all services',
    url: 'https://api.bloby.eu/health',
    status: 'up',
    latency: 45,
    lastCheck: new Date().toISOString(),
    uptime30d: 99.98,
    uptime90d: 99.95,
  },
  {
    id: '2',
    name: 'Web Application',
    description: 'Primary web application frontend',
    url: 'https://app.bloby.eu',
    status: 'up',
    latency: 120,
    lastCheck: new Date().toISOString(),
    uptime30d: 99.99,
    uptime90d: 99.97,
  },
  {
    id: '3',
    name: 'Database Cluster',
    description: 'PostgreSQL database cluster',
    url: 'https://db.bloby.eu/health',
    status: 'up',
    latency: 12,
    lastCheck: new Date().toISOString(),
    uptime30d: 100,
    uptime90d: 99.99,
  },
  {
    id: '4',
    name: 'CDN',
    description: 'Content delivery network for static assets',
    url: 'https://cdn.bloby.eu/health',
    status: 'degraded',
    latency: 250,
    lastCheck: new Date().toISOString(),
    uptime30d: 99.85,
    uptime90d: 99.90,
  },
  {
    id: '5',
    name: 'Authentication Service',
    description: 'OAuth2 and SSO authentication provider',
    url: 'https://auth.bloby.eu/health',
    status: 'up',
    latency: 35,
    lastCheck: new Date().toISOString(),
    uptime30d: 99.99,
    uptime90d: 99.98,
  },
];

export const mockIncidents: Incident[] = [
  {
    id: '1',
    serviceId: '4',
    serviceName: 'CDN',
    status: 'ongoing',
    title: 'Elevated latency on CDN nodes',
    description: 'We are investigating increased response times on some CDN edge nodes.',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    severity: 'minor',
  },
  {
    id: '2',
    serviceId: '1',
    serviceName: 'API Gateway',
    status: 'resolved',
    title: 'API Gateway timeout errors',
    description: 'Some requests to the API Gateway experienced timeout errors due to a configuration issue.',
    startedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
    severity: 'major',
  },
  {
    id: '3',
    serviceId: '3',
    serviceName: 'Database Cluster',
    status: 'resolved',
    title: 'Scheduled maintenance completed',
    description: 'Database cluster underwent scheduled maintenance for version upgrade.',
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    severity: 'minor',
  },
];

export function generateUptimeData(days: number): UptimeDay[] {
  const data: UptimeDay[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const rand = Math.random();
    let status: 'up' | 'degraded' | 'down';
    let uptime: number;
    
    if (rand > 0.05) {
      status = 'up';
      uptime = 99.5 + Math.random() * 0.5;
    } else if (rand > 0.01) {
      status = 'degraded';
      uptime = 95 + Math.random() * 4;
    } else {
      status = 'down';
      uptime = 80 + Math.random() * 15;
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      status,
      uptime: Math.round(uptime * 100) / 100,
    });
  }
  
  return data;
}

export function calculateSystemStatus(services: Service[]): SystemStatus {
  const servicesUp = services.filter(s => s.status === 'up').length;
  const servicesDegraded = services.filter(s => s.status === 'degraded').length;
  const servicesDown = services.filter(s => s.status === 'down').length;
  
  let overall: 'up' | 'degraded' | 'down';
  let message: string;
  
  if (servicesDown > 0) {
    overall = 'down';
    message = `${servicesDown} service${servicesDown > 1 ? 's' : ''} experiencing issues`;
  } else if (servicesDegraded > 0) {
    overall = 'degraded';
    message = `${servicesDegraded} service${servicesDegraded > 1 ? 's' : ''} with degraded performance`;
  } else {
    overall = 'up';
    message = 'All systems operational';
  }
  
  return {
    overall,
    message,
    servicesUp,
    servicesTotal: services.length,
  };
}
