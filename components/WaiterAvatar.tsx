
import React from 'react';

interface Props {
  className?: string;
  christmasMode?: boolean;
}

export const WaiterAvatar: React.FC<Props> = ({ className = "w-10 h-10", christmasMode }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        {`
          @keyframes bowtie-wiggle {
            0%, 100% { transform: rotate(0deg); }
            5% { transform: rotate(-5deg); }
            10% { transform: rotate(5deg); }
            15% { transform: rotate(-3deg); }
            20% { transform: rotate(0deg); }
          }
          .bowtie-anim {
            transform-origin: 50px 38px;
            animation: bowtie-wiggle 5s infinite ease-in-out;
          }
        `}
      </style>
      
      {/* Legs/Trousers - Black */}
      <path d="M35 70 L35 95 Q35 98 38 98 L48 98 Q50 98 50 95 L50 75 L50 95 Q50 98 52 98 L62 98 Q65 98 65 95 L65 70 Z" fill="#1a1a1a" />
      
      {/* Shirt - White */}
      <path d="M30 40 Q30 35 35 35 L65 35 Q70 35 70 40 L70 72 L30 72 Z" fill="#FFFFFF" />
      
      {/* Buttons */}
      <circle cx="50" cy="48" r="1.5" fill="#ddd" />
      <circle cx="50" cy="56" r="1.5" fill="#ddd" />
      <circle cx="50" cy="64" r="1.5" fill="#ddd" />

      {/* Head - Skin Tone */}
      <circle cx="50" cy="22" r="14" fill="#FFDFC4" />
      
      {/* Hair - Dark Brown/Black */}
      <path d="M36 20 Q36 10 50 8 Q64 10 64 20 Q64 16 62 14 Q50 4 38 14 Q36 16 36 20" fill="#2c1810" />

      {/* Eyes */}
      <circle cx="45" cy="22" r="1.5" fill="#1a1a1a" />
      <circle cx="55" cy="22" r="1.5" fill="#1a1a1a" />
      
      {/* Smile */}
      <path d="M46 28 Q50 31 54 28" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />

      {/* Bow Tie - Blue/Red - Animated Group */}
      <g className="bowtie-anim">
        <path d="M44 38 L40 35 L40 41 Z" fill={christmasMode ? "#cc0000" : "#003399"} /> {/* Left wing */}
        <path d="M56 38 L60 35 L60 41 Z" fill={christmasMode ? "#cc0000" : "#003399"} /> {/* Right wing */}
        <circle cx="50" cy="38" r="2.5" fill={christmasMode ? "#cc0000" : "#003399"} /> {/* Knot */}
      </g>

      {/* Arms/Hands (Simple by side) */}
      <path d="M30 42 Q25 55 28 65" stroke="#FFDFC4" strokeWidth="4" strokeLinecap="round" />
      <path d="M70 42 Q75 55 72 65" stroke="#FFDFC4" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};
