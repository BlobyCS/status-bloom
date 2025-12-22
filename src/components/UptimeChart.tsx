import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp } from 'lucide-react';

interface DayData {
  date: string;
  status: 'up' | 'down' | 'degraded';
  uptime: number;
}

interface UptimeChartProps {
  history: DayData[];
}

export function UptimeChart({ history }: UptimeChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'bg-status-up hover:bg-status-up/90';
      case 'degraded':
        return 'bg-status-degraded hover:bg-status-degraded/90';
      case 'down':
        return 'bg-status-down hover:bg-status-down/90';
      default:
        return 'bg-muted';
    }
  };

  const averageUptime = history.length > 0
    ? history.reduce((sum, d) => sum + d.uptime, 0) / history.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Uptime History</h3>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
        </div>
        <div className="text-right">
          <span className={cn(
            'text-2xl font-bold font-mono',
            averageUptime >= 99.9 ? 'text-gradient' : 'text-foreground'
          )}>
            {averageUptime.toFixed(2)}%
          </span>
          <p className="text-xs text-muted-foreground">Average</p>
        </div>
      </div>

      <TooltipProvider delayDuration={0}>
        <div className="flex gap-1 py-2">
          {history.map((day, index) => (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'flex-1 h-12 rounded-md transition-all duration-200',
                    'hover:scale-y-110 hover:z-10 focus-ring',
                    getStatusColor(day.status)
                  )}
                  style={{ 
                    animationDelay: `${index * 20}ms`,
                    opacity: 0.4 + (day.uptime / 100) * 0.6
                  }}
                />
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-popover border border-border shadow-xl"
              >
                <div className="text-xs space-y-1 py-1">
                  <p className="font-semibold text-foreground">{formatDate(day.date)}</p>
                  <p className={cn(
                    'font-mono font-bold text-base',
                    day.status === 'up' && 'text-status-up',
                    day.status === 'degraded' && 'text-status-degraded',
                    day.status === 'down' && 'text-status-down'
                  )}>
                    {day.uptime.toFixed(2)}%
                  </p>
                  <p className="text-muted-foreground capitalize">{day.status}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">30 days ago</span>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-status-up" />
            <span className="text-muted-foreground">Operational</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-status-degraded" />
            <span className="text-muted-foreground">Degraded</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-status-down" />
            <span className="text-muted-foreground">Down</span>
          </span>
        </div>
        <span className="text-xs text-muted-foreground">Today</span>
      </div>
    </div>
  );
}
