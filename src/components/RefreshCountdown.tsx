import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

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

  // Reset countdown when manual refresh happens
  useEffect(() => {
    setSecondsLeft(intervalSeconds);
  }, [intervalSeconds]);

  const progress = ((intervalSeconds - secondsLeft) / intervalSeconds) * 100;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Timer className="h-3 w-3" />
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/60 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-[10px] w-6 text-right">{secondsLeft}s</span>
      </div>
    </div>
  );
};
