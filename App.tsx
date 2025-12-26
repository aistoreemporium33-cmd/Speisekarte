
import React, { useState, useEffect } from 'react';
import { MenuItem, Language, SocialPost, Reservation, DEFAULT_CATEGORIES } from './types';
import { Logo } from './components/Logo';
import { LanguageSelector } from './components/LanguageSelector';
import { SocialFeed } from './components/SocialFeed';
import { ChatBot } from './components/ChatBot';
import { StaffLoginModal } from './components/StaffLoginModal';
import { StaffDashboard } from './components/StaffDashboard';
import { Fireworks } from './components/Fireworks';
import { Snowfall } from './components/Snowfall';
import { CountdownTimer } from './components/CountdownTimer';
import { 
  Utensils, 
  Settings, 
  CalendarDays, 
  Clock, 
  Phone, 
  MapPin, 
  ArrowRight,
  Anchor,
  Palette,
  MessageSquare,
  Globe,
  Trash2,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Loader2,
  Wand2,
  LogOut,
  PartyPopper,
  Star,
  Sparkles,
  Snowflake,
  Music,
  Wine
} from 'lucide-react';

const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'Gala-Mehlsuppe', description: 'Traditionelle Basler Mehlsuppe, veredelt für den Silvesterabend.', price: 14.50, category: 'Vorspeise', available: true, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000&auto=format&fit=crop' },
  { id: '2', name: 'Hummer Müllerin Art', description: 'Frischer Hummer mit Champagnersauce und Petersilienkartoffeln.', price: 58.00, category: 'Hauptgang', available: true, image: 'https://images.unsplash.com/photo-1559740038-1914a93e3dfb?q=80&w=1000&auto=format&fit=crop' },
  { id: '3', name: 'Rheinhafen NYE Burger', description: 'Dry-Aged Rind, Trüffel-Mayo, Blattgold-Akzente, Pommes Frites.', price: 32.50, category: 'Hauptgang', available: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop' }
];

