
import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, Reservation, SocialPost, Language, Category } from '../types';
import { translateMenuItem, generateProfessionalResponse } from '../services/geminiService';
import { UI_STRINGS } from '../constants/translations';
import { 
  Edit, Trash2, Loader2, CalendarDays, User, Volume2, 
  CheckCircle, AlertCircle, Trash, QrCode, Printer, 
  Globe, Languages, Search, Filter, SlidersHorizontal, 
  Coins, Eye, EyeOff, XCircle, Check, Instagram, 
  MessageCircle, BarChart3, TrendingUp, Calendar, Send,
  Sparkles
} from 'lucide-react';

interface Props {
  menu: MenuItem[];
  setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  posts: SocialPost[];
  setPosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
  language: Language;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
}

const LANG_FLAGS: Record<Language, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  fr: '🇫🇷',
  it: '🇮🇹',
  tr: '🇹🇷'
};

const CATEGORIES = ['Alle', 'Vorspeise', 'Hauptgang', 'Dessert', 'Getränke'];

// Mock Comments for Social Studio
const MOCK_COMMENTS = [
  { id: 'c1', user: '@basel_foodie', text: 'Die Pizza Napoli war einfach unglaublich! Beste Kruste in der Stadt.', date: 'vor 2 Std.' },
  { id: 'c2', user: '@rhein_lover', text: 'Kommt bald wieder Mehlsuppe auf die Karte? Ich vermisse sie.', date: 'vor 5 Std.' },
  { id: 'c3', user: '@travel_ch', text: 'Wunderschöne Aussicht und toller Service. Sehr empfehlenswert.', date: 'Gestern' }
];

