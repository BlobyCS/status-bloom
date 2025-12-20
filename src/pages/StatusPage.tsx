import { useCallback, useState } from 'react';
import { useUptimeStatus } from '@/hooks/useUptimeStatus';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UptimeChart } from '@/components/UptimeChart';
import { RefreshCountdown } from '@/components/RefreshCountdown';
import { RefreshCw, ExternalLink, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const REFRESH_INTERVAL_SECONDS = 60;

const StatusPage = () => {
  const { data, loading, error, refetch } = useUptimeStatus();
  const [countdownKey, setCountdownKey] = useState(0);

  const handleManualRefresh = useCallback(() => {
    refetch();
    setCountdownKey((k) => k + 1); // Reset countdown
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
        return 'Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'down':
        return 'Service Disruption';
      default:
        return 'Checking...';
    }
  };

  const getStatusBg = (status: 'up' | 'degraded' | 'down' | undefined) => {
    switch (status) {
      case 'up':
        return 'bg-status-up-bg';
      case 'degraded':
        return 'bg-status-degraded-bg';
      case 'down':
        return 'bg-status-down-bg';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">bloby.eu Uptime</h1>
            <div className="flex items-center gap-3">
              <RefreshCountdown 
                key={countdownKey} 
                intervalSeconds={REFRESH_INTERVAL_SECONDS} 
                onRefresh={refetch} 
              />
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin")} />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-12">
        {error ? (
          <div className="text-center p-8 rounded-xl border bg-card">
            <div className="w-16 h-16 rounded-full bg-status-down-bg mx-auto mb-4 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-status-down" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Unable to fetch status</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Status Card */}
            <div
              className={cn(
                'p-8 rounded-2xl border transition-all',
                getStatusBg(data?.status)
              )}
            >
              <div className="flex items-center gap-6">
                {/* Status Icon */}
                <div className="relative">
                  <div
                    className={cn(
                      'w-20 h-20 rounded-full flex items-center justify-center',
                      loading ? 'bg-muted' : getStatusBg(data?.status)
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full transition-all',
                        loading ? 'bg-muted-foreground/30 animate-pulse' : getStatusColor(data?.status),
                        data?.status === 'up' && 'shadow-lg shadow-status-up/50'
                      )}
                    />
                  </div>
                  {data?.status === 'up' && !loading && (
                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-status-up/20 animate-ping" />
                  )}
                </div>

                {/* Status Text */}
                <div className="flex-1">
                  <h2
                    className={cn(
                      'text-2xl sm:text-3xl font-bold',
                      data?.status === 'up' && 'text-status-up',
                      data?.status === 'degraded' && 'text-status-degraded',
                      data?.status === 'down' && 'text-status-down',
                      !data?.status && 'text-muted-foreground'
                    )}
                  >
                    {loading ? 'Checking status...' : getStatusText(data?.status)}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {data?.name || 'bloby.eu'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {data && !loading && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border bg-card text-center">
                  <div className="text-2xl font-bold font-mono text-foreground">
                    {data.uptime30d.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">30-day uptime</div>
                </div>
                <div className="p-4 rounded-xl border bg-card text-center">
                  <div className="text-2xl font-bold font-mono text-foreground">
                    {data.uptime90d.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">90-day uptime</div>
                </div>
                <div className="p-4 rounded-xl border bg-card text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold font-mono text-foreground">
                      {data.latency ?? '—'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Latency (ms)</div>
                </div>
                <div className="p-4 rounded-xl border bg-card text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-medium text-foreground">
                      {new Date(data.lastCheck).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Last check</div>
                </div>
              </div>
            )}

            {/* Uptime Chart */}
            {data?.history && data.history.length > 0 && !loading && (
              <div className="p-6 rounded-xl border bg-card">
                <UptimeChart history={data.history} />
              </div>
            )}

            {/* Link to site */}
            {data?.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-4 rounded-xl border bg-card hover:bg-secondary/50 transition-colors group"
              >
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Visit {new URL(data.url).hostname}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container max-w-3xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Powered by Bloby Status Monitor</p>
        </div>
      </footer>
    </div>
  );
};

export default StatusPage;
