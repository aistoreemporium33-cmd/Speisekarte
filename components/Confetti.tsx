
import React, { useEffect, useState } from 'react';

interface Props {
  easterMode?: boolean;
}

export const Confetti: React.FC<Props> = ({ easterMode }) => {
  const [pieces, setPieces] = useState<{ id: number; left: string; delay: string; duration: string; color: string; size: string; rotate: string }[]>([]);

  useEffect(() => {
    const colors = easterMode 
      ? ['#f48fb1', '#81c784', '#4dd0e1', '#fff176', '#ba68c8', '#ffb74d'] // Saturated Easter Pastels
      : ['#ff4d4d', '#ffdb4d', '#4dff4d', '#4db8ff', '#b84dff', '#ff4db8'];
    const newPieces = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: easterMode ? `${Math.random() * 12 + 8}px` : `${Math.random() * 8 + 4}px`,
      rotate: `${Math.random() * 360}deg`
    }));
    setPieces(newPieces);
  }, [easterMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <style>
        {`
          @keyframes confetti-fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0.3; }
          }
          .raeppli {
            position: absolute;
            top: -20px;
            animation: confetti-fall linear infinite;
          }
        `}
      </style>
      {pieces.map(p => (
        <div
          key={p.id}
          className="raeppli"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            backgroundColor: p.color,
            width: p.size,
            height: easterMode ? `calc(${p.size} * 1.4)` : p.size,
            transform: `rotate(${p.rotate})`,
            borderRadius: easterMode ? '50% 50% 50% 50% / 60% 60% 40% 40%' : (Math.random() > 0.5 ? '50%' : '2px')
          }}
        />
      ))}
    </div>
  );
};