export const StaffDashboard: React.FC<Props> = ({ menu, setMenu, posts, setPosts, language, reservations, setReservations }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'reservations' | 'social' | 'moderation' | 'tables'>('tables');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPrintView, setIsPrintView] = useState(false);
  const [translatingItem, setTranslatingItem] = useState<string | null>(null);
  const [selectedTranslationLang, setSelectedTranslationLang] = useState<Language>('en');

  // Social Studio States
  const [generatingResponseId, setGeneratingResponseId] = useState<string | null>(null);
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Alle');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'unavailable'>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const [tables, setTables] = useState<string[]>(() => {
    const saved = localStorage.getItem('restaurantTables');
    return saved ? JSON.parse(saved) : ['1', '2', '3', '4', '5'];
  });

  const t = UI_STRINGS[language];

  useEffect(() => {
    localStorage.setItem('restaurantTables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleTranslate = async (item: MenuItem, targetLang: Language) => {
    if (translatingItem) return;
    setTranslatingItem(`${item.id}-${targetLang}`);
    
    try {
      const translationResult = await translateMenuItem(item, targetLang);
      if (translationResult) {
        setMenu(prev => prev.map(m => 
          m.id === item.id 
            ? { ...m, translations: { ...m.translations, ...translationResult } } 
            : m
        ));
        showToast(`Übersetzung für ${item.name} (${targetLang.toUpperCase()}) bereit!`);
      } else {
        showToast("Übersetzung fehlgeschlagen.", "error");
      }
    } catch (err) {
      showToast("KI-Dienst nicht erreichbar.", "error");
    } finally {
      setTranslatingItem(null);
    }
  };

  const handleAiResponse = async (commentId: string, commentText: string) => {
    setGeneratingResponseId(commentId);
    try {
      const response = await generateProfessionalResponse(commentText, language);
      setAiResponses(prev => ({ ...prev, [commentId]: response }));
      showToast("Professionelle Antwort generiert.");
    } catch (err) {
      showToast("Fehler bei der KI-Antwort.", "error");
    } finally {
      setGeneratingResponseId(null);
    }
  };

  const toggleAvailability = (itemId: string) => {
    setMenu(prev => prev.map(m => 
      m.id === itemId ? { ...m, available: !m.available } : m
    ));
    showToast("Verfügbarkeit aktualisiert.");
  };

  // Fixed: Implemented missing downloadQRCode function to handle table QR code downloads
  const downloadQRCode = (table: string) => {
    const canvas = document.createElement('canvas');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '?table=' + table)}&bgcolor=ffffff&color=001C30`;
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `rheinhafen-tisch-${table}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    img.src = qrUrl;
    showToast(`QR Code für Tisch ${table} wird heruntergeladen...`);
  };

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'Alle' || item.category === filterCategory;
      const matchesAvailability = filterAvailability === 'all' || 
                                 (filterAvailability === 'available' && item.available) || 
                                 (filterAvailability === 'unavailable' && !item.available);
      
      const price = item.price;
      const minP = minPrice === '' ? 0 : parseFloat(minPrice);
      const maxP = maxPrice === '' ? Infinity : parseFloat(maxPrice);
      const matchesPrice = price >= minP && price <= maxP;

      return matchesSearch && matchesCategory && matchesAvailability && matchesPrice;
    });
  }, [menu, searchQuery, filterCategory, filterAvailability, minPrice, maxPrice]);

  if (isPrintView) {
    return (
      <div className="fixed inset-0 bg-white z-[300] overflow-y-auto p-12 text-black print:p-0">
        <div className="flex justify-between items-center mb-12 print:hidden">
           <h2 className="text-2xl font-black uppercase text-blue-900">Druckvorschau QR-Codes</h2>
           <div className="flex gap-4">
              <button onClick={() => setIsPrintView(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold uppercase text-[10px]">Schließen</button>
              <button onClick={() => window.print()} className="px-6 py-3 bg-blue-700 text-white rounded-xl font-bold uppercase text-[10px] flex items-center gap-2">
                <Printer size={16} /> Jetzt Drucken
              </button>
           </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 print:grid-cols-3 print:gap-4">
          {tables.map(table => (
            <div key={table} className="border-2 border-gray-200 rounded-[2rem] p-8 flex flex-col items-center text-center page-break-inside-avoid shadow-sm">
               <div className="w-16 h-16 mb-4">
                  <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M120 70 L126 125 L114 125 Z" fill="#003399" />
                    <text x="120" y="65" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="42" fontWeight="700" fill="#003399">RH</text>
                  </svg>
               </div>
               <div className="bg-white p-2 border border-gray-100 rounded-xl mb-4">
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '?table=' + table)}&bgcolor=ffffff&color=001C30`} 
                   alt={`QR Tisch ${table}`}
                   className="w-48 h-48"
                 />
               </div>
               <h4 className="text-2xl font-black brand-font text-blue-900 uppercase">Tisch {table}</h4>
               <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">rheinhafen-basel.ch</p>
            </div>
          ))}
        </div>
        <style>{`@media print { body { background: white !important; } .print-hidden { display: none !important; } @page { margin: 1cm; } }`}</style>
      </div>
    );
  }

  const pendingCount = posts.filter(p => p.isGuestPost && p.status === 'pending').length;

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-500">
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success' ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-4xl md:text-5xl font-bold brand-font text-white uppercase leading-tight tracking-tighter">Hafen Cockpit</h2>
           <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-black mt-1 italic">Moderation & Star-Management</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setIsPrintView(true)} className="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-3 transition-all">
             <Printer size={18} className="text-blue-400" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white">Druck-Modus</span>
           </button>
        </div>
      </div>

      <div className="flex justify-center -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="bg-blue-950/60 p-1.5 rounded-3xl border border-white/10 flex gap-1">
          {[
            { id: 'tables', label: 'Tisch-Manager', icon: <QrCode size={14}/> },
            { id: 'reservations', label: 'VIP-Gäste', icon: <User size={14}/> },
            { id: 'menu', label: 'Speisekarte', icon: <Languages size={14}/> },
            { id: 'social', label: 'Social Studio', icon: <Instagram size={14}/> },
            { id: 'moderation', label: 'Posts', badge: pendingCount, icon: <Eye size={14}/> }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${activeTab === tab.id ? 'bg-blue-700 text-white shadow-xl' : 'text-white/40 hover:text-white'}`}>
              {tab.icon} {tab.label} {tab.badge ? <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px]">{tab.badge}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'social' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          {/* Instagram Account Card */}
          <div className="bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] p-[1px] rounded-[3rem] shadow-2xl">
            <div className="bg-[#001C30] rounded-[3rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-pink-600 to-purple-600">
                  <div className="w-full h-full rounded-full bg-[#001C30] p-1">
                    <img src="https://cdn-icons-png.flaticon.com/512/8805/8805068.png" className="w-full h-full object-contain" alt="IG" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase brand-font">@restaurantrheinhafen</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-green-400">
                      <CheckCircle size={12} /> Verbunden
                    </span>
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Offizieller Hafen-Account</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                 <div>
                   <p className="text-xl font-black text-white">1.2k</p>
                   <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Follower</p>
                 </div>
                 <div>
                   <p className="text-xl font-black text-white">842</p>
                   <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Interaktionen</p>
                 </div>
                 <div>
                   <TrendingUp size={24} className="text-green-500 mx-auto" />
                   <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">+12%</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Professional Interaction - AI Response Generator */}
            <div className="bg-blue-900/10 border border-white/5 rounded-[3rem] p-8 space-y-6">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-lg font-bold brand-font uppercase flex items-center gap-2">
                    <MessageCircle size={20} className="text-blue-500" /> Letzte Kommentare
                 </h4>
                 <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20">KI-Antworten aktiv</span>
              </div>
              <div className="space-y-4">
                {MOCK_COMMENTS.map(comment => (
                  <div key={comment.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 group hover:border-blue-500/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-blue-400">{comment.user}</span>
                        <span className="text-[9px] text-white/20 uppercase font-black">{comment.date}</span>
                      </div>
                      <button 
                        onClick={() => handleAiResponse(comment.id, comment.text)}
                        disabled={generatingResponseId === comment.id}
                        className="text-[9px] font-black uppercase text-blue-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {generatingResponseId === comment.id ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                        Antwort generieren
                      </button>
                    </div>
                    <p className="text-xs text-white/70 italic">"{comment.text}"</p>
                    {aiResponses[comment.id] && (
                      <div className="bg-blue-900/40 p-4 rounded-xl border border-blue-500/20 mt-2 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle size={10} className="text-blue-500" />
                          <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest">KI-Vorschlag (Professionell)</span>
                        </div>
                        <p className="text-[11px] text-white/90 leading-relaxed italic">"{aiResponses[comment.id]}"</p>
                        <div className="flex gap-2 pt-3">
                          <button className="flex-1 bg-blue-600 text-white text-[9px] font-black uppercase py-2 rounded-lg flex items-center justify-center gap-2">
                            <Send size={10} /> Senden
                          </button>
                          <button onClick={() => setAiResponses(prev => { const n = {...prev}; delete n[comment.id]; return n; })} className="px-3 bg-white/5 text-white/20 hover:text-white rounded-lg transition-colors">
                            <XCircle size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content Planner */}
            <div className="bg-blue-900/10 border border-white/5 rounded-[3rem] p-8 space-y-6">
               <h4 className="text-lg font-bold brand-font uppercase flex items-center gap-2 mb-4">
                  <Calendar size={20} className="text-purple-500" /> Inhalts-Planer
               </h4>
               <div className="space-y-4">
                  <div className="bg-purple-900/20 border border-purple-500/20 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-700/40 rounded-xl flex items-center justify-center text-purple-400">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-1">Heute posten (Empfehlung)</p>
                       <p className="text-xs text-white font-bold italic">"Präsentiere die neue Pizza Rheinhafen mit einem stimmungsvollen Video."</p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-white/20">Morgen, 11:00</span>
                        <span className="text-[8px] font-black uppercase text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">Geplant</span>
                     </div>
                     <p className="text-xs text-white/60">Story: Blick hinter die Kulissen bei Maestro Sebastiano.</p>
                  </div>
                  <button className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3">
                    <Edit size={16} /> Neuen Post planen
                  </button>
               </div>

               {/* Stats Overview */}
               <div className="pt-8 grid grid-cols-2 gap-4">
                  <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                     <BarChart3 size={18} className="text-blue-500 mb-2" />
                     <p className="text-[8px] font-black uppercase text-white/30">Engagement-Rate</p>
                     <p className="text-lg font-black text-white">4.8%</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                     <User size={18} className="text-pink-500 mb-2" />
                     <p className="text-[8px] font-black uppercase text-white/30">Neue Abonnenten</p>
                     <p className="text-lg font-black text-white">+42</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
           {/* LANGUAGES STUDIO */}
           <div className="bg-blue-900/20 p-8 rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <h3 className="text-xl font-bold text-white uppercase brand-font mb-2">Sprachen-Studio</h3>
                 <p className="text-white/40 text-[10px] uppercase tracking-widest font-black">Wählen Sie eine Zielsprache für KI-Übersetzungen</p>
              </div>
              <div className="flex gap-2 bg-black/20 p-2 rounded-2xl border border-white/5">
                 {(['en', 'fr', 'it', 'tr'] as Language[]).map(lang => (
                    <button 
                      key={lang} 
                      onClick={() => setSelectedTranslationLang(lang)}
                      className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all ${selectedTranslationLang === lang ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                       <span className="text-lg">{LANG_FLAGS[lang]}</span>
                       <span className="text-[10px] font-black uppercase">{lang}</span>
                    </button>
                 ))}
              </div>
           </div>

           {/* ADVANCED FILTER CENTER */}
           <div className="bg-blue-950/40 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                 <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      placeholder="Menü durchsuchen..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-blue-500 transition-all outline-none"
                    />
                 </div>
                 <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest border ${showFilters ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                 >
                    <SlidersHorizontal size={16} />
                    {showFilters ? 'Filter schließen' : 'Erweiterte Filter'}
                 </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-4">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-widest">
                       <Filter size={12} /> Kategorie
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => setFilterCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${filterCategory === cat ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/30'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-widest">
                       <CheckCircle size={12} /> Verfügbarkeit
                    </label>
                    <div className="bg-black/20 p-1 rounded-xl flex">
                      {(['all', 'available', 'unavailable'] as const).map(status => (
                        <button 
                          key={status}
                          onClick={() => setFilterAvailability(status)}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filterAvailability === status ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}
                        >
                          {status === 'all' ? 'Alle' : status === 'available' ? 'Aktiv' : 'Ausverkauft'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3 xl:col-span-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-widest">
                       <Coins size={12} /> Preisspanne (CHF)
                    </label>
                    <div className="flex items-center gap-4">
                       <input 
                         type="number" 
                         placeholder="Min" 
                         value={minPrice}
                         onChange={e => setMinPrice(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500"
                       />
                       <span className="text-white/20">bis</span>
                       <input 
                         type="number" 
                         placeholder="Max" 
                         value={maxPrice}
                         onChange={e => setMaxPrice(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500"
                       />
                       {(minPrice || maxPrice) && (
                         <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                           <Trash2 size={16} />
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              )}
           </div>

           <div className="flex justify-between items-center px-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                 Zeige <span className="text-blue-500">{filteredMenu.length}</span> von {menu.length} Artikeln
              </p>
           </div>

           <div className="grid grid-cols-1 gap-6">
              {filteredMenu.map(item => (
                <div key={item.id} className="bg-blue-900/10 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 group hover:border-blue-500/20 transition-all relative overflow-hidden">
                   <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-xl border border-white/10 relative">
                      <img src={item.image} className={`w-full h-full object-cover transition-all ${!item.available ? 'grayscale opacity-40' : ''}`} alt={item.name} />
                      {!item.available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <XCircle size={32} className="text-red-500/60" />
                        </div>
                      )}
                   </div>

                   <div className="flex-1 space-y-2 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h4 className={`text-xl font-bold text-white brand-font uppercase ${!item.available ? 'opacity-40' : ''}`}>{item.name}</h4>
                        <span className="text-[9px] font-black text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full uppercase tracking-tighter self-center">CHF {item.price.toFixed(2)}</span>
                      </div>
                      <p className={`text-white/40 text-xs italic line-clamp-2 ${!item.available ? 'opacity-20' : ''}`}>"{item.description}"</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                         {Object.keys(item.translations || {}).map(langCode => (
                            <span key={langCode} className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] font-black rounded-full uppercase tracking-tighter">
                               {LANG_FLAGS[langCode as Language]} {langCode} bereit
                            </span>
                         ))}
                      </div>
                   </div>

                   <div className="shrink-0 flex flex-wrap justify-center gap-3">
                      <button 
                        onClick={() => toggleAvailability(item.id)}
                        className={`p-4 rounded-2xl transition-all border ${item.available ? 'bg-white/5 border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30' : 'bg-red-500 border-red-400 text-white'}`}
                        title={item.available ? "Als ausverkauft markieren" : "Als verfügbar markieren"}
                      >
                         {item.available ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>

                      <button 
                        onClick={() => handleTranslate(item, selectedTranslationLang)}
                        disabled={!!translatingItem || !item.available}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-3 transition-all disabled:opacity-10"
                      >
                         {translatingItem === `${item.id}-${selectedTranslationLang}` ? <Loader2 className="animate-spin" size={16}/> : <Globe size={16} className="text-blue-500" />}
                         {selectedTranslationLang}
                      </button>
                      <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all"><Edit size={16}/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
          {reservations.map(res => (
            <div key={res.id} className="bg-blue-900/20 border border-white/10 p-8 rounded-[2.5rem] relative">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-700 flex items-center justify-center text-white"><User size={24} /></div>
                  <div><h4 className="text-xl font-bold text-white uppercase">{res.name}</h4><p className="text-blue-400 text-[10px] font-black uppercase">{res.guests} Stars</p></div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-white/60 font-black text-xs uppercase tracking-widest">
                 <div className="flex items-center gap-2"><CalendarDays size={16} className="text-blue-500" /> {res.date}</div>
                 <div className="flex items-center gap-2"><Volume2 size={16} className="text-blue-500" /> {res.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
          {posts.filter(p => p.isGuestPost).map(post => (
            <div key={post.id} className="bg-blue-900/10 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl group">
               <div className="aspect-square relative overflow-hidden">
                  <img src={post.image} className="w-full h-full object-cover" alt="Post" />
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg ${post.status === 'approved' ? 'bg-green-600' : post.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-600 animate-pulse'}`}>
                    {post.status}
                  </div>
               </div>
               <div className="p-8 space-y-4 flex-grow flex flex-col">
                  <div className="flex items-center gap-3">
                    <img src={post.guestAvatar} className="w-8 h-8 rounded-full border border-white/20" alt="Avatar" />
                    <span className="text-xs font-bold text-white">{post.guestHandle}</span>
                  </div>
                  <p className="text-xs text-white/40 italic flex-grow">"{post.content}"</p>
                  <div className="flex gap-2 pt-4">
                    <button onClick={() => setPosts(prev => prev.map(p => p.id === post.id ? {...p, status: 'approved'} : p))} className="flex-1 bg-green-600 py-3 rounded-xl flex items-center justify-center text-white"><Check size={18}/></button>
                    <button onClick={() => setPosts(prev => prev.map(p => p.id === post.id ? {...p, status: 'rejected'} : p))} className="flex-1 bg-red-600 py-3 rounded-xl flex items-center justify-center text-white"><XCircle size={18}/></button>
                    <button onClick={() => setPosts(prev => prev.filter(p => p.id !== post.id))} className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white"><Trash size={18}/></button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
          {tables.map(table => (
            <div key={table} className="bg-blue-900/10 border border-white/5 p-8 rounded-[3rem] flex flex-col items-center text-center space-y-6 group hover:border-blue-500/30 transition-all">
              <div className="bg-white p-3 rounded-2xl shadow-xl transition-transform group-hover:scale-105">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '?table=' + table)}&bgcolor=ffffff&color=001C30`} alt={`QR Tisch ${table}`} className="w-32 h-32" />
              </div>
              <div>
                <h4 className="text-2xl font-bold brand-font text-white uppercase">Tisch {table}</h4>
                <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">rheinhafen-basel.ch</p>
              </div>
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => downloadQRCode(table)}
                  className="flex-1 bg-blue-700 hover:bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <TrendingUp size={14} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
