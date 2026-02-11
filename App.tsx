import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MenuItem, Language, SocialPost, Reservation, GuestUser } from './types';
import { Logo } from './components/Logo';
import { LanguageSelector } from './components/LanguageSelector';
import { SocialFeed } from './components/SocialFeed';
import { ChatBot } from './components/ChatBot';
import { StaffLoginModal } from './components/StaffLoginModal';
import { StaffDashboard } from './components/StaffDashboard';
import { ReservationModal } from './components/ReservationModal';
import { GuestPostModal } from './components/GuestPostModal';
import { Confetti } from './components/Confetti';
import { UI_STRINGS } from './constants/translations';
import { generateSpeech } from './services/geminiService';
import { Settings, ArrowRight, Volume2, Plus, Sparkles } from 'lucide-react';

const INITIAL_MENU: MenuItem[] = [
  { id: 'p1', name: "Pizza Margherita", description: "Tomaten, Mozzarella, Basilikum. Der Klassiker aus Neapel.", price: 15.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&q=80&w=800", translations: {} },
  { id: 'p2', name: "Pizza Napoli", description: "Tomaten, Mozzarella, Kapern, Sardellen. Kräftig im Geschmack.", price: 18.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800", translations: {} },
  { id: 'p17', name: "PIZZA RHEINHAFEN", description: "Unsere Signatur-Pizza: Tomaten, Mozzarella, Champignons, Oliven, Artischocken, Büffelmozzarella und frischer Rucola.", price: 24.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800", translations: {} },
  { id: 'w1', name: "Ripasso Ca'Botta", description: "Trauben: Corvina Veronese, Corvinone, Rondinella. Voll von reifen Kirschen.", price: 59.00, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800", translations: {} },
  { id: 'd1', name: "Tiramisu della Casa", description: "Hausgemacht nach altem Familienrezept.", price: 12.50, category: 'Dessert', available: true, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800", translations: {} }
];

const CARNEVAL_MENU: MenuItem[] = [
  { id: 'c1', name: "Basler Mehlsuppe", description: "Die traditionelle Stärkung während der drey scheenschte Dääg. Mit Reibkäse serviert.", price: 12.00, category: 'Vorspeise', available: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800", translations: {} },
  { id: 'c2', name: "Zwiebelwähe", description: "Herzhafter Kuchen mit Zwiebeln und Speck – ein Fasnacht-Muss.", price: 14.50, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800", translations: {} },
  { id: 'c3', name: "Basler Fastenwähe", description: "Traditionelles Gebäck mit Kümmel. Perfekt als Snack zwischendurch.", price: 6.50, category: 'Vorspeise', available: true, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800", translations: {} }
];

const CATEGORIES = ['Alle', 'Vorspeise', 'Hauptgang', 'Dessert', 'Getränke'];

export default function App() {
  const [userMode, setUserMode] = useState<'customer' | 'staff'>('customer');
  const [language, setLanguage] = useState<Language>('de');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [carnevalMode, setCarnevalMode] = useState(true);
  
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('restaurantMenu');
    const baseMenu = saved ? JSON.parse(saved) : INITIAL_MENU;
    return carnevalMode ? [...CARNEVAL_MENU, ...baseMenu] : baseMenu;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('restaurantReservations');
    return saved ? JSON.parse(saved) : [];
  });

  const [posts, setPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem('restaurantPosts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [hasStarted, setHasStarted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  
  const [currentGuest] = useState<GuestUser>({
    id: 'guest-1',
    name: 'Hafen Gast',
    instagramHandle: '@rheinhafen_gast',
    isActivated: true,
    permissions: { readProfile: true, postToFeed: true, manageMedia: true }
  });

  const [speakingItemId, setSpeakingItemId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const t = UI_STRINGS[language];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableNum = params.get('table');
    if (tableNum) setActiveTable(tableNum);
  }, []);

  useEffect(() => { localStorage.setItem('restaurantMenu', JSON.stringify(menu)); }, [menu]);

  const initAudio = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    } catch (e) {}
  };

  const speakMenuItem = async (item: MenuItem) => {
    initAudio();
    if (speakingItemId === item.id) {
      currentSourceRef.current?.stop();
      setSpeakingItemId(null);
      return;
    }

    setSpeakingItemId(item.id);
    const displayName = (language !== 'de' && item.translations?.[language]) ? item.translations[language].name : item.name;
    const displayDesc = (language !== 'de' && item.translations?.[language]) ? item.translations[language].description : item.description;

    const textToSpeak = carnevalMode 
      ? `Hoi! Ich bin Sora. Es ist Fasnacht, und ich empfehle Ihnen unsere ${displayName}. ${displayDesc}. En Guete am Hafen!`
      : `Guten Tag! Ich bin Sora. Lassen Sie mich Ihnen von unserer ${displayName} erzählen. ${displayDesc}. Ein wahrer Genuss am Rhein!`;
    
    try {
      const audioData = await generateSpeech(textToSpeak);
      if (audioData && audioContextRef.current) {
        const buffer = await audioContextRef.current.decodeAudioData(audioData.buffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setSpeakingItemId(null);
        currentSourceRef.current = source;
        source.start(0);
      } else {
        setSpeakingItemId(null);
      }
    } catch (e) {
      setSpeakingItemId(null);
    }
  };

  return (
    <div className={`min-h-screen bg-[#001C30] text-white flex flex-col relative overflow-x-hidden ${carnevalMode ? 'selection:bg-orange-500' : 'selection:bg-blue-500'}`}>
      {carnevalMode && <Confetti />}
      
      {!hasStarted ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center">
          <div className={`absolute inset-0 ${carnevalMode ? 'bg-[radial-gradient(circle_at_center,_rgba(255,157,0,0.15)_0%,_transparent_70%)]' : 'bg-[radial-gradient(circle_at_center,_rgba(29,78,216,0.15)_0%,_transparent_70%)]'} animate-pulse`} />
          <Logo className="w-48 h-48 md:w-64 md:h-64 mb-8 z-10" carnevalMode={carnevalMode} />
          <h1 className="text-6xl md:text-9xl font-bold brand-font mb-2 uppercase text-white z-10 tracking-tighter">RHEINHAFEN</h1>
          <p className={`${carnevalMode ? 'text-orange-400' : 'text-blue-400'} uppercase font-black tracking-[0.4em] mb-12 z-10 text-[10px] md:text-xs`}>
            {carnevalMode ? 'BASLER FASNACHT EDITION' : 'GASTFREUNDSCHAFT AM RHEIN'}
          </p>
          <button 
            onClick={() => { initAudio(); setHasStarted(true); }} 
            className={`w-full max-w-sm px-10 py-8 ${carnevalMode ? 'bg-orange-600' : 'bg-blue-700'} text-white rounded-[2rem] font-black text-lg shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4 border border-white/20 z-10 group active:scale-95`}
          >
            <span>{carnevalMode ? 'DREY SCHEENSCHTE DÄÄG' : 'SAAL BEITRETEN'}</span>
            <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      ) : (
        <>
          <header className={`${carnevalMode ? 'bg-orange-950/90' : 'bg-[#002B5B]/90'} backdrop-blur-xl border-b border-white/10 p-4 md:p-6 sticky top-0 z-40 flex justify-between items-center transition-colors duration-1000`}>
            <div className="flex items-center gap-3 md:gap-4">
              <Logo className="w-10 h-10 md:w-12 md:h-12" carnevalMode={carnevalMode} />
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold brand-font flex items-center gap-2">
                  Rheinhafen {activeTable && <span className={`text-[10px] ${carnevalMode ? 'bg-orange-600' : 'bg-blue-600'} text-white px-3 py-1 rounded-full uppercase font-black animate-pulse shadow-lg`}>Tisch {activeTable}</span>}
                </h1>
                <p className="text-[8px] uppercase tracking-widest text-white/40 font-black tracking-[0.3em]">
                   {carnevalMode ? 'Morgestraich & Mehlsuppe' : "Gastfreundschaft am Rhein"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-4 items-center">
               <button onClick={() => setCarnevalMode(!carnevalMode)} className={`p-2.5 md:p-3 border border-white/20 rounded-full transition-all ${carnevalMode ? 'bg-orange-600 text-white' : 'text-white/40 hover:text-white'}`} title="Fasnacht-Modus">
                  <Sparkles size={18} />
               </button>
               <button onClick={() => isAuthenticated ? setUserMode(userMode === 'customer' ? 'staff' : 'customer') : setShowLogin(true)} className="p-2.5 md:p-3 border border-white/20 rounded-full hover:bg-white/5 transition-colors">
                  <Settings size={18} />
               </button>
               <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 md:py-16 flex-grow max-w-7xl">
            {userMode === 'staff' ? (
              <StaffDashboard menu={menu} setMenu={setMenu} posts={posts} setPosts={setPosts} language={language} reservations={reservations} setReservations={setReservations} />
            ) : (
              <div className="space-y-20 md:space-y-32">
                <section className="text-center space-y-8 animate-in fade-in duration-1000">
                   <div className={`inline-flex items-center gap-3 ${carnevalMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-blue-500/10 border-blue-500/20'} border px-6 py-2 rounded-full mb-4`}>
                      <Sparkles className={carnevalMode ? 'text-orange-500' : 'text-blue-500'} size={16} />
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${carnevalMode ? 'text-orange-500' : 'text-blue-500'}`}>
                         {carnevalMode ? t.carnevalTitle : 'Exklusives Hafen-Ambiente'}
                      </span>
                   </div>
                   <h2 className="text-5xl md:text-9xl font-bold brand-font uppercase leading-[0.85] tracking-tighter whitespace-pre-line">
                      {carnevalMode ? 'Hoi\nFasnacht' : 'Willkommen\nam Hafen'}
                   </h2>
                   <p className="text-white/40 text-sm md:text-xl max-w-2xl mx-auto italic leading-relaxed px-4">"{t.introText}"</p>
                   <div className="flex justify-center gap-6 pt-4">
                      <button onClick={() => setIsReservationOpen(true)} className={`px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest ${carnevalMode ? 'bg-orange-600' : 'bg-blue-700'} shadow-2xl hover:scale-105 transition-all active:scale-95`}>Tisch Reservieren</button>
                      <button onClick={() => setShowPostModal(true)} className="px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/20 bg-white/5 hover:bg-white/10 transition-all active:scale-95">Moment Teilen</button>
                   </div>
                </section>

                <section id="menu-section">
                   <div className="flex gap-3 overflow-x-auto no-scrollbar mb-12 sticky top-24 z-30 bg-[#001C30]/90 backdrop-blur-xl py-6 -mx-4 px-4 border-b border-white/5">
                      {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${selectedCategory === cat ? (carnevalMode ? 'bg-orange-600 border-orange-400 text-white shadow-xl' : 'bg-blue-600 border-blue-400 text-white shadow-xl') : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
                          {cat}
                        </button>
                      ))}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                      {menu.filter(i => selectedCategory === 'Alle' || i.category === selectedCategory).map(item => {
                        const isCarnevalItem = item.id.startsWith('c');
                        const name = (language !== 'de' && item.translations?.[language]) ? item.translations[language].name : item.name;
                        const description = (language !== 'de' && item.translations?.[language]) ? item.translations[language].description : item.description;

                        return (
                          <div key={item.id} className={`bg-white/5 border ${isCarnevalItem ? 'border-orange-500/40' : 'border-white/10'} rounded-[3rem] overflow-hidden group hover:border-white/20 transition-all flex flex-col h-full shadow-2xl`}>
                             <div className="aspect-[4/3] relative overflow-hidden">
                                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt={name} />
                                <button 
                                  onClick={() => speakMenuItem(item)} 
                                  className={`absolute top-6 right-6 p-5 backdrop-blur-2xl border border-white/20 rounded-full transition-all active:scale-90 ${speakingItemId === item.id ? (carnevalMode ? 'bg-orange-600 animate-pulse' : 'bg-blue-600 animate-pulse') : 'bg-black/40 text-white/70 hover:text-white'}`}
                                >
                                   <Volume2 size={24} />
                                </button>
                                {isCarnevalItem && (
                                   <div className="absolute top-6 left-6 px-4 py-2 bg-orange-600 text-white text-[9px] font-black uppercase rounded-full shadow-lg">Fasnacht</div>
                                )}
                             </div>
                             <div className="p-8 md:p-10 space-y-6 flex-grow flex flex-col">
                                <div className="flex justify-between items-start gap-4">
                                  <h3 className="text-2xl font-bold brand-font uppercase leading-none tracking-tight">{name}</h3>
                                  <span className={`text-[9px] font-black ${carnevalMode ? 'text-orange-400 bg-orange-400/10' : 'text-blue-400 bg-blue-400/10'} px-3 py-1 rounded-full uppercase shrink-0`}>{item.category}</span>
                                </div>
                                <p className="text-white/40 text-sm italic leading-relaxed flex-grow">"{description}"</p>
                                <div className="pt-8 flex justify-between items-center border-t border-white/10">
                                   <div className="flex flex-col">
                                     <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Star Preis</span>
                                     <span className={`text-2xl font-black ${carnevalMode ? 'text-orange-500' : 'text-blue-500'} tracking-tighter`}>CHF {item.price.toFixed(2)}</span>
                                   </div>
                                   <button className={`w-14 h-14 bg-white/5 rounded-[1.5rem] flex items-center justify-center ${carnevalMode ? 'hover:bg-orange-600' : 'hover:bg-blue-700'} hover:text-white transition-all shadow-xl active:scale-90 border border-white/10`}>
                                      <Plus size={28} />
                                   </button>
                                </div>
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </section>

                <section>
                   <div className="flex flex-col items-center gap-4 text-center mb-16">
                      <h3 className="text-4xl md:text-6xl font-bold brand-font uppercase tracking-tighter">Hafen Momente</h3>
                      <p className={`${carnevalMode ? 'text-orange-500' : 'text-blue-500'} font-black uppercase text-[10px] tracking-[0.5em]`}>
                         {carnevalMode ? 'DREI SCHEENSCHTE DÄÄG LIVE' : 'LIVE AUS DEM @RESTAURANTRHEINHAFEN'}
                      </p>
                   </div>
                   <SocialFeed posts={posts.filter(p => p.status === 'approved')} language={language} />
                </section>
              </div>
            )}
          </main>

          <ChatBot menu={menu} posts={posts} language={language} autoStart={true} carnevalMode={carnevalMode} />
          <StaffLoginModal language={language} isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={p => { if(p==='1234'){setIsAuthenticated(true);setUserMode('staff');setShowLogin(false);return true;}return false;}} />
          <ReservationModal language={language} isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} onReserve={r => setReservations(prev => [r, ...prev])} />
          <GuestPostModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} guest={currentGuest} language={language} onPost={p => setPosts(prev => [p, ...prev])} />
        </>
      )}

      <footer className="p-16 md:p-32 border-t border-white/5 text-center mt-32 bg-blue-950/20">
         <p className="text-[11px] font-black uppercase tracking-[0.6em] text-white/30 mb-4">Gastronomie am Rheinhafen</p>
         <p className="text-[9px] uppercase tracking-widest text-white/10">© 2026 Rheinhafen Kleinhüningen · Basel · Swiss</p>
         <div className="mt-12">
            <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${carnevalMode ? 'text-orange-500/20 border-orange-500/10' : 'text-blue-500/20 border-blue-500/10'} px-6 py-2 border rounded-full italic`}>Hafen-Erlebnis v1.1.0</span>
         </div>
      </footer>
    </div>
  );
}
