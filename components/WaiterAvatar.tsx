
import React from 'react';

interface Props {
  className?: string;
  christmasMode?: boolean;
  carnevalMode?: boolean;
}

export const WaiterAvatar: React.FC<Props> = ({ className = "w-10 h-10", christmasMode, carnevalMode }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        {`
          @keyframes sora-blink {
            0%, 90%, 100% { opacity: 1; }
            95% { opacity: 0; }
          }
          @keyframes hair-sway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(2deg); }
          }
          .blink { animation: sora-blink 4s infinite; }
          .hair { transform-origin: top; animation: hair-sway 3s infinite ease-in-out; }
        `}
      </style>
      
      {/* Sora's Long Hair (Back) */}
      <path d="M25 35 Q20 50 25 85 L75 85 Q80 50 75 35" fill="#3D2B1F" className="hair" />
      
      {/* Body - Elegant Waitress Vest */}
      <path d="M30 60 L30 95 Q30 98 33 98 L67 98 Q70 98 70 95 L70 60 Z" fill="#1a1a1a" />
      <path d="M30 60 L50 98 L70 60 Z" fill="#2c2c2c" />
      <path d="M40 60 L50 85 L60 60 Z" fill="#FFFFFF" />
      
      {/* Head - Skin Tone */}
      <circle cx="50" cy="35" r="18" fill="#FFDFC4" />
      
      {/* Sora's Hair (Front/Bangs) */}
      <path d="M32 30 Q50 15 68 30 Q65 20 50 18 Q35 20 32 30" fill="#3D2B1F" />
      
      {/* Eyes with Blinking Effect (Hidden by mask in Carneval Mode) */}
      {!carnevalMode && (
        <g className="blink">
          <circle cx="43" cy="35" r="2" fill="#1a1a1a" />
          <circle cx="57" cy="35" r="2" fill="#1a1a1a" />
        </g>
      )}
      
      {/* Carneval Mask (Larve) */}
      {carnevalMode && (
        <g transform="translate(32, 25)">
           <path d="M0 10 Q18 -5 36 10 L36 20 Q18 30 0 20 Z" fill="#ffffff" stroke="#ff9d00" strokeWidth="1" />
           <path d="M5 12 Q9 9 13 12" fill="none" stroke="#000" strokeWidth="1" />
           <path d="M23 12 Q27 9 31 12" fill="none" stroke="#000" strokeWidth="1" />
           <circle cx="9" cy="15" r="2" fill="#000" />
           <circle cx="27" cy="15" r="2" fill="#000" />
           {/* Mask Decorations */}
           <path d="M18 10 L18 18" stroke="#ff9d00" strokeWidth="0.5" />
           <circle cx="18" cy="22" r="1.5" fill="#ff4d00" />
        </g>
      )}

      {/* Smile */}
      <path d="M45 44 Q50 48 55 44" stroke="#e07a7a" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Accessories */}
      <circle cx="33" cy="40" r="2" stroke="#D4AF37" strokeWidth="1" fill="none" />
      <circle cx="67" cy="40" r="2" stroke="#D4AF37" strokeWidth="1" fill="none" />
    </svg>
  );
};
