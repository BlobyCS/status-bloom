import { Incident } from '@/types/status';
import { AlertTriangle, CheckCircle2, Clock, XCircle, Shield, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';

interface IncidentItemProps {
  incident: Incident;
}

const severityConfig = {
  minor: {
    icon: AlertTriangle,
    color: 'text-status-degraded',
    bg: 'bg-status-degraded',
    bgLight: 'bg-status-degraded-bg',
    label: 'Minor',
  },
  major: {
    icon: Flame,
    color: 'text-status-degraded',
    bg: 'bg-status-degraded',
    bgLight: 'bg-status-degraded-bg',
    label: 'Major',
  },
  critical: {
    icon: XCircle,
    color: 'text-status-down',
    bg: 'bg-status-down',
    bgLight: 'bg-status-down-bg',
    label: 'Critical',
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
        'group relative flex items-start gap-4 p-4 rounded-xl border transition-all',
        isResolved
          ? 'border-border bg-card/50 opacity-60 hover:opacity-100'
          : cn('border-l-2', config.color.replace('text-', 'border-'), config.bgLight)
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
          isResolved 
            ? 'bg-status-up-bg' 
            : cn('bg-gradient-to-br', config.bg.replace('bg-', 'from-'), 'to-primary/50')
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5',
            isResolved ? 'text-status-up' : 'text-white'
          )}
        />
      </div>
      
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground leading-tight">
            {incident.title}
          </h4>
          <span
            className={cn(
              'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
              isResolved
                ? 'bg-status-up-bg text-status-up'
                : 'bg-status-down/10 text-status-down animate-pulse'
            )}
          >
            {isResolved ? 'Resolved' : 'Ongoing'}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {incident.description}
        </p>
        
        <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70 bg-secondary px-2 py-0.5 rounded">
            {incident.serviceName}
          </span>
          
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatDistanceToNow(new Date(incident.startedAt), { addSuffix: true })}
          </span>

          {incident.resolvedAt && durationText && (
            <span className="flex items-center gap-1.5 text-status-up font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Fixed in {durationText}
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
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-status-up/10">
            <Shield className="h-4 w-4 text-status-up" />
          </div>
          <h2 className="font-semibold text-foreground">Incidents</h2>
        </div>
        <div className="py-10 text-center rounded-xl border border-dashed border-border bg-status-up-bg/30">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-status-up-bg mb-3">
            <CheckCircle2 className="h-6 w-6 text-status-up" />
          </div>
          <p className="text-sm font-medium text-status-up">No incidents recorded</p>
          <p className="text-xs text-muted-foreground mt-1">All systems running smoothly</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className={cn(
          'p-2 rounded-lg',
          ongoingIncidents.length > 0 ? 'bg-status-down/10' : 'bg-status-up/10'
        )}>
          <Shield className={cn(
            'h-4 w-4',
            ongoingIncidents.length > 0 ? 'text-status-down' : 'text-status-up'
          )} />
        </div>
        <h2 className="font-semibold text-foreground">Incidents</h2>
        {ongoingIncidents.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-status-down/10 text-status-down text-xs font-bold">
            {ongoingIncidents.length} active
          </span>
        )}
      </div>
      
      {ongoingIncidents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-down opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-down" />
            </span>
            <h3 className="text-xs font-bold text-status-down uppercase tracking-wider">
              Ongoing Issues
            </h3>
          </div>
          <div className="space-y-3">
            {ongoingIncidents.map((incident) => (
              <IncidentItem key={incident.id} incident={incident} />
            ))}
          </div>
        </div>
      )}

      {resolvedIncidents.length > 0 && (
        <div className="space-y-3">
          {ongoingIncidents.length > 0 && (
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pt-2">
              Recently Resolved
            </h3>
          )}
          <div className="space-y-3">
            {resolvedIncidents.map((incident) => (
              <IncidentItem key={incident.id} incident={incident} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
