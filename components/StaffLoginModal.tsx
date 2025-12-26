
import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => boolean;
}

export const StaffLoginModal: React.FC<Props> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (success) {
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-slate-800">
        <div className="bg-[#003399] p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <h3 className="font-bold">Mitarbeiter Login</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-slate-400 text-sm">
            Dieser Bereich ist nur für autorisiertes Personal. Bitte geben Sie das Zugangspasswort ein.
          </p>
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Passwort eingeben"
              className={`w-full p-3 rounded-lg border outline-none focus:ring-2 transition-all bg-slate-800 text-white ${
                error 
                  ? 'border-red-900/50 focus:border-red-500 focus:ring-red-900 bg-red-900/10' 
                  : 'border-slate-700 focus:border-[#003399] focus:ring-blue-900'
              }`}
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mt-1 ml-1">Falsches Passwort. Bitte versuchen Sie es erneut.</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-[#003399] text-white py-3 rounded-lg font-bold hover:bg-[#002266] transition shadow-md active:scale-[0.98]"
          >
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
};