import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
        return 'bg-status-up';
      case 'degraded':
        return 'bg-status-degraded';
      case 'down':
        return 'bg-status-down';
      default:
        return 'bg-muted';
    }
  };

  const averageUptime = history.length > 0
    ? history.reduce((sum, d) => sum + d.uptime, 0) / history.length
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">30 Day History</h3>
        <span className="text-xs text-muted-foreground font-mono">
          {averageUptime.toFixed(2)}% avg
        </span>
      </div>

      <TooltipProvider delayDuration={0}>
        <div className="flex gap-[3px]">
          {history.map((day, index) => (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'flex-1 h-8 rounded-sm transition-all duration-150 hover:scale-y-125 hover:opacity-80 focus-ring',
                    getStatusColor(day.status)
                  )}
                  style={{ animationDelay: `${index * 15}ms` }}
                />
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-medium">{formatDate(day.date)}</p>
                  <p className={cn(
                    'font-mono',
                    day.status === 'up' && 'text-status-up',
                    day.status === 'degraded' && 'text-status-degraded',
                    day.status === 'down' && 'text-status-down'
                  )}>
                    {day.uptime.toFixed(2)}%
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>30 days ago</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-status-up" />
            Up
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-status-degraded" />
            Degraded
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-status-down" />
            Down
          </span>
        </div>
        <span>Today</span>
      </div>
    </div>
  );
}
