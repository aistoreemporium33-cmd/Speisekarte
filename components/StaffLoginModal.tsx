
import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, ShieldCheck, ArrowRight, KeyRound, Loader2, Fingerprint, Circle, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { UI_STRINGS } from '../constants/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (pin: string) => boolean;
  language: Language;
}

export const StaffLoginModal: React.FC<Props> = ({ isOpen, onClose, onLogin, language }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const t = UI_STRINGS[language];
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) return;
    
    setIsLoading(true);
    setError(false);
    
    setTimeout(() => {
      const success = onLogin(pin);
      if (!success) {
        setError(true);
        setPin('');
        setIsLoading(false);
        // Tactile vibration if supported
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        setIsLoading(false);
      }
    }, 600);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(val);
    if (error) setError(false);
    
    if (val.length === 4) {
      setTimeout(() => handleSubmit(), 200);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className={`bg-[#001C30] rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all border border-white/10 relative ${error ? 'animate-shake border-red-500/50' : ''}`}>
        
        <div className="bg-blue-800/10 p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shadow-lg transition-colors ${error ? 'bg-red-600' : 'bg-blue-600'}`}>
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-white uppercase tracking-widest text-sm">{t.staffLogin}</h3>
              <p className="text-[10px] text-white/40 uppercase font-black tracking-tighter">Personal Cockpit</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white p-2 rounded-full transition hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Fingerprint className={`${error ? 'text-red-500 scale-110' : 'text-blue-500'} transition-all duration-300`} size={48} />
              {isLoading && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              )}
            </div>
            
            <div className="flex justify-center gap-4">
               {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      pin.length > i 
                        ? 'bg-blue-400 scale-125 shadow-[0_0_10px_rgba(96,165,250,0.5)]' 
                        : 'bg-white/10'
                    } ${error ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}`} 
                  />
               ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10" noValidate>
            <div className="relative group">
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={handlePinChange}
                disabled={isLoading}
                className="opacity-0 absolute inset-0 cursor-default"
                autoFocus
              />
              <div className="flex justify-between gap-3">
                 {[0, 1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className={`flex-1 h-20 bg-white/5 border-2 rounded-3xl flex items-center justify-center text-4xl font-black transition-all ${
                        error 
                          ? 'border-red-500 bg-red-500/10' 
                          : pin.length === i 
                            ? 'border-blue-500 bg-blue-500/10 ring-8 ring-blue-500/5' 
                            : 'border-white/10'
                      }`}
                    >
                       {pin[i] ? (
                         <div className="w-4 h-4 bg-white rounded-full animate-in zoom-in" />
                       ) : (
                         <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                       )}
                    </div>
                 ))}
              </div>
            </div>

            <div className="h-6">
              {error && (
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 flex items-center justify-center gap-2">
                  <AlertTriangle size={12} /> PIN ungültig
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading || pin.length < 4}
              className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-20 text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 text-xs"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>Bestätigen <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>
      </div>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-10px); }
            80% { transform: translateX(10px); }
          }
          .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        `}
      </style>
    </div>
  );
};
