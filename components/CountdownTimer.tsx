
import React, { useState, useEffect } from 'react';
import { Clock, PartyPopper } from 'lucide-react';
import { Language } from '../types';
import { UI_STRINGS } from '../constants/translations';

interface Props {
  language: Language;
}

export const CountdownTimer: React.FC<Props> = ({ language }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const t = UI_STRINGS[language];

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(`2026-01-10T17:00:00`) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
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
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
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
        {t.countdownTitle}
      </div>
      <div className="flex items-center bg-blue-950/40 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 md:p-8 shadow-2xl">
        <TimerUnit value={timeLeft.days} label={t.days} />
        <div className="text-2xl text-red-500/30 font-bold">:</div>
        <TimerUnit value={timeLeft.hours} label={t.hours} />
        <div className="text-2xl text-red-500/30 font-bold">:</div>
        <TimerUnit value={timeLeft.minutes} label={t.minutes} />
        <div className="text-2xl text-red-500/30 font-bold">:</div>
        <TimerUnit value={timeLeft.seconds} label={t.seconds} />
      </div>
      <p className="mt-6 text-xs text-white/40 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
        <PartyPopper size={12} className="text-yellow-500" />
        {t.liveConcert}
      </p>
    </div>
  );
};
