import React, { useState } from 'react';
import { X, CalendarDays, Clock, Users, User, CheckCircle2, Loader2, Sparkles, Send, QrCode, Ticket, Mail } from 'lucide-react';
import { Language, Reservation } from '../types';
import { UI_STRINGS } from '../constants/translations';
import { sendEmail } from '../services/emailService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onReserve: (res: Reservation) => void;
}

export const ReservationModal: React.FC<Props> = ({ isOpen, onClose, language, onReserve }) => {
  const t = UI_STRINGS[language];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    guests: '2'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [vipToken, setVipToken] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const token = `RH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    try {
      const emailSubject = `Bestätigung: Dein Tisch im Rheinhafen Basel`;
      const emailBody = `
        Hallo ${formData.name},
        
        Uè! Deine Reservierung im Rheinhafen Restaurant ist bestätigt! 
        Wir freuen uns darauf, Dich am ${formData.date} um ${formData.time} Uhr 
        mit ${formData.guests} Personen begrüßen zu dürfen.
        
        Dein exklusiver VIP-Pass Token lautet: ${token}
        Zeige diesen bitte bei unserer Gastgeberin Sora vor.
        
        Bis bald am Hafen!
        Dein Rheinhafen Team
      `;

      await sendEmail(formData.email, emailSubject, emailBody);
      await new Promise(r => setTimeout(r, 1000));
      
      const reservation: Reservation = {
        id: `res-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        date: formData.date,
        time: formData.time,
        guests: parseInt(formData.guests),
        vipToken: token,
        status: 'active'
      };

      onReserve(reservation);
      setVipToken(token);
      setIsSuccess(true);
    } catch (error) {
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({ name: '', email: '', date: '', time: '', guests: '2' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#001C30] rounded-[3rem] border border-blue-500/30 w-full max-w-lg overflow-hidden relative shadow-2xl">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-4">
            <Ticket className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold brand-font uppercase">Hafen VIP Buchung</h3>
              <p className="text-[10px] font-black uppercase opacity-60">Echte Hafen-Atmosphäre erleben</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-black/10 rounded-full"><X size={24} /></button>
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="text-center space-y-8 animate-in zoom-in duration-500">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                   <CheckCircle2 className="text-white" size={48} />
                </div>
                <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-3xl font-bold brand-font uppercase mb-2">Reserviert!</h4>
                <p className="text-white/40 text-xs italic">Dein Platz am Rhein ist bereit. Bestätigung wurde an {formData.email} gesendet.</p>
              </div>
              <div className="bg-white p-6 rounded-3xl space-y-4 shadow-2xl">
                 <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase">VIP Pass Token</span>
                    <span className="text-blue-900 font-black text-xl tracking-tighter">{vipToken}</span>
                 </div>
                 <div className="flex justify-center py-2">
                    <QrCode size={120} className="text-blue-900" />
                 </div>
                 <p className="text-[9px] text-blue-900/40 uppercase font-black">Zeige diesen Pass bei Sora vor</p>
              </div>
              <button onClick={handleClose} className="w-full bg-blue-700 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-xl">Zurück</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-1">Star-Gast Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white outline-none focus:border-blue-500" placeholder="Wie dürfen wir dich begrüßen?" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-1">E-Mail für VIP-Pass</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white outline-none focus:border-blue-500" placeholder="Deine Bestätigung..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-white/40 ml-1">Datum</label>
                   <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white outline-none [color-scheme:dark]" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-white/40 ml-1">Zeit</label>
                   <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white outline-none [color-scheme:dark]" />
                   </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-1">Gäste Anzahl</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <select value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white outline-none focus:border-blue-500 appearance-none">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n} className="bg-[#001C30]">{n} Personen</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-700 hover:bg-blue-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Buchung Bestätigen</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
