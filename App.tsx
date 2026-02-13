
import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, Language, SocialPost, Reservation, GuestUser, Category, ContactMessage } from './types';
import { Logo } from './components/Logo';
import { LanguageSelector } from './components/LanguageSelector';
import { SocialFeed } from './components/SocialFeed';
import { ChatBot } from './components/ChatBot';
import { StaffLoginModal } from './components/StaffLoginModal';
import { StaffDashboard } from './components/StaffDashboard';
import { ReservationModal } from './components/ReservationModal';
import { GuestPostModal } from './components/GuestPostModal';
import { ContactModal } from './components/ContactModal';
import { Confetti } from './components/Confetti';
import { UI_STRINGS } from './constants/translations';
import { generateSpeech } from './services/geminiService';
import { Settings, ArrowRight, Volume2, Plus, Sparkles, Instagram, Utensils, Calendar, Coffee, Wine, Pizza, Mail } from 'lucide-react';

const INITIAL_MENU: MenuItem[] = [
  // SPARGEL SAISON
  { id: 'sp1', name: "Spargel Teller Classic", description: "Weisser Spargel mit Sauce Hollandaise dazu neue Kartoffeln", price: 29.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1515471209610-dae1c92d81fe?auto=format&fit=crop&q=80&w=800" },
  { id: 'sp2', name: "Spargel & Kalb Deluxe", description: "Weisser Spargel mit Sauce Hollandaise dazu Kalbsschnitzel natur", price: 42.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800" },
  { id: 'sp3', name: "Spargel & Poulet Light", description: "Grüner Spargel mit Pouletbrust vom Grill an Weisswein-Zitronensauce", price: 34.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&q=80&w=800" },
  { id: 'sp4', name: "Spargel & Lachs", description: "Weisser Spargel mit gebratenem Lachs an Zitronen-Hollandaise", price: 39.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800" },
  { id: 'sp5', name: "Spargel Pasta", description: "Spaghetti mit grünem Spargel & Cherry-Tomaten an Basilikum-Pesto", price: 24.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800" },
  { id: 'sp6', name: "Frühlingssalat", description: "Bunter Blattsalat mit Spargel, Erdbeeren, Nüssen & Hausdressing", price: 15.00, category: 'Salate', available: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },

  // VOM RIND
  { id: 'r1', name: "Entrecôte vom Grill", description: "mit Café de Paris", price: 32.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&q=80&w=800" },
  { id: 'r2', name: "Falsche Schnecke vom Grill", description: "zart gegrillt", price: 28.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800" },

  // VOM LAMM
  { id: 'l1', name: "Lammkotelette vom Grill", description: "saftig gegrillte Lammkotelettes", price: 32.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800" },
  { id: 'l2', name: "Lammsteak vom Grill", description: "zartes Lammsteak perfekt medium serviert", price: 32.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&q=80&w=800" },

  // VOM KALB
  { id: 'k1', name: "Kalbfleisch Zürcher Art", description: "fein geschnitten nach Zürcher Art mit Rösti", price: 30.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800" },
  { id: 'k2', name: "Kalbschnitzel paniert", description: "mit Pommes Frites", price: 30.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1599921841143-819065a55cc6?auto=format&fit=crop&q=80&w=800" },
  { id: 'k3', name: "Kalbs Cordon Bleu", description: "mit Pommes Frites", price: 34.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=800" },

  // VOM POULET
  { id: 'po1', name: "Poulet Cordon Bleu", description: "mit Pommes Frites", price: 24.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1562967914-6c827383d944?auto=format&fit=crop&q=80&w=800" },

  // VOM FISCH
  { id: 'fi1', name: "Eglifilet Müllerin Art", description: "mit Butterreis & Spinat", price: 31.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800" },
  { id: 'fi2', name: "Zanderfilet Steak", description: "gebraten mit Buttergemüse an Weisswein-Zitronensauce", price: 31.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1551248429-42207185c7d8?auto=format&fit=crop&q=80&w=800" },

  // PIZZAS (Sebastiano's Stolz)
  { id: 'p1', name: "Margherita", description: "Tomaten, Mozzarella, Basilikum", price: 15.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&q=80&w=800" },
  { id: 'p7', name: "PIZZA RHEINHAFEN", description: "Tomaten, Mozzarella, Champignons, Oliven, Artischocken, Büffelmozzarella, Rucola", price: 24.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800" },
  
  // SPEZIALITÄTEN
  { id: 's1', name: "Basler Mehlsuppe", description: "Traditionelle Fasnachtssuppe mit geröstetem Mehl und Parmesan (Aassiem's Spezialrezept)", price: 12.50, category: 'Vorspeise', available: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800" }
];

const CATEGORIES: Category[] = ['Alle', 'Saison', 'Hauptgang', 'Getränke', 'Vorspeise', 'Salate', 'Dessert', 'Frühstück'];

// Helper to decode raw PCM audio data from Gemini TTS
async function decodePCM(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default function App() {
  const [userMode, setUserMode] = useState<'customer' | 'staff'>('customer');
  const [language, setLanguage] = useState<Language>('de');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Alle');
  const [carnevalMode, setCarnevalMode] = useState(true);
  
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('rh_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('rh_reservations');
    return saved ? JSON.parse(saved) : [];
  });

  const [posts, setPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem('rh_posts');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem('rh_messages');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [hasStarted, setHasStarted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  
  const [currentGuest] = useState<GuestUser>({
    id: 'guest-1',
    name: 'Fasnacht Gast',
    instagramHandle: '@basler_fasnacht_hafen',
    isActivated: true,
    permissions: { readProfile: true, postToFeed: true, manageMedia: true }
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [speakingItemId, setSpeakingItemId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('rh_menu', JSON.stringify(menu));
    localStorage.setItem('rh_reservations', JSON.stringify(reservations));
    localStorage.setItem('rh_posts', JSON.stringify(posts));
    localStorage.setItem('rh_messages', JSON.stringify(messages));
  }, [menu, reservations, posts, messages]);

  const handleStart = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    setHasStarted(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const speakMenuItem = async (item: MenuItem) => {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext();
    if (speakingItemId === item.id) {
      currentSourceRef.current?.stop();
      setSpeakingItemId(null);
      return;
    }

    setSpeakingItemId(item.id);
    const text = `${item.name}. ${item.description}. Preis: ${item.price} Franken.`;
    const audioData = await generateSpeech(text);
    if (audioData) {
      const buffer = await decodePCM(audioData, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setSpeakingItemId(null);
      currentSourceRef.current = source;
      source.start(0);
    } else {
      setSpeakingItemId(null);
    }
  };

  const t = UI_STRINGS[language];

  return (
    <div className={`min-h-screen bg-[#1a0f00] text-white flex flex-col relative overflow-x-hidden ${carnevalMode ? 'selection:bg-orange-500' : 'selection:bg-blue-500'}`}>
      {carnevalMode && <Confetti />}
      
      {!hasStarted ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center bg-[#1a0f00]">
          <Logo className="w-48 h-48 mb-8 animate-bounce" carnevalMode={carnevalMode} />
          <h1 className="text-5xl md:text-8xl font-bold brand-font mb-4 uppercase tracking-tighter text-orange-500">RHEINHAFEN</h1>
          <p className="text-orange-200/40 mb-8 uppercase tracking-[0.5em] text-xs font-black">Basler Fasnacht am Hafen</p>
          <button 
            onClick={handleStart} 
            className={`px-12 py-6 bg-orange-600 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-4 text-white`}
          >
            Morgestraich! <ArrowRight />
          </button>
        </div>
      ) : (
        <>
          <header className={`sticky top-0 z-40 ${carnevalMode ? 'bg-orange-900/90' : 'bg-[#001C30]/90'} backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center`}>
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => scrollToSection('top')}>
              <Logo className="w-10 h-10" carnevalMode={carnevalMode} />
              <div className="hidden sm:block">
                <h1 className="font-bold brand-font text-lg text-orange-400">Rheinhafen</h1>
              </div>
            </div>
            
            <nav className="hidden lg:flex gap-6 items-center">
              <button onClick={() => scrollToSection('menu-section')} className="text-xs font-black uppercase tracking-widest hover:text-orange-400 transition-colors">Speisekarte</button>
              <button onClick={() => scrollToSection('social-section')} className="text-xs font-black uppercase tracking-widest hover:text-pink-400 transition-colors">Instagram</button>
              <button onClick={() => setIsReservationOpen(true)} className="text-xs font-black uppercase tracking-widest hover:text-yellow-400 transition-colors">Reservation</button>
              <button onClick={() => setIsContactOpen(true)} className="text-xs font-black uppercase tracking-widest hover:text-orange-400 transition-colors">Kontakt</button>
            </nav>

            <div className="flex gap-3 items-center">
               <button onClick={() => setCarnevalMode(!carnevalMode)} className={`p-2 rounded-full border border-white/10 ${carnevalMode ? 'bg-orange-600' : 'bg-white/5'}`}>
                  <Sparkles size={16} />
               </button>
               <button onClick={() => isAuthenticated ? setUserMode(userMode === 'customer' ? 'staff' : 'customer') : setShowLogin(true)} className="p-2 rounded-full border border-white/10 bg-white/5">
                  <Settings size={16} />
               </button>
               <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
            </div>
          </header>

          <main id="top" className="container mx-auto px-4 py-12 max-w-7xl flex-grow">
            {userMode === 'staff' ? (
              <StaffDashboard 
                menu={menu} setMenu={setMenu} 
                posts={posts} setPosts={setPosts} 
                language={language} 
                reservations={reservations} setReservations={setReservations} 
                messages={messages} setMessages={setMessages}
              />
            ) : (
              <div className="space-y-32">
                <section className="text-center space-y-8 animate-in fade-in duration-1000 py-20">
                   <h2 className="text-6xl md:text-9xl font-bold brand-font uppercase leading-none tracking-tighter text-orange-500">
                      {carnevalMode ? 'Hoi\nFasnacht' : 'Echt\nBasel'}
                   </h2>
                   <div className="bg-orange-600/10 border border-orange-500/20 p-6 rounded-3xl max-w-lg mx-auto">
                      <p className="text-orange-200 text-sm font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                        <Sparkles size={14} /> Spezialität: Basler Mehlsuppe verfügbar!
                      </p>
                   </div>
                   <p className="text-orange-100/40 text-lg max-w-2xl mx-auto italic">"{t.introText}"</p>
                   <div className="flex flex-wrap justify-center gap-4">
                      <button onClick={() => setIsReservationOpen(true)} className="px-10 py-5 bg-orange-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 hover:bg-orange-500 transition-all">
                        <Calendar size={18} /> Tisch Reservieren
                      </button>
                      <button onClick={() => setIsContactOpen(true)} className="px-10 py-5 bg-white/10 border border-white/20 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all">
                        <Mail size={18} /> Kontakt
                      </button>
                   </div>
                </section>

                <section id="menu-section" className="scroll-mt-24">
                   <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-4">
                        <Utensils className="text-orange-500" size={32} />
                        <h3 className="text-4xl font-bold brand-font uppercase text-orange-400">Speisekarte</h3>
                      </div>
                   </div>
                   
                   <div className="flex gap-2 overflow-x-auto no-scrollbar mb-12 pb-4 border-b border-white/5">
                      {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 transition-all ${selectedCategory === cat ? 'bg-orange-600 border-orange-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40'}`}>
                          {cat}
                        </button>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {menu
                        .filter(i => selectedCategory === 'Alle' || i.category === selectedCategory)
                        .map(item => (
                          <div key={item.id} className="bg-[#fff9f0] border border-[#e6d5bc] rounded-[3rem] overflow-hidden hover:shadow-2xl transition-all flex flex-col group relative shadow-xl">
                             <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]"></div>
                             
                             <div className="aspect-video relative overflow-hidden border-b border-[#e6d5bc]">
                                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt={item.name} />
                                <button onClick={() => speakMenuItem(item)} className={`absolute top-4 right-4 p-4 rounded-full backdrop-blur-xl border border-white/20 ${speakingItemId === item.id ? 'bg-orange-600 animate-pulse' : 'bg-black/40 text-white'}`}>
                                   <Volume2 size={20} />
                                </button>
                                <div className="absolute top-4 left-4">
                                   <span className="bg-orange-900 text-white text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-white/10 shadow-lg">
                                      {item.category}
                                   </span>
                                </div>
                             </div>
                             
                             <div className="p-8 space-y-4 flex-grow flex flex-col relative z-10 text-[#4a2e1e]">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-xl font-bold brand-font uppercase tracking-tight">{item.name}</h4>
                                  <span className="text-lg font-black text-orange-800 tracking-tighter">CHF {item.price.toFixed(2)}</span>
                                </div>
                                <p className="text-[#6d4c41] text-sm italic flex-grow leading-relaxed">"{item.description}"</p>
                                
                                <div className="pt-6 border-t border-[#e6d5bc]/50 mt-4 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                     {item.category === 'Hauptgang' && <Pizza size={16} className="text-[#8d6e63]" />}
                                     {item.category === 'Vorspeise' && <Utensils size={16} className="text-[#8d6e63]" />}
                                  </div>
                                  <button className="px-6 py-3 bg-orange-900 text-white rounded-xl hover:bg-orange-800 transition-colors text-[9px] font-black uppercase tracking-widest shadow-lg">
                                     Bestellen
                                  </button>
                                </div>
                             </div>
                          </div>
                        ))}
                   </div>
                </section>

                <section id="social-section" className="scroll-mt-24">
                   <div className="text-center mb-16 space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-500 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                         <Instagram className="text-white" size={40} />
                      </div>
                      <h3 className="text-4xl md:text-6xl font-bold brand-font uppercase tracking-tighter text-orange-500">Hafen Momente</h3>
                      <p className="text-orange-200/30 text-xs tracking-[0.3em] uppercase">#RESTAURANTRHEINHAFEN #FASNACHT2026</p>
                   </div>
                   <SocialFeed posts={posts.filter(p => p.status === 'approved')} language={language} />
                </section>
              </div>
            )}
          </main>

          <footer className="p-20 border-t border-white/5 text-center bg-black/20">
             <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-12 h-1px bg-white/10"></div>
                <Logo className="w-16 h-16 grayscale opacity-20" carnevalMode={carnevalMode} />
                <div className="w-12 h-1px bg-white/10"></div>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-200/20">Rheinhafen Kleinhüningen Basel · Fasnacht 2026</p>
          </footer>

          <ChatBot menu={menu} posts={posts} language={language} carnevalMode={carnevalMode} autoStart={hasStarted} />
          <StaffLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={p => { if(p==='1234'){setIsAuthenticated(true);setUserMode('staff');return true;} return false;}} language={language} />
          <ReservationModal isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} language={language} onReserve={r => setReservations(prev => [r, ...prev])} />
          <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} language={language} onSendMessage={m => setMessages(prev => [m, ...prev])} />
          <GuestPostModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} guest={currentGuest} language={language} onPost={p => setPosts(prev => [p, ...prev])} />
        </>
      )}
    </div>
  );
}
