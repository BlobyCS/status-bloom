import { useState, useEffect } from 'react';

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
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground/20 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="font-mono text-[10px] tabular-nums w-4 text-right">{secondsLeft}</span>
    </div>
  );
};
