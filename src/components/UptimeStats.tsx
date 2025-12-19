import { UptimeDay } from '@/types/status';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UptimeGraphProps {
  data: UptimeDay[];
  className?: string;
}

export function UptimeGraph({ data, className }: UptimeGraphProps) {
  const averageUptime = data.length > 0
    ? data.reduce((sum, d) => sum + d.uptime, 0) / data.length
    : 0;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Last {data.length} days
        </span>
        <span className="text-sm font-medium font-mono text-foreground">
          {averageUptime.toFixed(2)}% average
        </span>
      </div>
      
      <div className="flex gap-[2px] h-8">
        {data.map((day, index) => (
          <Tooltip key={day.date}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex-1 rounded-sm transition-all cursor-pointer',
                  'hover:scale-y-110 hover:opacity-80',
                  day.status === 'up' && 'bg-status-up',
                  day.status === 'degraded' && 'bg-status-degraded',
                  day.status === 'down' && 'bg-status-down'
                )}
                style={{ animationDelay: `${index * 10}ms` }}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="font-mono text-xs">
              <div className="space-y-1">
                <div className="font-medium">{day.date}</div>
                <div className="text-muted-foreground">
                  {day.uptime.toFixed(2)}% uptime
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{data.length > 0 ? data[0].date : ''}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

interface UptimeStatsProps {
  uptime30d: number;
  uptime90d: number;
  uptimeData: UptimeDay[];
}

export function UptimeStats({ uptime30d, uptime90d, uptimeData }: UptimeStatsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Uptime Statistics</h2>
      
      <div className="p-6 rounded-xl border bg-card">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center p-4 rounded-lg bg-secondary/50">
            <div className="text-3xl font-bold font-mono text-foreground">
              {uptime30d.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">30-day uptime</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/50">
            <div className="text-3xl font-bold font-mono text-foreground">
              {uptime90d.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">90-day uptime</div>
          </div>
        </div>
        
        <UptimeGraph data={uptimeData} />
      </div>
    </section>
  );
}
