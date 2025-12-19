import { Incident } from '@/types/status';
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface IncidentItemProps {
  incident: Incident;
}

const severityConfig = {
  minor: {
    icon: AlertTriangle,
    color: 'text-status-degraded',
    bg: 'bg-status-degraded-bg',
  },
  major: {
    icon: AlertTriangle,
    color: 'text-status-degraded',
    bg: 'bg-status-degraded-bg',
  },
  critical: {
    icon: XCircle,
    color: 'text-status-down',
    bg: 'bg-status-down-bg',
  },
};

function IncidentItem({ incident }: IncidentItemProps) {
  const config = severityConfig[incident.severity];
  const Icon = incident.status === 'resolved' ? CheckCircle2 : config.icon;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-l-4 bg-card animate-slide-in',
        incident.status === 'resolved' 
          ? 'border-l-status-up' 
          : incident.severity === 'critical'
            ? 'border-l-status-down'
            : 'border-l-status-degraded'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'p-1.5 rounded-full shrink-0',
            incident.status === 'resolved' ? 'bg-status-up-bg' : config.bg
          )}
        >
          <Icon
            className={cn(
              'h-4 w-4',
              incident.status === 'resolved' ? 'text-status-up' : config.color
            )}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-foreground">{incident.title}</h4>
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                incident.status === 'resolved'
                  ? 'bg-status-up-bg text-status-up'
                  : 'bg-status-degraded-bg text-status-degraded'
              )}
            >
              {incident.status === 'resolved' ? 'Resolved' : 'Ongoing'}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">
            {incident.description}
          </p>
          
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="font-medium">{incident.serviceName}</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                Started {formatDistanceToNow(new Date(incident.startedAt), { addSuffix: true })}
              </span>
            </div>
            {incident.resolvedAt && (
              <span>
                Resolved {formatDistanceToNow(new Date(incident.resolvedAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface IncidentHistoryProps {
  incidents: Incident[];
}

export function IncidentHistory({ incidents }: IncidentHistoryProps) {
  const ongoingIncidents = incidents.filter(i => i.status === 'ongoing');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Incident History</h2>
        {ongoingIncidents.length > 0 && (
          <span className="px-2 py-1 rounded-full bg-status-degraded-bg text-status-degraded text-xs font-medium">
            {ongoingIncidents.length} ongoing
          </span>
        )}
      </div>

      <div className="space-y-3">
        {incidents.length === 0 ? (
          <div className="p-8 rounded-xl border bg-card text-center">
            <CheckCircle2 className="h-12 w-12 text-status-up mx-auto mb-3" />
            <p className="text-muted-foreground">No incidents in the last 30 days</p>
          </div>
        ) : (
          <>
            {ongoingIncidents.map((incident, index) => (
              <div key={incident.id} style={{ animationDelay: `${index * 100}ms` }}>
                <IncidentItem incident={incident} />
              </div>
            ))}
            {resolvedIncidents.map((incident, index) => (
              <div
                key={incident.id}
                style={{ animationDelay: `${(ongoingIncidents.length + index) * 100}ms` }}
              >
                <IncidentItem incident={incident} />
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
