
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const year = new Date().getFullYear();
      const difference = +new Date(`${year}-12-31T23:59:59`) - +new Date();
      
      let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }

      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimerUnit = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center px-3 md:px-6">
      <div className="text-3xl md:text-5xl font-black brand-font text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-[10px] md:text-xs uppercase tracking-widest text-red-400/60 font-bold mt-1">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center py-8 animate-in fade-in zoom-in duration-1000">
      <div className="flex items-center gap-2 mb-4 text-red-400/80 uppercase tracking-[0.3em] text-[10px] font-black">
        <Clock size={14} className="animate-pulse" />
        Countdown bis 2026
      </div>
      <div className="flex items-center bg-blue-950/40 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-red-900/20">
        <TimerUnit value={timeLeft.days} label="Tage" />
        <div className="text-2xl text-red-500/30 font-bold">:</div>
        <TimerUnit value={timeLeft.hours} label="Stunden" />
        <div className="text-2xl text-red-500/30 font-bold">:</div>
        <TimerUnit value={timeLeft.minutes} label="Minuten" />
        <div className="text-2xl text-red-500/30 font-bold">:</div>
        <TimerUnit value={timeLeft.seconds} label="Sekunden" />
      </div>
    </div>
  );
};
