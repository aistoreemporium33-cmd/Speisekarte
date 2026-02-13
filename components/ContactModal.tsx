
import React, { useState } from 'react';
import { X, Send, Mail, User, CheckCircle2, Loader2, MessageSquare, Info } from 'lucide-react';
import { Language, ContactMessage } from '../types';
import { UI_STRINGS } from '../constants/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSendMessage: (msg: ContactMessage) => void;
}

export const ContactModal: React.FC<Props> = ({ isOpen, onClose, language, onSendMessage }) => {
  const t = UI_STRINGS[language];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));

    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      date: new Date().toLocaleString(language),
      isRead: false
    };

    onSendMessage(newMessage);
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#001C30] rounded-[3rem] border border-blue-500/30 w-full max-w-lg overflow-hidden relative shadow-2xl">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-4">
            <MessageSquare className="w-8 h-8 text-orange-400" />
            <div>
              <h3 className="text-xl font-bold brand-font uppercase">{t.contactTitle}</h3>
              <p className="text-[10px] font-black uppercase opacity-60">{t.contactSub}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-black/10 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="text-center space-y-8 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                 <CheckCircle2 className="text-white" size={48} />
              </div>
              <div>
                <h4 className="text-3xl font-bold brand-font uppercase mb-2">{t.contactSuccess}</h4>
                <p className="text-white/40 text-xs italic">{t.contactSuccessInfo}</p>
              </div>
              <button onClick={handleClose} className="w-full bg-blue-700 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-xl hover:bg-blue-600 transition-colors">
                Schliessen
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">{t.contactName}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white outline-none focus:border-blue-500" placeholder="Uè! Wie heisst du?" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">{t.contactEmail}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white outline-none focus:border-blue-500" placeholder="email@beispiel.ch" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">{t.contactSubject}</label>
                <div className="relative">
                  <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white outline-none focus:border-blue-500" placeholder="Betreff deiner Nachricht" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">{t.contactMessage}</label>
                <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-5 text-sm text-white outline-none focus:border-blue-500 h-32 resize-none transition-all" placeholder="Was können wir für dich tun?" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-700 hover:bg-blue-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> {t.contactSend}</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
