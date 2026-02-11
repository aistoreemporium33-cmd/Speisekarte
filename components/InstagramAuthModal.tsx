
import React, { useState, useRef } from 'react';
import { Instagram, X, Shield, Check, Lock, Info, Loader2, ArrowRight, User, Camera, Upload } from 'lucide-react';
import { GuestPermissions } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { handle: string; avatar: string; perms: GuestPermissions }) => void;
}

const PRESET_AVATARS = [
  'https://i.pravatar.cc/150?u=a',
  'https://i.pravatar.cc/150?u=b',
  'https://i.pravatar.cc/150?u=c',
  'https://i.pravatar.cc/150?u=d',
];

export const InstagramAuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'login' | 'permissions'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [handle, setHandle] = useState('@gast_rheinhafen');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [perms, setPerms] = useState<GuestPermissions>({
    readProfile: true,
    postToFeed: true,
    manageMedia: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setStep('permissions');
    setIsSubmitting(false);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    onSuccess({
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      avatar,
      perms
    });
    setIsSubmitting(false);
  };

  const PermissionToggle = ({ 
    label, 
    active, 
    onToggle, 
    desc 
  }: { 
    label: string; 
    active: boolean; 
    onToggle: () => void; 
    desc: string 
  }) => (
    <div className="flex items-start justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer" onClick={onToggle}>
      <div className="flex-1 pr-4">
        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          {label}
          {active && <Check size={12} className="text-green-500" />}
        </h4>
        <p className="text-[10px] text-white/40 mt-1 leading-relaxed">{desc}</p>
      </div>
      <div className={`w-10 h-6 rounded-full p-1 transition-all ${active ? 'bg-pink-600' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[120] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#121212] w-full max-w-sm rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-pink-600/10 to-transparent flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 rounded-xl">
              <Instagram className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Instagram API</h3>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Rheinhafen verknüpfen</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-8">
          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center space-y-3 mb-8">
                <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <img src={avatar} className="w-full h-full rounded-full object-cover border-2 border-pink-500" />
                   <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={24} />
                   </div>
                   <div className="absolute -bottom-1 -right-1 bg-pink-600 p-2 rounded-full border-2 border-[#121212]">
                      <Upload size={12} className="text-white" />
                   </div>
                   <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
                <h4 className="text-xl font-bold text-white uppercase tracking-tight">Profil anpassen</h4>
                <p className="text-xs text-white/40 leading-relaxed italic">Wählen Sie Ihr Profilbild und Ihren Handle für die Simulation.</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1">Instagram Handle</label>
                    <input 
                      required 
                      type="text" 
                      value={handle}
                      onChange={e => setHandle(e.target.value)}
                      placeholder="@dein_account" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-pink-500 outline-none transition-all" 
                    />
                 </div>
                 <div className="flex justify-center gap-3">
                    {PRESET_AVATARS.map(url => (
                      <button key={url} type="button" onClick={() => setAvatar(url)} className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${avatar === url ? 'border-pink-500 scale-110' : 'border-white/10 hover:border-white/30'}`}>
                        <img src={url} className="w-full h-full object-cover" />
                      </button>
                    ))}
                 </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all mt-6">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <>Simulation Starten <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl">
                  <img src={avatar} className="w-12 h-12 rounded-full border-2 border-pink-500 object-cover" />
                  <div>
                    <h4 className="font-bold text-white">{handle}</h4>
                    <p className="text-[10px] text-white/40 uppercase font-black">Bereit zur Verknüpfung</p>
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="text-pink-500" size={14} />
                    <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Berechtigungen</span>
                  </div>
                  <PermissionToggle 
                    label="Profil lesen" 
                    active={perms.readProfile} 
                    onToggle={() => setPerms({...perms, readProfile: !perms.readProfile})}
                    desc="Erlaubt Rheinhafen deinen Namen und dein Profilbild zu sehen."
                  />
                  <PermissionToggle 
                    label="Posten erlauben" 
                    active={perms.postToFeed} 
                    onToggle={() => setPerms({...perms, postToFeed: !perms.postToFeed})}
                    desc="Gäste-Posts erscheinen automatisch in der Rheinhafen-News Sektion."
                  />
               </div>

               <button onClick={handleFinish} disabled={isSubmitting} className="w-full py-5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <>Verbindung Bestätigen <ArrowRight size={18} /></>}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
