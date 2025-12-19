import { Service } from '@/types/status';
import { StatusBadge } from './StatusIndicator';
import { 
  Clock, 
  Globe, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Activity,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ServiceCardProps {
  service: Service;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function ServiceCard({ service, isExpanded = false, onToggleExpand }: ServiceCardProps) {
  const formatLatency = (latency: number | null) => {
    if (latency === null) return '—';
    return `${latency}ms`;
  };

  const getLatencyStatus = (latency: number | null) => {
    if (latency === null) return 'neutral';
    if (latency < 100) return 'excellent';
    if (latency < 300) return 'good';
    if (latency < 500) return 'fair';
    return 'poor';
  };

  const latencyStatus = getLatencyStatus(service.latency);
  const latencyColor = {
    excellent: 'text-status-up',
    good: 'text-green-600 dark:text-green-400',
    fair: 'text-status-degraded',
    poor: 'text-status-down',
    neutral: 'text-muted-foreground',
  }[latencyStatus];

  const uptimeStatus = service.uptime30d >= 99.9 ? 'excellent' : 
                       service.uptime30d >= 99 ? 'good' : 'needs-attention';

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card transition-all duration-300',
        'hover:shadow-soft-xl hover:border-primary/30',
        isExpanded && 'ring-2 ring-primary/20 shadow-soft-xl',
        service.status === 'down' && 'border-status-down/50 bg-status-down-bg/5',
        service.status === 'degraded' && 'border-status-degraded/50',
      )}
      aria-labelledby={`service-${service.id}-title`}
    >
      {/* Status glow effect for operational services */}
      {service.status === 'up' && (
        <div className="absolute inset-0 bg-gradient-to-r from-status-up/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      {/* Warning stripe for down services */}
      {service.status === 'down' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-status-down via-status-down/50 to-transparent" />
      )}

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 
                    id={`service-${service.id}-title`}
                    className="font-semibold text-foreground truncate text-base"
                  >
                    {service.name}
                  </h3>
                  <StatusBadge status={service.status} />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Latency */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={cn('p-1.5 rounded-md bg-background', latencyColor)}>
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className={cn('text-sm font-semibold font-mono', latencyColor)}>
                    {formatLatency(service.latency)}
                  </div>
                  <div className="text-xs text-muted-foreground">Latency</div>
                </div>
              </div>

              {/* Last Check */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-background text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold font-mono">
                    {new Date(service.lastCheck).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">Last Check</div>
                </div>
              </div>

              {/* 90d Uptime */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-1.5 rounded-md bg-background text-status-up">
                  <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold font-mono text-status-up">
                    {service.uptime90d?.toFixed(2) || '—'}%
                  </div>
                  <div className="text-xs text-muted-foreground">90d</div>
                </div>
              </div>

              {/* Hostname */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group/link">
                <div className="p-1.5 rounded-md bg-background text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <a 
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold truncate block hover:text-primary transition-colors"
                  >
                    {new URL(service.url).hostname}
                    <ExternalLink className="inline h-3 w-3 ml-1 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                  <div className="text-xs text-muted-foreground">Host</div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="pt-4 border-t border-border/50 animate-slide-down space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">All-time uptime:</span>
                    <span className="ml-2 font-semibold font-mono">
                      {service.allTimeUptime?.toFixed(3) || '—'}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Service ID:</span>
                    <span className="ml-2 font-mono text-xs">{service.id}</span>
                  </div>
                </div>

                {service.status === 'down' && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-status-down-bg/50 border border-status-down/20">
                    <AlertCircle className="h-4 w-4 text-status-down shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-status-down">Service is currently down</p>
                      <p className="text-muted-foreground mt-1">
                        Our team has been notified and is working on a resolution.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Uptime Display */}
          <div className="text-right shrink-0">
            <div 
              className={cn(
                'text-3xl font-bold font-mono transition-colors',
                uptimeStatus === 'excellent' && 'text-status-up',
                uptimeStatus === 'good' && 'text-foreground',
                uptimeStatus === 'needs-attention' && 'text-status-degraded',
              )}
            >
              {service.uptime30d.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
              {uptimeStatus === 'excellent' ? (
                <TrendingUp className="h-3 w-3 text-status-up" />
              ) : (
                <TrendingDown className="h-3 w-3 text-status-degraded" />
              )}
              30d uptime
            </div>

            {/* Expand Button */}
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                aria-expanded={isExpanded}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

interface ServiceListProps {
  services: Service[];
}

export function ServiceList({ services }: ServiceListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const operationalCount = services.filter(s => s.status === 'up').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;
  const downCount = services.filter(s => s.status === 'down').length;

  return (
    <section className="space-y-6 animate-fade-in" aria-labelledby="services-title">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 id="services-title" className="text-2xl font-bold text-foreground tracking-tight">
            Services
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time monitoring of all services
          </p>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-2">
          {downCount > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-status-down-bg text-status-down text-xs font-semibold flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-down opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-down"></span>
              </span>
              {downCount} down
            </span>
          )}
          {degradedCount > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-status-degraded-bg text-status-degraded text-xs font-semibold">
              {degradedCount} degraded
            </span>
          )}
          <span className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
            {services.length} total
          </span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-4" role="list">
        {services.map((service, index) => (
          <div
            key={service.id}
            role="listitem"
            style={{ animationDelay: `${index * 50}ms` }}
            className="animate-slide-in"
          >
            <ServiceCard 
              service={service}
              isExpanded={expandedId === service.id}
              onToggleExpand={() => setExpandedId(
                expandedId === service.id ? null : service.id
              )}
            />
          </div>
        ))}

        {services.length === 0 && (
          <div className="p-12 rounded-2xl border bg-card text-center animate-scale-in">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No services configured yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
