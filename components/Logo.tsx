
import React from 'react';

interface Props {
  className?: string;
  src?: string | null;
  newYearMode?: boolean;
}

export const Logo: React.FC<Props> = ({ className = "h-16 w-16", src, newYearMode }) => {
  if (src) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <img src={src} alt="Rheinhafen Logo" className="w-full h-full object-contain drop-shadow-md" />
      </div>
    );
  }

  const primaryColor = newYearMode ? "#d4af37" : "#ef4444";
  const secondaryColor = newYearMode ? "#9a7b0c" : "#991b1b";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
        <style>
          {`
            @keyframes rh-glow-red {
              0%, 100% { 
                filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.4)) 
                        drop-shadow(0 0 15px rgba(239, 68, 68, 0.2)); 
                transform: scale(1);
              }
              50% { 
                filter: drop-shadow(0 0 25px rgba(239, 68, 68, 0.9)) 
                        drop-shadow(0 0 45px rgba(239, 68, 68, 0.6))
                        drop-shadow(0 0 70px rgba(239, 68, 68, 0.3)); 
                transform: scale(1.06);
              }
            }
            @keyframes rh-glow-gold {
              0%, 100% { 
                filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.5)) 
                        drop-shadow(0 0 20px rgba(212, 175, 55, 0.2)); 
                transform: scale(1);
              }
              50% { 
                filter: drop-shadow(0 0 30px rgba(212, 175, 55, 1)) 
                        drop-shadow(0 0 55px rgba(212, 175, 55, 0.7))
                        drop-shadow(0 0 90px rgba(212, 175, 55, 0.4)); 
                transform: scale(1.1);
              }
            }
            @keyframes needle-swing {
              0%, 100% { transform: rotate(-2deg); }
              50% { transform: rotate(2deg); }
            }
            @keyframes bubble-rise {
              0% { transform: translateY(0) translateX(0) scale(0); opacity: 0; }
              20% { opacity: 0.6; scale: 0.8; }
              50% { transform: translateY(-40px) translateX(10px) scale(1); }
              80% { transform: translateY(-80px) translateX(-5px) scale(1.1); opacity: 0.4; }
              100% { transform: translateY(-100px) translateX(0) scale(1.4); opacity: 0; }
            }
            .rh-monogram {
              animation: ${newYearMode ? 'rh-glow-gold 3.5s infinite ease-in-out' : 'rh-glow-red 3.5s infinite ease-in-out'};
              transform-origin: center;
              display: inline-block;
            }
            .compass-needle {
              transform-origin: 120px 125px;
              animation: needle-swing 4s infinite ease-in-out;
            }
            .bubble {
              animation: bubble-rise 3s infinite linear;
              transform-origin: center;
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
                {/* Champagne Bubbles in NY Mode - Enhanced realism */}
                {newYearMode && [0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                  <circle 
                    key={i}
                    cx={60 + (i * 12) % 120} 
                    cy={180 + (i % 3) * 10} 
                    r={0.8 + (i % 3)} 
                    fill="#f9e29c" 
                    className="bubble"
                    style={{ 
                      animationDelay: `${i * 0.25}s`,
                      animationDuration: `${2.5 + (i % 2)}s`
                    }}
                  />
                ))}

                {/* --- KOMPASS ELEMENTE --- */}
                <g transform="translate(120, 125)" opacity="0.4">
                    <circle cx="0" cy="0" r="85" fill="none" stroke={primaryColor} strokeWidth="0.5" strokeDasharray="2 4" />
                    <path d="M0 -85 L10 -20 L0 0 L-10 -20 Z" fill={primaryColor} />
                    <path d="M0 85 L10 20 L0 0 L-10 20 Z" fill={primaryColor} />
                    <path d="M85 0 L20 10 L0 0 L20 -10 Z" fill={primaryColor} />
                    <path d="M-85 0 L-20 10 L0 0 L-20 -10 Z" fill={primaryColor} />
                    <g transform="rotate(45)">
                        <path d="M0 -65 L6 -15 L0 0 L-6 -15 Z" fill={primaryColor} opacity="0.6" />
                        <path d="M0 65 L6 15 L0 0 L-6 15 Z" fill={primaryColor} opacity="0.6" />
                        <path d="M65 0 L15 6 L0 0 L15 -6 Z" fill={primaryColor} opacity="0.6" />
                        <path d="M-65 0 L-15 6 L0 0 L-15 -6 Z" fill={primaryColor} opacity="0.6" />
                    </g>
                </g>

                <g fontFamily="Cinzel, serif" fontSize="18" fontWeight="700" fill={primaryColor}>
                    <text x="120" y="32" textAnchor="middle">N</text>
                    <text x="120" y="235" textAnchor="middle">S</text>
                    <text x="225" y="132" textAnchor="middle">O</text>
                    <text x="15" y="132" textAnchor="middle">W</text>
                </g>

                <text x="120" y="65" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="42" fontWeight="700" fill={primaryColor}>RH</text>
                <rect x="117" y="75" width="6" height="120" rx="3" fill="url(#logoGrad)" />
                
                <g transform="translate(120, 125)">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                        <rect key={a} x="-2" y="-55" width="4" height="110" rx="2" fill={primaryColor} transform={`rotate(${a})`} />
                    ))}
                    <circle cx="0" cy="0" r="38" fill="none" stroke={primaryColor} strokeWidth="8" />
                </g>

                <g className="compass-needle">
                    <path d="M120 70 L126 125 L114 125 Z" fill="#ffffff" opacity="0.9" />
                    <path d="M120 180 L126 125 L114 125 Z" fill={secondaryColor} />
                    <circle cx="120" cy="125" r="4" fill={primaryColor} />
                </g>

                <path d="M50 165 Q 50 225, 120 230 Q 190 225, 190 165" fill="none" stroke={primaryColor} strokeWidth="12" strokeLinecap="round" />
                <path d="M50 165 L35 180 L65 180 Z" fill={primaryColor} transform="rotate(-15, 50, 165)" />
                <path d="M190 165 L175 180 L205 180 Z" fill={primaryColor} transform="rotate(15, 190, 165)" />
            </g>
        </svg>
    </div>
  );
};
