import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  statusChangeTime?: string | null;
  expiresAt?: string | null;
  onExpire?: () => void;
}

export default function Timer({ statusChangeTime, expiresAt, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    const endTime = expiresAt
      ? new Date(expiresAt)
      : new Date(new Date(statusChangeTime || 0).getTime() + 30 * 60 * 1000);

    if (Number.isNaN(endTime.getTime())) {
      setTimeLeft(0);
      return;
    }

    hasExpiredRef.current = false;
    
    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, endTime.getTime() - now.getTime());
      setTimeLeft(diff);

      if (diff === 0 && onExpire && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [statusChangeTime, expiresAt, onExpire]);

  const hours = Math.floor(timeLeft / 3600000);
  const minutes = Math.floor((timeLeft % 3600000) / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const displayTime = hours > 0
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if (timeLeft === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-1 text-orange-600">
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">
        {displayTime}
      </span>
    </div>
  );
}
