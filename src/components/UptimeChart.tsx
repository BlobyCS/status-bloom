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
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'bg-status-up hover:bg-status-up/80';
      case 'degraded':
        return 'bg-status-degraded hover:bg-status-degraded/80';
      case 'down':
        return 'bg-status-down hover:bg-status-down/80';
      default:
        return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'up':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'down':
        return 'Down';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">30 Day History</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-status-up" />
            <span>Up</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-status-degraded" />
            <span>Degraded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-status-down" />
            <span>Down</span>
          </div>
        </div>
      </div>

      <TooltipProvider delayDuration={0}>
        <div className="flex gap-1">
          {history.map((day, index) => (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex-1 h-10 rounded-sm cursor-pointer transition-all duration-200',
                    getStatusColor(day.status),
                    'hover:scale-y-110 hover:z-10'
                  )}
                  style={{ animationDelay: `${index * 20}ms` }}
                />
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-popover border border-border shadow-lg"
              >
                <div className="text-sm space-y-1">
                  <p className="font-semibold">{formatDate(day.date)}</p>
                  <p className={cn(
                    'font-medium',
                    day.status === 'up' && 'text-status-up',
                    day.status === 'degraded' && 'text-status-degraded',
                    day.status === 'down' && 'text-status-down'
                  )}>
                    {getStatusLabel(day.status)}
                  </p>
                  <p className="text-muted-foreground">
                    {day.uptime.toFixed(2)}% uptime
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
