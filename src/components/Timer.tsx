import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  statusChangeTime: string;
  onExpire?: () => void;
}

export default function Timer({ statusChangeTime, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const endTime = new Date(new Date(statusChangeTime).getTime() + 30 * 60 * 1000); // 30 minutes
    
    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, endTime.getTime() - now.getTime());
      setTimeLeft(diff);

      if (diff === 0 && onExpire) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [statusChangeTime, onExpire]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  if (timeLeft === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-1 text-orange-600">
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}