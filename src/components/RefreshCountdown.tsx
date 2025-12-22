import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RefreshCountdownProps {
  intervalSeconds: number;
  onRefresh: () => void;
}

export const RefreshCountdown = ({ intervalSeconds, onRefresh }: RefreshCountdownProps) => {
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onRefresh();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intervalSeconds, onRefresh]);

  useEffect(() => {
    setSecondsLeft(intervalSeconds);
  }, [intervalSeconds]);

  const progress = ((intervalSeconds - secondsLeft) / intervalSeconds) * 100;

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear',
            'bg-gradient-to-r from-primary to-accent'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-muted-foreground tabular-nums w-5 text-right">
        {secondsLeft}s
      </span>
    </div>
  );
};
