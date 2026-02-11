
import React from 'react';

interface Props {
  className?: string;
  src?: string | null;
  newYearMode?: boolean;
  carnevalMode?: boolean;
}

export const Logo: React.FC<Props> = ({ className = "h-16 w-16", src, newYearMode, carnevalMode }) => {
  if (src) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <img src={src} alt="Rheinhafen Logo" className="w-full h-full object-contain drop-shadow-md" />
      </div>
    );
  }

  // Colors based on mode
  const primaryColor = carnevalMode ? "#ff9d00" : newYearMode ? "#d4af37" : "#ffffff";
  const secondaryColor = carnevalMode ? "#ff4d00" : newYearMode ? "#9a7b0c" : "#cbd5e1";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
        <style>
          {`
            @keyframes rh-glow-white {
              0%, 100% { filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)); transform: scale(1); }
              50% { filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.6)); transform: scale(1.04); }
            }
            @keyframes rh-glow-gold {
              0%, 100% { filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.5)); transform: scale(1); }
              50% { filter: drop-shadow(0 0 30px rgba(212, 175, 55, 1)); transform: scale(1.1); }
            }
            @keyframes rh-glow-carneval {
              0%, 100% { filter: drop-shadow(0 0 15px rgba(255, 157, 0, 0.6)); transform: scale(1) rotate(-2deg); }
              50% { filter: drop-shadow(0 0 35px rgba(255, 157, 0, 0.9)); transform: scale(1.1) rotate(2deg); }
            }
            @keyframes needle-swing {
              0% { transform: rotate(-3deg); }
              50% { transform: rotate(4deg); }
              100% { transform: rotate(-3deg); }
            }
            .rh-monogram {
              animation: ${carnevalMode ? 'rh-glow-carneval 3s infinite ease-in-out' : newYearMode ? 'rh-glow-gold 4s infinite ease-in-out' : 'rh-glow-white 4s infinite ease-in-out'};
              transform-origin: center;
              display: inline-block;
            }
            .compass-needle {
              transform-origin: 120px 125px;
              animation: needle-swing 5s infinite ease-in-out;
            }
          `}
        </style>
        <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
            <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: primaryColor, stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: secondaryColor, stopOpacity: 1 }} />
                </linearGradient>
            </defs>

            <g className="rh-monogram">
                {/* Carneval Räppli in Logo */}
                {carnevalMode && [1,2,3,4,5,6].map(i => (
                  <circle key={i} cx={50 + i*20} cy={40 + (i%2)*10} r="3" fill={['#ff4d4d', '#ffdb4d', '#4db8ff'][i%3]} opacity="0.8" />
                ))}

                <g transform="translate(120, 125)" opacity="0.4">
                    <circle cx="0" cy="0" r="85" fill="none" stroke={primaryColor} strokeWidth="0.5" strokeDasharray="2 4" />
                    <path d="M0 -85 L10 -20 L0 0 L-10 -20 Z" fill={primaryColor} />
                    <path d="M0 85 L10 20 L0 0 L-10 20 Z" fill={primaryColor} />
                </g>

                <text x="120" y="65" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="42" fontWeight="700" fill={primaryColor}>RH</text>
                <rect x="117" y="75" width="6" height="120" rx="3" fill="url(#logoGrad)" />
                
                <g className="compass-needle">
                    <path d="M120 70 L126 125 L114 125 Z" fill="#ffffff" />
                    <path d="M120 180 L126 125 L114 125 Z" fill={secondaryColor} />
                    <circle cx="120" cy="125" r="4" fill={primaryColor} />
                </g>

                <path d="M50 165 Q 50 225, 120 230 Q 190 225, 190 165" fill="none" stroke={primaryColor} strokeWidth="12" strokeLinecap="round" />
            </g>
        </svg>
    </div>
  );
};
