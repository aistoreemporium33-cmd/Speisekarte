
import React, { useState, useMemo } from 'react';
import { X, Mail, Lock, User, Loader2, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { Language, GuestUser } from '../types';
import { UI_STRINGS } from '../constants/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLogin: (guest: GuestUser) => void;
}

export const GuestAuthModal: React.FC<Props> = ({ isOpen, onClose, language, onLogin }) => {
  const t = UI_STRINGS[language];
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email wird benötigt.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Geben Sie eine gültige Email ein.';
    }

    if (!formData.password) {
      newErrors.password = 'Passwort wird benötigt.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mindestens 6 Zeichen.';
    }

    if (isRegistering && !formData.name.trim()) {
      newErrors.name = 'Ihr Name wird benötigt.';
    }

    return newErrors;
  }, [formData, isRegistering]);

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, name: true });

    if (Object.keys(errors).length > 0) return;
    
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    
    // Fix: Removed 'email' property as it's not in GuestUser interface, and added required 'id'
    onLogin({
      id: `guest-${Date.now()}`,
      name: formData.name || formData.email.split('@')[0],
      isActivated: false,
      permissions: { readProfile: true, postToFeed: true, manageMedia: false }
    });
    setIsLoading(false);
    onClose();
  };

  const isInvalid = (field: string) => !!(touched[field] && errors[field]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#001C30] rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/10 overflow-hidden">
        <div className="bg-blue-800/20 p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2">
            <User size={18} className="text-blue-500" />
            <h3 className="font-black text-white uppercase tracking-widest text-sm">
              {isRegistering ? 'Konto erstellen' : 'Gäste-Login'}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
          {isRegistering && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  onBlur={() => handleBlur('name')}
                  className={`w-full bg-white/5 border ${isInvalid('name') ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-all text-sm`} 
                  placeholder="Ihr Name" 
                />
              </div>
              {isInvalid('name') && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.name}</p>}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                onBlur={() => handleBlur('email')}
                className={`w-full bg-white/5 border ${isInvalid('email') ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-all text-sm`} 
                placeholder="email@beispiel.ch" 
              />
            </div>
            {isInvalid('email') && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Passwort</label>
            <div className="relative">
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                onBlur={() => handleBlur('password')}
                className={`w-full bg-white/5 border ${isInvalid('password') ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-all text-sm`} 
                placeholder="••••••••" 
              />
            </div>
            {isInvalid('password') ? (
              <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.password}</p>
            ) : isRegistering && (
              <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest ml-1 flex items-center gap-1"><Info size={10} /> Mindestens 6 Zeichen erforderlich.</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white py-5 rounded-2xl font-black uppercase flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-900/40 tracking-widest text-xs"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>{isRegistering ? 'Registrieren' : 'Einloggen'} <ArrowRight size={20} /></>}
          </button>
          
          <button 
            type="button" 
            onClick={() => { setIsRegistering(!isRegistering); setTouched({}); }} 
            className="w-full text-center text-[10px] text-white/40 font-black uppercase tracking-widest hover:text-white mt-4 underline underline-offset-4 decoration-white/10"
          >
            {isRegistering ? 'Bereits ein Konto? Zum Login' : 'Noch kein Konto? Hier registrieren'}
          </button>
        </form>
      </div>
    </div>
  );
};
