import { useCallback, useState } from 'react';
import { useUptimeStatus } from '@/hooks/useUptimeStatus';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UptimeChart } from '@/components/UptimeChart';
import { RefreshCountdown } from '@/components/RefreshCountdown';
import { IncidentHistory } from '@/components/IncidentHistory';
import { MaintenanceSchedule } from '@/components/MaintenanceSchedule';
import { RefreshCw, ExternalLink, Clock, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const REFRESH_INTERVAL_SECONDS = 60;

const StatusPage = () => {
  const { data, loading, error, refetch } = useUptimeStatus();
  const [countdownKey, setCountdownKey] = useState(0);

  const handleManualRefresh = useCallback(() => {
    refetch();
    setCountdownKey((k) => k + 1);
  }, [refetch]);

  const getStatusColor = (status: 'up' | 'degraded' | 'down' | undefined) => {
    switch (status) {
      case 'up':
        return 'bg-status-up';
      case 'degraded':
        return 'bg-status-degraded';
      case 'down':
        return 'bg-status-down';
      default:
        return 'bg-muted';
    }
  };

  const getStatusText = (status: 'up' | 'degraded' | 'down' | undefined) => {
    switch (status) {
      case 'up':
        return 'All Systems Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'down':
        return 'Service Disruption';
      default:
        return 'Checking...';
    }
  };

  const getStatusGlow = (status: 'up' | 'degraded' | 'down' | undefined) => {
    switch (status) {
      case 'up':
        return 'status-glow-up';
      case 'degraded':
        return 'status-glow-degraded';
      case 'down':
        return 'status-glow-down';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh flex flex-col">
      {/* Header */}
      <header className="glass-surface sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">bloby.eu</h1>
            </div>
            <div className="flex items-center gap-4">
              <RefreshCountdown
                key={countdownKey}
                intervalSeconds={REFRESH_INTERVAL_SECONDS}
                onRefresh={refetch}
              />
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="p-2.5 rounded-xl hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50"
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
      <main className="flex-1 container max-w-4xl mx-auto px-6 py-12">
        {error ? (
          <div className="text-center p-12 rounded-3xl glass-card animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-status-down-bg mx-auto mb-6 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-status-down" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Unable to fetch status</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 font-medium hover-lift"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Status Card */}
            <div
              className={cn(
                'relative p-8 sm:p-10 rounded-3xl glass-card transition-all duration-500 overflow-hidden',
                !loading && getStatusGlow(data?.status)
              )}
            >
              {/* Background gradient based on status */}
              <div
                className={cn(
                  'absolute inset-0 opacity-30 transition-opacity duration-500',
                  data?.status === 'up' && 'bg-gradient-to-br from-status-up/20 to-transparent',
                  data?.status === 'degraded' && 'bg-gradient-to-br from-status-degraded/20 to-transparent',
                  data?.status === 'down' && 'bg-gradient-to-br from-status-down/20 to-transparent'
                )}
              />

              <div className="relative flex items-center gap-8">
                {/* Status Icon */}
                <div className="relative">
                  <div
                    className={cn(
                      'w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300',
                      loading ? 'bg-muted' : data?.status === 'up' ? 'bg-status-up-bg' : data?.status === 'degraded' ? 'bg-status-degraded-bg' : 'bg-status-down-bg'
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl transition-all duration-300',
                        loading ? 'bg-muted-foreground/30 animate-pulse' : getStatusColor(data?.status)
                      )}
                    />
                  </div>
                  {data?.status === 'up' && !loading && (
                    <div className="absolute inset-0 w-24 h-24 rounded-2xl bg-status-up/20 animate-ping" />
                  )}
                </div>

                {/* Status Text */}
                <div className="flex-1">
                  <h2
                    className={cn(
                      'text-3xl sm:text-4xl font-bold tracking-tight',
                      data?.status === 'up' && 'text-status-up',
                      data?.status === 'degraded' && 'text-status-degraded',
                      data?.status === 'down' && 'text-status-down',
                      !data?.status && 'text-muted-foreground'
                    )}
                  >
                    {loading ? 'Checking status...' : getStatusText(data?.status)}
                  </h2>
                  <p className="text-muted-foreground mt-2 text-lg">
                    {data?.name || 'bloby.eu'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {data && !loading && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl glass-card text-center hover-lift">
                  <div className="text-3xl font-bold font-mono text-foreground">
                    {data.uptime30d.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wider">30-day uptime</div>
                </div>
                <div className="p-5 rounded-2xl glass-card text-center hover-lift">
                  <div className="text-3xl font-bold font-mono text-foreground">
                    {data.uptime90d.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wider">90-day uptime</div>
                </div>
                <div className="p-5 rounded-2xl glass-card text-center hover-lift">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-3xl font-bold font-mono text-foreground">
                      {data.latency ?? '—'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wider">Latency (ms)</div>
                </div>
                <div className="p-5 rounded-2xl glass-card text-center hover-lift">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xl font-semibold text-foreground">
                      {new Date(data.lastCheck).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wider">Last check</div>
                </div>
              </div>
            )}

            {/* Uptime Chart */}
            {data?.history && data.history.length > 0 && !loading && (
              <div className="p-6 rounded-2xl glass-card">
                <UptimeChart history={data.history} />
              </div>
            )}

            {/* Maintenance Schedule */}
            <div className="p-6 rounded-2xl glass-card">
              <MaintenanceSchedule />
            </div>

            {/* Incident History */}
            {data?.incidents && !loading && (
              <div className="p-6 rounded-2xl glass-card">
                <IncidentHistory incidents={data.incidents} />
              </div>
            )}

            {/* Link to site */}
            {data?.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-5 rounded-2xl glass-card hover:bg-secondary/50 transition-all duration-300 group hover-lift"
              >
                <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  Visit {new URL(data.url).hostname}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-medium text-foreground">Bloby Status Monitor</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StatusPage;