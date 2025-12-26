
import React, { useEffect, useState } from 'react';

export const Snowfall: React.FC = () => {
  const [flakes, setFlakes] = useState<{ id: number; left: string; delay: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    const newFlakes = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${5 + Math.random() * 10}s`,
      size: `${2 + Math.random() * 4}px`
    }));
    setFlakes(newFlakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-10vh) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(110vh) translateX(20px); opacity: 0; }
          }
          .snowflake {
            position: absolute;
            top: -10px;
            background: white;
            border-radius: 50%;
            filter: blur(1px);
            animation: fall linear infinite;
          }
        `}
      </style>
      {flakes.map(flake => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            animationDelay: flake.delay,
            animationDuration: flake.duration,
            width: flake.size,
            height: flake.size,
          }}
        />
      ))}
    </div>
  );
};
