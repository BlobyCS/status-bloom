import { Activity, RefreshCw } from 'lucide-react';
import { SystemStatus } from '@/types/status';
import { ThemeToggle } from './ThemeToggle';
import { StatusIndicator } from './StatusIndicator';
import { cn } from '@/lib/utils';

interface StatusHeaderProps {
  systemStatus: SystemStatus;
  lastUpdated: string;
  onRefresh?: () => void;
}

export function StatusHeader({ systemStatus, lastUpdated, onRefresh }: StatusHeaderProps) {
  return (
    <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Bloby Status</h1>
              <p className="text-xs text-muted-foreground">status.bloby.eu</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      {/* System status banner */}
      <div
        className={cn(
          'py-6 transition-colors',
          systemStatus.overall === 'up' && 'bg-status-up-bg',
          systemStatus.overall === 'degraded' && 'bg-status-degraded-bg',
          systemStatus.overall === 'down' && 'bg-status-down-bg'
        )}
      >
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusIndicator status={systemStatus.overall} size="lg" pulse />
              <div>
                <h2
                  className={cn(
                    'text-2xl font-semibold',
                    systemStatus.overall === 'up' && 'text-status-up',
                    systemStatus.overall === 'degraded' && 'text-status-degraded',
                    systemStatus.overall === 'down' && 'text-status-down'
                  )}
                >
                  {systemStatus.message}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">
                {systemStatus.servicesUp}/{systemStatus.servicesTotal} services online
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
