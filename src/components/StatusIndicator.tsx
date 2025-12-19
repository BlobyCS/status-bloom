import { ServiceStatus } from '@/types/status';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: ServiceStatus;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  showLabel?: boolean;
}

const statusConfig = {
  up: {
    label: 'Operational',
    dotClass: 'bg-status-up',
    bgClass: 'bg-status-up-bg',
    textClass: 'text-status-up',
  },
  degraded: {
    label: 'Degraded',
    dotClass: 'bg-status-degraded',
    bgClass: 'bg-status-degraded-bg',
    textClass: 'text-status-degraded',
  },
  down: {
    label: 'Down',
    dotClass: 'bg-status-down',
    bgClass: 'bg-status-down-bg',
    textClass: 'text-status-down',
  },
};

const sizeConfig = {
  sm: { dot: 'h-2 w-2', text: 'text-xs' },
  md: { dot: 'h-3 w-3', text: 'text-sm' },
  lg: { dot: 'h-4 w-4', text: 'text-base' },
};

export function StatusIndicator({ 
  status, 
  size = 'md', 
  pulse = false,
  showLabel = false 
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'rounded-full',
          sizes.dot,
          config.dotClass,
          pulse && 'status-pulse'
        )}
      />
      {showLabel && (
        <span className={cn(sizes.text, 'font-medium', config.textClass)}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: ServiceStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bgClass,
        config.textClass
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  );
}
