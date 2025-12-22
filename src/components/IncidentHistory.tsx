import { Incident } from '@/types/status';
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';

interface IncidentItemProps {
  incident: Incident;
}

const severityConfig = {
  minor: {
    icon: AlertTriangle,
    color: 'text-status-degraded',
    bg: 'bg-status-degraded-bg',
    border: 'border-l-status-degraded',
  },
  major: {
    icon: AlertTriangle,
    color: 'text-status-degraded',
    bg: 'bg-status-degraded-bg',
    border: 'border-l-status-degraded',
  },
  critical: {
    icon: XCircle,
    color: 'text-status-down',
    bg: 'bg-status-down-bg',
    border: 'border-l-status-down',
  },
};

function IncidentItem({ incident }: IncidentItemProps) {
  const config = severityConfig[incident.severity];
  const Icon = incident.status === 'resolved' ? CheckCircle2 : config.icon;
  const isResolved = incident.status === 'resolved';

  const duration = incident.resolvedAt
    ? intervalToDuration({
        start: new Date(incident.startedAt),
        end: new Date(incident.resolvedAt),
      })
    : null;

  const durationText = duration
    ? formatDuration(duration, { format: ['hours', 'minutes'] })
    : null;

  return (
    <article
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-all',
        isResolved
          ? 'border-border bg-secondary/20 opacity-70 hover:opacity-100'
          : cn('border-l-2', config.border, config.bg)
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded-md shrink-0',
          isResolved ? 'bg-status-up-bg' : config.bg
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4',
            isResolved ? 'text-status-up' : config.color
          )}
        />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground leading-tight">
            {incident.title}
          </h4>
          <span
            className={cn(
              'shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium',
              isResolved
                ? 'bg-status-up-bg text-status-up'
                : 'bg-status-degraded-bg text-status-degraded'
            )}
          >
            {isResolved ? 'Resolved' : 'Ongoing'}
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {incident.description}
        </p>
        
        <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground/70">{incident.serviceName}</span>
          
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(incident.startedAt), { addSuffix: true })}
          </span>

          {incident.resolvedAt && durationText && (
            <span className="text-status-up flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {durationText}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

interface IncidentHistoryProps {
  incidents: Incident[];
}

export function IncidentHistory({ incidents }: IncidentHistoryProps) {
  const ongoingIncidents = incidents.filter(i => i.status === 'ongoing');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').slice(0, 5);

  if (incidents.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Incident History</h2>
        <div className="py-8 text-center border border-dashed border-border rounded-lg">
          <CheckCircle2 className="h-6 w-6 text-status-up/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No incidents recorded</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-foreground">Incident History</h2>
      
      {ongoingIncidents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-medium text-status-down uppercase tracking-wider flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-down opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-down" />
            </span>
            Ongoing
          </h3>
          <div className="space-y-2">
            {ongoingIncidents.map((incident) => (
              <IncidentItem key={incident.id} incident={incident} />
            ))}
          </div>
        </div>
      )}

      {resolvedIncidents.length > 0 && (
        <div className="space-y-2">
          {ongoingIncidents.length > 0 && (
            <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider pt-2">
              Resolved
            </h3>
          )}
          <div className="space-y-2">
            {resolvedIncidents.map((incident) => (
              <IncidentItem key={incident.id} incident={incident} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
