import { Incident } from '@/types/status';
import { AlertTriangle, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';

interface IncidentItemProps {
  incident: Incident;
  index: number;
}

const severityConfig = {
  minor: {
    icon: AlertTriangle,
    color: 'text-status-degraded',
    bg: 'bg-status-degraded-bg',
    label: 'Minor',
  },
  major: {
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    label: 'Major',
  },
  critical: {
    icon: XCircle,
    color: 'text-status-down',
    bg: 'bg-status-down-bg',
    label: 'Critical',
  },
};

function IncidentItem({ incident, index }: IncidentItemProps) {
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
    ? formatDuration(duration, { format: ['days', 'hours', 'minutes'] })
    : null;

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl border transition-all duration-300',
        'bg-card hover:shadow-soft',
        isResolved 
          ? 'border-l-4 border-l-status-up opacity-75 hover:opacity-100' 
          : incident.severity === 'critical'
            ? 'border-l-4 border-l-status-down shadow-glow-sm'
            : 'border-l-4 border-l-status-degraded'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      aria-label={`${isResolved ? 'Resolved' : 'Ongoing'} incident: ${incident.title}`}
    >
      {!isResolved && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-50/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'p-2 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-110',
              isResolved ? 'bg-status-up-bg' : config.bg
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 transition-colors duration-300',
                isResolved ? 'text-status-up' : config.color
              )}
              aria-hidden="true"
            />
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-foreground text-base">
                  {incident.title}
                </h4>
                <span
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    isResolved
                      ? 'bg-status-up-bg text-status-up'
                      : 'bg-status-degraded-bg text-status-degraded animate-pulse-glow'
                  )}
                >
                  {isResolved ? 'Resolved' : 'Ongoing'}
                </span>
              </div>

              {!isResolved && (
                <span
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium',
                    config.bg,
                    config.color
                  )}
                >
                  {config.label}
                </span>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {incident.description}
            </p>
            
            <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{incident.serviceName}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <time dateTime={incident.startedAt}>
                  Started {formatDistanceToNow(new Date(incident.startedAt), { addSuffix: true })}
                </time>
              </div>

              {incident.resolvedAt && durationText && (
                <div className="flex items-center gap-1.5 text-status-up">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Resolved in {durationText}</span>
                </div>
              )}
            </div>
          </div>
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
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  if (incidents.length === 0) {
    return (
      <section className="space-y-6 animate-fade-in" aria-labelledby="incident-history-title">
        <h2 id="incident-history-title" className="text-2xl font-bold text-foreground tracking-tight">
          Incident History
        </h2>
        <p className="text-muted-foreground">No incidents recorded.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 animate-fade-in" aria-labelledby="incident-history-title">
      <h2 id="incident-history-title" className="text-2xl font-bold text-foreground tracking-tight">
        Incident History
      </h2>
      
      {ongoingIncidents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Ongoing</h3>
          {ongoingIncidents.map((incident, index) => (
            <IncidentItem key={incident.id} incident={incident} index={index} />
          ))}
        </div>
      )}

      {resolvedIncidents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Resolved</h3>
          {resolvedIncidents.map((incident, index) => (
            <IncidentItem key={incident.id} incident={incident} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
