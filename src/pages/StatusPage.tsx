import { useCallback, useState } from 'react';
import { useUptimeStatus } from '@/hooks/useUptimeStatus';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UptimeChart } from '@/components/UptimeChart';
import { RefreshCountdown } from '@/components/RefreshCountdown';
import { IncidentHistory } from '@/components/IncidentHistory';
import { MaintenanceSchedule } from '@/components/MaintenanceSchedule';
import { AdminHeader } from '@/components/AdminHeader';
import { RefreshCw, ExternalLink, Clock, Zap, Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const REFRESH_INTERVAL_SECONDS = 60;

const StatusPage = () => {
  const { data, loading, error, refetch } = useUptimeStatus();
  const [countdownKey, setCountdownKey] = useState(0);

  const handleManualRefresh = useCallback(() => {
    refetch();
    setCountdownKey((k) => k + 1);
  }, [refetch]);

  const getStatusConfig = (status: 'up' | 'degraded' | 'down' | undefined) => {
    switch (status) {
      case 'up':
        return {
          icon: CheckCircle2,
          text: 'All Systems Operational',
          color: 'text-status-up',
          bg: 'bg-status-up',
          bgLight: 'bg-status-up-bg',
          glow: 'glow-up',
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          text: 'Degraded Performance',
          color: 'text-status-degraded',
          bg: 'bg-status-degraded',
          bgLight: 'bg-status-degraded-bg',
          glow: 'glow-degraded',
        };
      case 'down':
        return {
          icon: XCircle,
          text: 'Service Disruption',
          color: 'text-status-down',
          bg: 'bg-status-down',
          bgLight: 'bg-status-down-bg',
          glow: 'glow-down',
        };
      default:
        return {
          icon: Activity,
          text: 'Checking...',
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          bgLight: 'bg-muted',
          glow: '',
        };
    }
  };

  const statusConfig = getStatusConfig(data?.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen ambient-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground">
                <Activity className="h-4 w-4 text-background" />
              </div>
              <span className="font-semibold text-foreground tracking-tight">bloby.eu</span>
            </div>
            <div className="flex items-center gap-2">
              <AdminHeader />
              <RefreshCountdown
                key={countdownKey}
                intervalSeconds={REFRESH_INTERVAL_SECONDS}
                onRefresh={refetch}
              />
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 focus-ring"
                title="Refresh"
              >
                <RefreshCw className={cn('h-4 w-4 text-muted-foreground', loading && 'animate-spin')} />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {error ? (
          <div className="text-center py-16 animate-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-status-down-bg mb-6">
              <XCircle className="h-8 w-8 text-status-down" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Unable to fetch status</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">{error}</p>
            <button
              onClick={refetch}
              className="px-5 py-2.5 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity focus-ring"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6 stagger-children">
            {/* Status Banner */}
            <div
              className={cn(
                'relative p-6 sm:p-8 rounded-2xl card-elevated overflow-hidden transition-all duration-500',
                !loading && statusConfig.glow
              )}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Status Icon */}
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      'flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition-colors',
                      loading ? 'bg-muted' : statusConfig.bgLight
                    )}
                  >
                    {loading ? (
                      <div className="w-6 h-6 rounded-full bg-muted-foreground/30 animate-pulse" />
                    ) : (
                      <StatusIcon className={cn('h-7 w-7 sm:h-8 sm:w-8', statusConfig.color)} />
                    )}
                  </div>
                  {data?.status === 'up' && !loading && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-up opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-status-up" />
                    </span>
                  )}
                </div>

                {/* Status Text */}
                <div className="flex-1 min-w-0">
                  <h1
                    className={cn(
                      'text-xl sm:text-2xl font-semibold tracking-tight truncate',
                      loading ? 'text-muted-foreground' : statusConfig.color
                    )}
                  >
                    {loading ? 'Checking status...' : statusConfig.text}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data?.name || 'bloby.eu'} • Updated {data ? new Date(data.lastCheck).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {data && !loading && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  value={`${data.uptime30d.toFixed(2)}%`}
                  label="30-day uptime"
                  highlight={data.uptime30d >= 99.9}
                />
                <StatCard
                  value={`${data.uptime90d.toFixed(2)}%`}
                  label="90-day uptime"
                  highlight={data.uptime90d >= 99.9}
                />
                <StatCard
                  value={data.latency ? `${data.latency}ms` : '—'}
                  label="Response time"
                  icon={<Zap className="h-3.5 w-3.5" />}
                />
                <StatCard
                  value={new Date(data.lastCheck).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  label="Last check"
                  icon={<Clock className="h-3.5 w-3.5" />}
                />
              </div>
            )}

            {/* Uptime Chart */}
            {data?.history && data.history.length > 0 && !loading && (
              <div className="card-elevated p-5 sm:p-6 rounded-xl">
                <UptimeChart history={data.history} />
              </div>
            )}

            {/* Maintenance Schedule */}
            <div className="card-elevated p-5 sm:p-6 rounded-xl">
              <MaintenanceSchedule />
            </div>

            {/* Incident History */}
            {data?.incidents && !loading && (
              <div className="card-elevated p-5 sm:p-6 rounded-xl">
                <IncidentHistory incidents={data.incidents} />
              </div>
            )}

            {/* Link to site */}
            {data?.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-4 rounded-xl border border-border/60 hover:border-border hover:bg-secondary/50 transition-all group"
              >
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Visit {new URL(data.url).hostname}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-auto">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs text-muted-foreground text-center">
            Powered by Bloby Status Monitor
          </p>
        </div>
      </footer>
    </div>
  );
};

interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

function StatCard({ value, label, icon, highlight }: StatCardProps) {
  return (
    <div className="p-4 rounded-xl card-elevated text-center hover-lift">
      <div className={cn(
        'text-lg sm:text-xl font-semibold font-mono flex items-center justify-center gap-1.5',
        highlight ? 'text-status-up' : 'text-foreground'
      )}>
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {value}
      </div>
      <div className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 uppercase tracking-wider font-medium">
        {label}
      </div>
    </div>
  );
}

export default StatusPage;