export default function App() {
  const [userMode, setUserMode] = useState<'customer' | 'staff'>('customer');
  const [language, setLanguage] = useState<Language>('de');
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [hasStarted, setHasStarted] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [newYearMode, setNewYearMode] = useState(true);

  const handleEnter = () => {
    setHasStarted(true);
    setAutoSpeak(true);
  };

  const themeClass = 'bg-[#002B5B]';

  return (
    <div className={`min-h-screen bg-[#001C30] text-red-500 flex flex-col transition-colors duration-1000 selection:bg-red-500 selection:text-white relative overflow-x-hidden`}>
      <style>
        {`
          @keyframes gold-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .gold-text {
            background: linear-gradient(90deg, #d4af37, #f9e29c, #d4af37);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gold-shimmer 3s linear infinite;
          }
          .gala-glow {
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.2), 0 0 40px rgba(239, 68, 68, 0.1);
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
          @keyframes dynamic-tilt {
            0%, 100% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(-10deg) scale(1.05); }
            50% { transform: rotate(15deg) scale(1.15); }
            75% { transform: rotate(-5deg) scale(1.05); }
          }
          .animate-tilt {
            animation: dynamic-tilt 4s infinite cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}
      </style>

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-blue-600 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-blue-900 rounded-full blur-[120px]"></div>
      </div>

      {newYearMode && (
        <>
          <Fireworks />
          <Snowfall />
        </>
      )}
      
      {!hasStarted ? (
        <div className={`fixed inset-0 ${themeClass} z-[100] flex flex-col items-center justify-center p-4 transition-colors duration-1000`}>
          <div className="animate-in fade-in zoom-in duration-1000 flex flex-col items-center text-center max-w-lg z-10">
            <div className="relative group">
              <Logo className="w-56 h-56 mb-8 group-hover:scale-105 transition-transform" newYearMode={newYearMode} />
              <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-pulse" size={40} />
              <div className="absolute -bottom-6 -left-6 text-red-400/30 animate-bounce">
                <Wine size={48} strokeWidth={1} />
              </div>
            </div>
            <h1 className={`text-5xl md:text-8xl font-bold brand-font mb-2 uppercase tracking-tighter drop-shadow-2xl ${newYearMode ? 'gold-text' : 'text-red-500'}`}>
              RHEINHAFEN
            </h1>
            <p className="text-red-400/80 tracking-[0.4em] mb-12 text-sm md:text-base font-bold flex items-center gap-3">
              <PartyPopper size={16} className="text-yellow-500" />
              {newYearMode ? 'SILVESTER GALA 2026' : 'RESTAURANT BASEL'}
              <Music size={16} className="text-yellow-500" />
            </p>
            <div className="flex flex-col gap-6 w-full px-8">
              <button onClick={handleEnter} className="group px-12 py-6 bg-red-600 text-white rounded-full font-bold text-xl shadow-2xl hover:scale-105 active:scale-95 transition flex items-center justify-center gap-3 border-2 border-red-400 gala-glow">
                <Sparkles className="hidden group-hover:block animate-spin-slow text-yellow-300" size={24} />
                <span>Gala betreten</span>
                <ArrowRight className="group-hover:translate-x-1 transition" />
              </button>
              <button onClick={() => setNewYearMode(!newYearMode)} className="text-red-400/70 text-xs flex items-center gap-2 justify-center hover:text-red-300 transition uppercase tracking-widest bg-black/30 py-2 rounded-full backdrop-blur-sm group border border-red-500/10">
                <Wine size={14} className="group-hover:scale-125 transition-transform text-yellow-500" /> 
                {newYearMode ? 'Normales Blau' : 'Silvester Modus'}
                <PartyPopper size={14} className="group-hover:rotate-12 transition-transform text-red-500" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <header className={`${themeClass} text-red-500 shadow-2xl p-6 flex flex-col md:flex-row justify-between items-center sticky top-0 z-40 transition-colors border-b ${newYearMode ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Logo className="w-12 h-12" newYearMode={newYearMode} />
                {newYearMode && <Sparkles size={14} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />}
              </div>
              <div>
                <h1 className={`text-2xl font-bold brand-font flex items-center gap-2 ${newYearMode ? 'gold-text' : ''}`}>
                  RHEINHAFEN
                  {newYearMode && <Star size={14} className="text-yellow-400 fill-yellow-400 animate-pulse hidden sm:block" />}
                </h1>
                <p className="text-[9px] text-red-400 tracking-[0.2em] font-black uppercase flex items-center gap-1 opacity-80">
                  {newYearMode ? <Wine size={8} className="text-yellow-500" /> : <Star size={8} className="fill-red-400" />}
                  {userMode === 'staff' ? 'Gala Management' : 'San Silvestro Gala'} 
                  {newYearMode ? <PartyPopper size={8} className="text-yellow-500" /> : <Star size={8} className="fill-red-400" />}
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0 items-center">
               <button 
                 onClick={() => setNewYearMode(!newYearMode)} 
                 className={`p-2.5 rounded-full transition-all border shadow-lg ${newYearMode ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-400' : 'bg-red-600 border-red-400'} text-white hover:rotate-12 flex items-center justify-center`}
                 title="Modus umschalten"
               >
                 {newYearMode ? <PartyPopper size={20} className="text-yellow-100" /> : <Snowflake size={20} />}
               </button>
               
               <div className="flex items-center gap-2">
                 <button onClick={() => isAuthenticated ? setUserMode(userMode === 'customer' ? 'staff' : 'customer') : setShowLogin(true)} className={`px-5 py-2 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95 bg-blue-900/50 ${newYearMode ? 'border-yellow-500/50 text-yellow-500' : 'border-red-500/50 text-red-500'} flex items-center gap-2`}>
                   {userMode === 'customer' ? <Settings size={14} /> : <Sparkles size={14} />}
                   {userMode === 'customer' ? 'MITARBEITER' : 'GAST-ANSICHT'}
                 </button>
                 {newYearMode && (
                   <div className="animate-tilt flex items-center justify-center pointer-events-none ml-1">
                     <PartyPopper size={20} className="text-yellow-500 drop-shadow-[0_0_12px_rgba(234,179,8,0.6)]" />
                   </div>
                 )}
               </div>
               
               <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
            </div>
          </header>

          <main className="container mx-auto px-4 py-12 flex-grow relative z-10">
            {userMode === 'staff' ? (
              <StaffDashboard menu={menu} setMenu={setMenu} />
            ) : (
              <>
                <section className="text-center mb-16 animate-in fade-in slide-in-from-top-6 duration-700">
                  <div className="flex justify-center items-center gap-6 mb-2">
                    {newYearMode && <Music size={28} className="text-yellow-500/40 animate-bounce" />}
                    <h2 className={`text-5xl md:text-7xl font-bold brand-font tracking-tight drop-shadow-md ${newYearMode ? 'gold-text' : 'text-red-500'}`}>
                      {newYearMode ? 'Felice Anno Nuovo!' : 'Benvenuto Signore!'}
                    </h2>
                    {newYearMode && <Wine size={28} className="text-yellow-500/40 animate-pulse" />}
                  </div>
                  <div className={`w-32 h-1 mx-auto mb-8 rounded-full ${newYearMode ? 'bg-gradient-to-r from-transparent via-yellow-500 to-transparent shadow-[0_0_15px_rgba(212,175,55,0.6)]' : 'bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                  <p className="text-red-200/90 font-medium max-w-2xl mx-auto leading-relaxed text-lg mb-8">
                    {newYearMode 
                      ? 'Feiern Sie den exklusivsten Jahreswechsel im Rheinhafen. Enzo präsentiert Ihnen unsere limitierte Gala-Karte in einer Atmosphäre von Gold und Blau.'
                      : 'Tauchen Sie ein in die maritime Welt des Rheinhafens. Enzo und sein Team erwarten Sie mit sizilianischer Herzlichkeit.'}
                  </p>
                  
                  {newYearMode && <CountdownTimer />}
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {menu.map(item => (
                    <div key={item.id} className={`group bg-blue-950/40 backdrop-blur-xl rounded-3xl overflow-hidden border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${newYearMode ? 'border-yellow-500/20 hover:border-yellow-500/60 hover:shadow-yellow-500/10' : 'border-red-500/20 hover:border-red-500/50 hover:shadow-red-500/20'} ${!item.available && 'opacity-60'}`}>
                      <div className="h-56 overflow-hidden relative">
                        <img src={item.image} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!item.available && 'grayscale'}`} alt={item.name} />
                        {item.available ? (
                          <div className={`absolute top-4 right-4 ${newYearMode ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-yellow-500/40' : 'bg-red-600 shadow-red-500/40'} text-white text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1`}>
                            <Star size={10} className="fill-white" /> {newYearMode ? 'GALA CHOICE' : 'EMPFEHLUNG'}
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-blue-950/80 flex items-center justify-center">
                            <span className="text-white font-black tracking-[0.2em] text-sm uppercase rotate-12 border-2 border-white px-4 py-2">AUSVERKAUFT</span>
                          </div>
                        )}
                        {newYearMode && <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg border border-yellow-500/30"><Wine size={12} className="text-yellow-500" /></div>}
                      </div>
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${newYearMode ? 'text-yellow-500' : 'text-red-500'}`}>
                            {item.name}
                            {item.category === 'Getränke' && <Wine size={18} className="text-yellow-600" />}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                           <span className={`h-[1px] flex-1 ${newYearMode ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}></span>
                           <span className={`${newYearMode ? 'text-yellow-400' : 'text-red-400'} font-black text-xl brand-font flex items-center gap-1`}>
                             {newYearMode ? <Sparkles size={14} className="text-yellow-500/40" /> : <Snowflake size={14} className="text-red-400/40" />}
                             CHF {item.price.toFixed(2)}
                           </span>
                        </div>
                        <p className="text-red-200/70 text-sm leading-relaxed italic line-clamp-2">{item.description}</p>
                        
                        <div className="mt-6 pt-6 border-t border-red-500/10 flex justify-center">
                          <button className={`text-[10px] font-bold ${newYearMode ? 'text-yellow-500/80 hover:text-yellow-400' : 'text-red-400 hover:text-red-300'} transition-colors flex items-center gap-1 uppercase tracking-widest`}>
                            <MessageSquare size={12} /> Enzo fragen
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>

          <footer className={`mt-20 py-12 border-t bg-blue-950/50 ${newYearMode ? 'border-yellow-500/20' : 'border-red-500/20'}`}>
            <div className="container mx-auto px-4 text-center">
               <div className="relative inline-block mb-6">
                 <Logo className="w-16 h-16 mx-auto opacity-90" newYearMode={newYearMode} />
                 {newYearMode && <Sparkles className="absolute -top-2 -right-4 text-yellow-500/40 animate-pulse" size={24} />}
               </div>
               <p className={`text-sm tracking-[0.2em] mb-4 uppercase flex items-center justify-center gap-2 ${newYearMode ? 'text-yellow-500/60' : 'text-red-400/60'}`}>
                 <Star size={10} className={newYearMode ? 'fill-yellow-500' : ''} /> 
                 Rheinhafen Restaurant Basel 
                 <Star size={10} className={newYearMode ? 'fill-yellow-500' : ''} />
               </p>
               <div className="flex flex-col md:flex-row justify-center gap-6 text-red-300/60">
                  <span className="flex items-center justify-center gap-2 hover:text-red-400 transition-colors"><MapPin size={16} /> Hochbergerstr. 160</span>
                  <span className="flex items-center justify-center gap-2 hover:text-red-400 transition-colors"><Phone size={16} /> +41 61 631 31 31</span>
               </div>
               {newYearMode && (
                 <div className="mt-8 flex justify-center gap-4 text-yellow-500/40">
                   <Music size={20} /> <Wine size={20} /> <PartyPopper size={20} />
                 </div>
               )}
            </div>
          </footer>

          <ChatBot menu={menu} posts={[]} language={language} autoStart={autoSpeak} newYearMode={newYearMode} />
          <StaffLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={(pw) => { if(pw === 'cengizbal') { setIsAuthenticated(true); setUserMode('staff'); setShowLogin(false); return true; } return false; }} />
        </>
      )}
    </div>
  );
}
