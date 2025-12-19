import { Service } from '@/types/status';
import { StatusBadge } from './StatusIndicator';
import { Clock, Globe, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const formatLatency = (latency: number | null) => {
    if (latency === null) return '—';
    return `${latency}ms`;
  };

  return (
    <div
      className={cn(
        'group p-5 rounded-xl border bg-card transition-all duration-300',
        'hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5',
        'animate-fade-in'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-foreground truncate">
              {service.name}
            </h3>
            <StatusBadge status={service.status} />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {service.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              <span className="font-mono">{formatLatency(service.latency)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {new Date(service.lastCheck).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              <span className="font-mono truncate max-w-[150px]">
                {new URL(service.url).hostname}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-foreground font-mono">
            {service.uptime30d.toFixed(2)}%
          </div>
          <div className="text-xs text-muted-foreground">30d uptime</div>
        </div>
      </div>
    </div>
  );
}

interface ServiceListProps {
  services: Service[];
}

export function ServiceList({ services }: ServiceListProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Services</h2>
        <span className="text-sm text-muted-foreground">
          {services.length} monitored
        </span>
      </div>
      <div className="grid gap-4">
        {services.map((service, index) => (
          <div
            key={service.id}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ServiceCard service={service} />
          </div>
        ))}
      </div>
    </section>
  );
}
