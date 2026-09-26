import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiresAt, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - new Date().getTime()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date(expiresAt).getTime() - new Date().getTime()) / 1000);
      if (diff <= 0) {
        setSecondsLeft(0);
        clearInterval(interval);
        if (onExpire) onExpire();
      } else {
        setSecondsLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = secondsLeft < 120;

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors ${
        isWarning
          ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
          : 'bg-accent-amber/10 border-accent-amber/30 text-accent-amber'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>Seats Held For: {formattedTime}</span>
    </div>
  );
};
