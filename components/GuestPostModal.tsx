
import React, { useState, useRef, useMemo } from 'react';
import { X, Camera, Image, Send, Loader2, Sparkles, Instagram, Megaphone, Upload, AlertCircle, Wand2, RefreshCw, Heart, MessageCircle, Share2, Bookmark, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Language, SocialPost, GuestUser } from '../types';
import { generateGuestCaption, enhanceGuestImage } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestUser;
  language: Language;
  onPost: (post: SocialPost) => void;
}

const AI_STYLES = [
  { id: 'glow', label: 'Hafen-Glow', icon: '🌅' },
  { id: 'gourmet', label: 'Gourmet', icon: '🍽️' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬' },
  { id: 'vintage', label: 'Vintage', icon: '🎞️' },
];

export const GuestPostModal: React.FC<Props> = ({ isOpen, onClose, guest, language, onPost }) => {
  const [file, setFile] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<string | null>(null);
  const [userNote, setUserNote] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canPost = !!file && !!caption && !isPosting;

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError('Bild zu groß (max 10MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result as string);
        setOriginalFile(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(selected);
    }
  };

  const triggerUpload = (useCamera: boolean) => {
    if (fileInputRef.current) {
      if (useCamera) {
        fileInputRef.current.setAttribute('capture', 'environment');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  const handleEnhance = async () => {
    if (!originalFile || !selectedStyle) return;
    setIsEnhancing(true);
    setError(null);
    try {
      const enhanced = await enhanceGuestImage(originalFile, selectedStyle);
      if (enhanced) {
        setFile(enhanced);
      } else {
        setError("KI-Veredelung fehlgeschlagen. Bitte versuche es erneut.");
      }
    } catch (err) {
      setError("Verbindungsfehler zur KI.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateCaption = async () => {
    if (userNote.length < 3) return;
    setIsGenerating(true);
    setError(null);
    try {
      const aiCaption = await generateGuestCaption(userNote, language);
      setCaption(aiCaption);
    } catch (err) {
      setCaption(userNote); // Fallback to user note
      setError("Unterschrift konnte nicht generiert werden.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePost = async () => {
    if (!canPost) return;
    setIsPosting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      
      onPost({
        id: `guest-${Date.now()}`,
        platform: 'instagram',
        content: caption,
        date: 'Gerade eben',
        image: file!,
        isGuestPost: true,
        guestHandle: guest.instagramHandle || guest.name,
        guestAvatar: guest.profilePicture || 'https://i.pravatar.cc/150',
        status: 'pending'
      });
      
      onClose();
    } catch (err) {
      setError("Post konnte nicht veröffentlicht werden.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[130] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#001C30] w-full max-w-5xl rounded-[3rem] border border-white/10 overflow-hidden flex flex-col md:flex-row h-[90vh]">
        <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8 border-r border-white/5 custom-scrollbar">
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-black uppercase brand-font">Hafen Creator Studio</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {!file ? (
            <div className="h-80 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center bg-white/5 space-y-8 animate-in zoom-in">
               <div className="w-20 h-20 bg-blue-700/20 rounded-full flex items-center justify-center">
                  <Camera className="text-blue-500" size={32} />
               </div>
               <div className="flex flex-col sm:flex-row gap-4 w-full px-12">
                  <button 
                    onClick={() => triggerUpload(true)} 
                    className="flex-1 py-5 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                  >
                    <Camera size={20} /> Kamera
                  </button>
                  <button 
                    onClick={() => triggerUpload(false)} 
                    className="flex-1 py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all border border-white/10 active:scale-95"
                  >
                    <Image size={20} /> Galerie
                  </button>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Wähle eine Quelle für deinen Moment</p>
               <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Wand2 size={16} className="text-blue-400" />
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">KI-Veredelung</span>
                 </div>
                 <button onClick={() => { setFile(originalFile); setSelectedStyle(null); }} className="text-[9px] font-bold text-white/20 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors">
                    <RefreshCw size={10} /> Zurücksetzen
                 </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {AI_STYLES.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setSelectedStyle(s.id)} 
                    disabled={isEnhancing}
                    className={`p-4 rounded-2xl border text-center transition-all ${selectedStyle === s.id ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/20'} disabled:opacity-50`}
                  >
                    <span className="text-xl block mb-1">{s.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-white">{s.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleEnhance} disabled={!selectedStyle || isEnhancing} className="w-full py-5 bg-blue-700 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40 disabled:opacity-50 active:scale-95 transition-all">
                {isEnhancing ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Stil anwenden</>}
              </button>
              
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center ml-1">
                   <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Deine Story</label>
                   <span className="text-[9px] font-bold text-white/20 uppercase">{userNote.length} Zeichen</span>
                </div>
                <textarea 
                  value={userNote} 
                  onChange={e => setUserNote(e.target.value)} 
                  placeholder="Erzähl Pasquale kurz von deinem Moment..." 
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm outline-none focus:border-blue-500 h-32 resize-none transition-all shadow-inner text-white" 
                />
                <button 
                  onClick={handleGenerateCaption} 
                  disabled={isGenerating || userNote.length < 3} 
                  className="w-full py-5 bg-blue-950/60 border border-blue-500/20 text-blue-400 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-blue-900/60 transition-all active:scale-95 disabled:opacity-50"
                >
                   {isGenerating ? <Loader2 className="animate-spin" /> : <><Sparkles size={16} /> Pasquale's Bildunterschrift generieren</>}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 animate-in slide-in-from-bottom-2">
               <AlertCircle size={18} />
               <span className="text-[11px] font-black uppercase tracking-widest">{error}</span>
            </div>
          )}

          <div className="flex-1" />
          <button 
            onClick={handlePost} 
            disabled={!canPost} 
            className="w-full py-6 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-[2rem] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
          >
            {isPosting ? <Loader2 className="animate-spin" /> : <><Send size={22} /> Moment veröffentlichen</>}
          </button>
        </div>

        <div className="hidden md:flex w-2/5 bg-black/40 p-12 items-center justify-center overflow-hidden relative">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(29,78,216,0.15)_0%,_transparent_70%)]" />
           {file && (
             <div className="w-full max-w-[340px] bg-[#001424] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-in slide-in-from-right-12 duration-700 relative z-10">
                <div className="p-5 flex items-center gap-3 border-b border-white/5">
                  <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-yellow-500 to-pink-500">
                    <img src={guest.profilePicture || 'https://i.pravatar.cc/150'} className="w-full h-full rounded-full object-cover border-2 border-[#001424]" />
                  </div>
                  <div>
                     <span className="text-xs font-black uppercase tracking-tighter block">{guest.instagramHandle || guest.name}</span>
                     <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Rheinhafen Basel</span>
                  </div>
                </div>
                <div className="aspect-square relative group">
                  <img src={file} className="w-full h-full object-cover animate-in fade-in duration-1000" alt="Preview" />
                  {isEnhancing && (
                    <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center">
                       <Loader2 className="animate-spin text-white" size={32} />
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-3">
                   <div className="flex items-center gap-4 mb-2">
                      <Heart size={22} className="text-white/80" />
                      <MessageCircle size={22} className="text-white/80" />
                      <Share2 size={22} className="text-white/80" />
                   </div>
                   <p className="text-sm leading-relaxed text-white/90">
                     <span className="font-black mr-2 uppercase text-[10px] tracking-widest">{guest.instagramHandle?.replace('@', '').toLowerCase() || 'gast'}</span>
                     {caption || <span className="text-white/20 italic">Warten auf Inspiration von Pasquale...</span>}
                   </p>
                   <div className="flex gap-2 pt-2">
                      <span className="text-[10px] font-black text-blue-400 uppercase">#rheinhafen</span>
                      <span className="text-[10px] font-black text-blue-400 uppercase">#basel</span>
                   </div>
                </div>
             </div>
           )}
           {!file && (
             <div className="text-center space-y-4 opacity-20 relative z-10">
                <Instagram size={64} className="mx-auto" />
                <p className="text-xs font-black uppercase tracking-[0.4em]">Instagram Vorschau</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
