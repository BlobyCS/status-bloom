import { useCallback, useState } from 'react';
import { useUptimeStatus } from '@/hooks/useUptimeStatus';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UptimeChart } from '@/components/UptimeChart';
import { RefreshCountdown } from '@/components/RefreshCountdown';
import { IncidentHistory } from '@/components/IncidentHistory';
import { MaintenanceSchedule } from '@/components/MaintenanceSchedule';
import { RefreshCw, ExternalLink, Clock, Zap, Activity, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
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
          gradient: 'from-status-up to-accent',
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          text: 'Degraded Performance',
          color: 'text-status-degraded',
          bg: 'bg-status-degraded',
          bgLight: 'bg-status-degraded-bg',
          glow: 'glow-degraded',
          gradient: 'from-status-degraded to-amber-500',
        };
      case 'down':
        return {
          icon: XCircle,
          text: 'Service Disruption',
          color: 'text-status-down',
          bg: 'bg-status-down',
          bgLight: 'bg-status-down-bg',
          glow: 'glow-down',
          gradient: 'from-status-down to-rose-500',
        };
      default:
        return {
          icon: Activity,
          text: 'Checking...',
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          bgLight: 'bg-muted',
          glow: '',
          gradient: 'from-muted-foreground to-muted-foreground',
        };
    }
  };

  const statusConfig = getStatusConfig(data?.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen mesh-bg noise">
      {/* Decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-heavy">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Activity className="h-5 w-5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent blur-lg opacity-50" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-foreground">bloby.eu</span>
                <span className="hidden sm:inline text-xs text-muted-foreground ml-2">Status</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCountdown
                key={countdownKey}
                intervalSeconds={REFRESH_INTERVAL_SECONDS}
                onRefresh={refetch}
              />
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="p-2.5 rounded-xl hover:bg-secondary transition-all disabled:opacity-50 focus-ring"
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
      <main className="relative z-10 container max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {error ? (
          <div className="text-center py-20 animate-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-status-down-bg mb-6">
              <XCircle className="h-10 w-10 text-status-down" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Unable to fetch status</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition-all focus-ring hover-lift"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6 stagger">
            {/* Hero Status Card */}
            <div
              className={cn(
                'relative p-8 sm:p-10 rounded-3xl card-glow overflow-hidden transition-all duration-500',
                !loading && statusConfig.glow
              )}
            >
              {/* Animated gradient background */}
              {!loading && data?.status === 'up' && (
                <div className="absolute inset-0 bg-gradient-to-br from-status-up/5 via-transparent to-accent/5 gradient-animated" />
              )}

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Status Icon */}
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      'flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl transition-all duration-300',
                      loading ? 'bg-muted shimmer' : cn('bg-gradient-to-br', statusConfig.gradient)
                    )}
                  >
                    {loading ? (
                      <div className="w-8 h-8 rounded-full bg-muted-foreground/30" />
                    ) : (
                      <StatusIcon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                    )}
                  </div>
                  {data?.status === 'up' && !loading && (
                    <>
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-up opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-status-up border-2 border-card" />
                      </span>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-status-up to-accent blur-xl opacity-30 pulse-glow" />
                    </>
                  )}
                </div>

                {/* Status Text */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1
                      className={cn(
                        'text-2xl sm:text-3xl font-bold tracking-tight',
                        loading ? 'text-muted-foreground' : statusConfig.color
                      )}
                    >
                      {loading ? 'Checking status...' : statusConfig.text}
                    </h1>
                    {data?.status === 'up' && !loading && (
                      <Sparkles className="h-5 w-5 text-status-up animate-pulse" />
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {data?.name || 'bloby.eu'}
                    {data && (
                      <span className="inline-flex items-center gap-1.5 ml-3 text-sm">
                        <Clock className="h-3.5 w-3.5" />
                        Updated {new Date(data.lastCheck).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {data && !loading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  value={`${data.uptime30d.toFixed(2)}%`}
                  label="30-day uptime"
                  highlight={data.uptime30d >= 99.9}
                  icon="chart"
                />
                <StatCard
                  value={`${data.uptime90d.toFixed(2)}%`}
                  label="90-day uptime"
                  highlight={data.uptime90d >= 99.9}
                  icon="chart"
                />
                <StatCard
                  value={data.latency ? `${data.latency}ms` : '—'}
                  label="Response time"
                  icon="zap"
                />
                <StatCard
                  value={new Date(data.lastCheck).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  label="Last check"
                  icon="clock"
                />
              </div>
            )}

            {/* Uptime Chart */}
            {data?.history && data.history.length > 0 && !loading && (
              <div className="card-elevated p-6 sm:p-8">
                <UptimeChart history={data.history} />
              </div>
            )}

            {/* Two Column Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Maintenance Schedule */}
              <div className="card-elevated p-6">
                <MaintenanceSchedule />
              </div>

              {/* Incident History */}
              {data?.incidents && !loading && (
                <div className="card-elevated p-6">
                  <IncidentHistory incidents={data.incidents} />
                </div>
              )}
            </div>

            {/* Link to site */}
            {data?.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-5 rounded-2xl card-elevated hover-glow hover-lift group"
              >
                <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Visit {new URL(data.url).hostname}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 mt-8">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-gradient">Bloby Status Monitor</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

interface StatCardProps {
  value: string;
  label: string;
  icon?: 'chart' | 'zap' | 'clock';
  highlight?: boolean;
}

function StatCard({ value, label, icon, highlight }: StatCardProps) {
  const IconComponent = icon === 'zap' ? Zap : icon === 'clock' ? Clock : Activity;

  return (
    <div className="relative group p-5 rounded-2xl card-elevated hover-lift">
      {highlight && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-status-up/5 to-accent/5" />
      )}
      <div className="relative">
        <div className={cn(
          'flex items-center gap-2 text-2xl sm:text-3xl font-bold font-mono mb-1',
          highlight ? 'text-gradient' : 'text-foreground'
        )}>
          {icon && (
            <IconComponent className={cn(
              'h-5 w-5',
              highlight ? 'text-status-up' : 'text-muted-foreground'
            )} />
          )}
          {value}
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </div>
      </div>
    </div>
  );
}

export default StatusPage;
