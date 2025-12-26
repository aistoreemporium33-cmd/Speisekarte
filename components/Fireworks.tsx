
import React, { useEffect, useState } from 'react';

export const Fireworks: React.FC = () => {
  const [particles, setParticles] = useState<{ id: number; x: string; y: string; color: string; delay: string }[]>([]);

  useEffect(() => {
    const colors = ['#ef4444', '#f59e0b', '#ffffff', '#3b82f6', '#d1d5db'];
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 60}%`,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: `${Math.random() * 8}s`,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <style>
        {`
          @keyframes explode {
            0% { transform: scale(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          .firework {
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            animation: explode 2s ease-out infinite;
            box-shadow: 
              0 0 10px 2px currentColor,
              15px 15px 0 currentColor,
              -15px -15px 0 currentColor,
              15px -15px 0 currentColor,
              -15px 15px 0 currentColor,
              0 20px 0 currentColor,
              0 -20px 0 currentColor,
              20px 0 0 currentColor,
              -20px 0 0 currentColor;
          }
        `}
      </style>
      {particles.map(p => (
        <div
          key={p.id}
          className="firework"
          style={{
            left: p.x,
            top: p.y,
            color: p.color,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};
