
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
import { Settings, ArrowRight, Volume2, Plus, Sparkles, Instagram, Utensils, Calendar, Coffee, Wine, Pizza, Mail, Maximize2, X } from 'lucide-react';

const INITIAL_MENU: MenuItem[] = [
  // THAI MONTAGS-TAGESMENÜ (Neu)
  { id: 'tm1', name: "Pouletspiessli mit Erdnusssauce", description: "Zarte Pouletspiessli mit hausgemachter Erdnusssauce und frischem Salat", price: 16.00, category: 'Wochenmenü', available: true, image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=1200" },
  { id: 'tm2', name: "Panang Curry mit Rindfleisch", description: "Authentisches Panang Curry mit Rindfleisch, langen Bohnen und Jasminreis", price: 21.00, category: 'Wochenmenü', available: true, image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&q=80&w=1200" },
  { id: 'tm3', name: "Poulet mit Cashewnüssen", description: "Knusprig gebratenes Poulet mit Cashewnüssen, Gemüse und Jasminreis", price: 19.00, category: 'Wochenmenü', available: true, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=1200" },
  { id: 'tm4', name: "Gebratene Ente mit Ingwer", description: "Gebratene Ente mit frischem Ingwer, Wok-Gemüse und Eiernudeln", price: 24.00, category: 'Wochenmenü', available: true, image: "https://images.unsplash.com/photo-1512058560366-cd242959b4fe?auto=format&fit=crop&q=80&w=1200" },
  { id: 'tm5', name: "Gebratene gelbe Nudeln (Vegi)", description: "Gebratene gelbe Nudeln mit Tofu und knackigem Gemüse", price: 17.00, category: 'Wochenmenü', available: true, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=1200" },
  { id: 'tm6', name: "Asiatischer gemischter Salat", description: "Frischer Marktsalat mit asiatischem Dressing", price: 9.50, category: 'Vorspeise', available: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1200" },
  { id: 'tm7', name: "Vegetarische Glasnudelsuppe", description: "Klare Suppe mit Glasnudeln und feinem Gemüse", price: 10.50, category: 'Vorspeise', available: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1200" },

  // OSTERN SAISON
  { id: 'sp1', name: "Oster-Brunch Teller", description: "Hausgemachter Zopf, gefärbtes Ei, Schinken und Käseauswahl", price: 24.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&q=80&w=1200" },
  { id: 'sp2', name: "Lammgigot 'Provençale'", description: "mit Rosmarinkartoffeln und Speckbohnen", price: 38.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=1200" },
  { id: 'sp3', name: "Osterfladen Classic", description: "Traditioneller Milchreiskuchen mit Mandeln und Sultaninen", price: 8.50, category: 'Dessert', available: true, image: "https://images.unsplash.com/photo-1519340333755-5072134d2371?auto=format&fit=crop&q=80&w=1200" },
  { id: 'sp4', name: "Spargel & Lachs", description: "Weisser Spargel mit gebratenem Lachs an Zitronen-Hollandaise", price: 39.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=1200" },
  { id: 'sp5', name: "Frühlings-Quiche", description: "mit jungem Spinat, Feta und Pinienkernen", price: 19.50, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=1200" },
  { id: 'sp6', name: "Frühlingssalat", description: "Bunter Blattsalat mit Spargel, Erdbeeren, Nüssen & Hausdressing", price: 15.00, category: 'Salate', available: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1200" },

  // VOM RIND
  { id: 'r1', name: "Entrecôte vom Grill", description: "mit Café de Paris", price: 32.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&q=80&w=1200" },
  { id: 'r2', name: "Falsche Schnecke vom Grill", description: "zart gegrillt", price: 28.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=1200" },

  // VOM LAMM
  { id: 'l1', name: "Lammkotelette vom Grill", description: "saftig gegrillte Lammkotelettes", price: 32.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200" },
  { id: 'l2', name: "Lammsteak vom Grill", description: "zartes Lammsteak perfekt medium serviert", price: 32.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&q=80&w=1200" },

  // VOM KALB
  { id: 'k1', name: "Kalbfleisch Zürcher Art", description: "fein geschnitten nach Zürcher Art mit Rösti", price: 30.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=1200" },
  { id: 'k2', name: "Kalbschnitzel paniert", description: "mit Pommes Frites", price: 30.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1599921841143-819065a55cc6?auto=format&fit=crop&q=80&w=1200" },
  { id: 'k3', name: "Kalbs Cordon Bleu", description: "mit Pommes Frites", price: 34.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1200" },

  // VOM POULET
  { id: 'po1', name: "Poulet Cordon Bleu", description: "mit Pommes Frites", price: 24.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1562967914-6c827383d944?auto=format&fit=crop&q=80&w=1200" },

  // KINDERMENÜ
  { id: 'ki1', name: "SCHNIPO - Kindermenü", description: "Frisch paniertes Poulet Schnitzel mit knusprigen Pommes Frites und einem 2dl Softgetränk nach Wahl", price: 14.00, category: 'Kinder', available: true, image: "https://ais-pre-v3wsisszcdhftsrhskqmqj-24472229364.europe-west1.run.app/api/media/schnipo.png" },

  // VOM FISCH
  { id: 'fi1', name: "Eglifilet Müllerin Art", description: "mit Butterreis & Spinat", price: 31.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1200" },
  { id: 'fi2', name: "Zanderfilet Steak", description: "gebraten mit Buttergemüse an Weisswein-Zitronensauce", price: 31.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1551248429-42207185c7d8?auto=format&fit=crop&q=80&w=1200" },

  // GETRÄNKE - KAFFEE & HEISSGETRÄNKE
  { id: 'g1', name: "Kaffe Creme", description: "Frisch gebrühter Kaffee", price: 4.00, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200" },
  { id: 'g2', name: "Kaffe Affogatto", description: "Espresso mit einer Kugel Vanilleeis", price: 6.00, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1594133900913-76129c9846a8?auto=format&fit=crop&q=80&w=1200" },
  { id: 'g3', name: "Espresso", description: "Kräftiger italienischer Espresso", price: 4.00, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=1200" },
  { id: 'g4', name: "Cappuccino", description: "mit feinem Milchschaum", price: 4.50, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=1200" },
  { id: 'g5', name: "Latte Macchiato", description: "Drei Schichten Genuss", price: 5.50, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1599398054066-846f28917f38?auto=format&fit=crop&q=80&w=1200" },
  { id: 'g6', name: "Ovomaltine / Caotina", description: "Heisse Schokolade (gross)", price: 6.00, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1544787210-228394c3d3e0?auto=format&fit=crop&q=80&w=1200" },
  { id: 'g7', name: "Tee Auswahl", description: "Schwarz, Kamille, Verbene, Minze, Grün, Früchte, Lindenblüten", price: 3.50, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1544787210-228394c3d3e0?auto=format&fit=crop&q=80&w=1200" },
  { id: 'g8', name: "Türkischer Tee", description: "Original im Glas serviert", price: 2.50, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=1200" },

  // SOFTGETRÄNKE
  { id: 's1', name: "Coca Cola / Zero", description: "33cl Flasche", price: 5.00, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=1200" },
  { id: 's2', name: "Ramseier Apfelschorle", description: "33cl Flasche", price: 5.00, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1613478223719-2ab80260f003?auto=format&fit=crop&q=80&w=1200" },
  { id: 's3', name: "Rivella rot / blau", description: "33cl Flasche", price: 5.00, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1527960669566-f882ba85a4c6?auto=format&fit=crop&q=80&w=1200" },
  { id: 's4', name: "Mineralwasser", description: "5dl mit oder ohne Kohlensäure", price: 6.00, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=1200" },

  // BIER
  { id: 'b1', name: "Feldschlösschen Original", description: "33cl Flasche", price: 5.70, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=1200" },
  { id: 'b2', name: "Grosses Bier (Offen)", description: "5dl Feldschlösschen", price: 5.70, category: 'Getränke', available: true, image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=1200" },

  // SPIRITUOSEN - WHISKY
  { id: 'w1', name: "Chivas Regal 12 Years", description: "Blended Scotch Whisky (4cl)", price: 8.00, category: 'Spirituosen', available: true, image: "https://images.unsplash.com/photo-1527281405159-35d5b5aa7c1c?auto=format&fit=crop&q=80&w=1200" },
  { id: 'w2', name: "Glenfiddich 12 Years", description: "Single Malt Scotch Whisky (4cl)", price: 10.00, category: 'Spirituosen', available: true, image: "https://images.unsplash.com/photo-1527281405159-35d5b5aa7c1c?auto=format&fit=crop&q=80&w=1200" },
  { id: 'w3', name: "Lagavulin 16 Years", description: "Single Malt Scotch Whisky (4cl)", price: 18.00, category: 'Spirituosen', available: true, image: "https://images.unsplash.com/photo-1527281405159-35d5b5aa7c1c?auto=format&fit=crop&q=80&w=1200" },
  { id: 'w4', name: "Jack Daniels Single Barrel", description: "Tennessee Whiskey (4cl)", price: 13.00, category: 'Spirituosen', available: true, image: "https://images.unsplash.com/photo-1527281405159-35d5b5aa7c1c?auto=format&fit=crop&q=80&w=1200" },
  { id: 'w5', name: "Talisker 10 Years", description: "Single Malt Whisky (4cl)", price: 12.00, category: 'Spirituosen', available: true, image: "https://images.unsplash.com/photo-1527281405159-35d5b5aa7c1c?auto=format&fit=crop&q=80&w=1200" }
];

const CATEGORIES: Category[] = ['Alle', 'Wochenmenü', 'Saison', 'Hauptgang', 'Kinder', 'Vorspeise', 'Salate', 'Dessert', 'Getränke', 'Spirituosen'];

async function decodePCM(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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
  const [easterMode, setEasterMode] = useState(true);
  const [lightboxItem, setLightboxItem] = useState<MenuItem | null>(null);
  
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
    name: 'Oster Gast',
    instagramHandle: '@rheinhafen_ostern',
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
    <div className={`min-h-screen ${easterMode ? 'bg-[#f7fff7]' : 'bg-[#001C30]'} text-white flex flex-col relative overflow-x-hidden ${easterMode ? 'selection:bg-green-500' : 'selection:bg-blue-500'}`}>
      {easterMode && <Confetti easterMode={easterMode} />}
      
      {!hasStarted ? (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center ${easterMode ? 'bg-[#f7fff7]' : 'bg-[#001C30]'}`}>
          <Logo className="w-48 h-48 mb-8 animate-bounce" easterMode={easterMode} />
          <h1 className={`text-5xl md:text-8xl font-bold brand-font mb-4 uppercase tracking-tighter ${easterMode ? 'text-green-600' : 'text-green-400'}`}>RHEINHAFEN</h1>
          <p className={`${easterMode ? 'text-green-800/40' : 'text-green-200/40'} mb-8 uppercase tracking-[0.5em] text-xs font-black`}>Ostern am Hafen</p>
          <button onClick={handleStart} className="px-12 py-6 bg-green-600 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-4 text-white">
            Eier suchen! <ArrowRight />
          </button>
        </div>
      ) : (
        <>
          <header className={`sticky top-0 z-40 ${easterMode ? 'bg-white/80' : 'bg-[#001C30]/90'} backdrop-blur-xl border-b border-black/5 p-4 flex justify-between items-center`}>
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => scrollToSection('top')}>
              <Logo className="w-10 h-10" easterMode={easterMode} />
              <div className="hidden sm:block">
                <h1 className={`font-bold brand-font text-lg ${easterMode ? 'text-green-700' : 'text-green-400'}`}>Rheinhafen</h1>
              </div>
            </div>
            
            <nav className="hidden lg:flex gap-6 items-center">
              <button onClick={() => scrollToSection('menu-section')} className={`text-xs font-black uppercase tracking-widest ${easterMode ? 'text-green-800 hover:text-green-600' : 'text-white hover:text-green-400'} transition-colors`}>Speisekarte</button>
              <button onClick={() => scrollToSection('social-section')} className={`text-xs font-black uppercase tracking-widest ${easterMode ? 'text-green-800 hover:text-pink-600' : 'text-white hover:text-pink-400'} transition-colors`}>Instagram</button>
              <button onClick={() => setIsReservationOpen(true)} className={`text-xs font-black uppercase tracking-widest ${easterMode ? 'text-green-800 hover:text-yellow-600' : 'text-white hover:text-yellow-400'} transition-colors`}>Reservation</button>
              <button onClick={() => setIsContactOpen(true)} className={`text-xs font-black uppercase tracking-widest ${easterMode ? 'text-green-800 hover:text-green-600' : 'text-white hover:text-green-400'} transition-colors`}>Kontakt</button>
            </nav>

            <div className="flex gap-3 items-center">
               <button onClick={() => setEasterMode(!easterMode)} className={`p-2 rounded-full border border-black/10 ${easterMode ? 'bg-green-600 text-white' : 'bg-white/5 text-white'}`}>
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
              <StaffDashboard menu={menu} setMenu={setMenu} posts={posts} setPosts={setPosts} language={language} reservations={reservations} setReservations={setReservations} messages={messages} setMessages={setMessages} />
            ) : (
              <div className="space-y-32">
                <section className="text-center space-y-8 animate-in fade-in duration-1000 py-20">
                   <h2 className="text-6xl md:text-9xl font-bold brand-font uppercase leading-none tracking-tighter text-green-400">
                      {easterMode ? 'Frohe\nOstern' : 'Echt\nBasel'}
                   </h2>
                   <div className="bg-green-600/10 border border-green-500/20 p-6 rounded-3xl max-w-lg mx-auto">
                      <p className="text-green-200 text-sm font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                        <Sparkles size={14} /> Oster-Spezialität: Frischer Osterfladen!
                      </p>
                   </div>
                   <p className="text-green-100/40 text-lg max-w-2xl mx-auto italic">"{t.introText}"</p>
                   <div className="flex flex-wrap justify-center gap-4">
                      <button onClick={() => setIsReservationOpen(true)} className="px-10 py-5 bg-green-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 hover:bg-green-500 transition-all">
                        <Calendar size={18} /> Tisch Reservieren
                      </button>
                   </div>
                </section>

                <section id="menu-section" className="scroll-mt-24">
                   <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-4">
                        <Utensils className="text-green-500" size={32} />
                        <h3 className="text-4xl font-bold brand-font uppercase text-green-400">Speisekarte</h3>
                      </div>
                   </div>
                   
                   <div className="flex gap-2 overflow-x-auto no-scrollbar mb-12 pb-4 border-b border-white/5">
                      {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 transition-all ${selectedCategory === cat ? 'bg-green-600 border-green-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40'}`}>
                          {cat}
                        </button>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      {menu
                        .filter(i => selectedCategory === 'Alle' || i.category === selectedCategory)
                        .map(item => (
                          <div key={item.id} className="group relative bg-[#f0fff0] border border-[#bcd5bc] rounded-[3.5rem] overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all flex flex-col shadow-xl animate-in zoom-in duration-500">
                             <div className="aspect-[4/5] relative overflow-hidden cursor-zoom-in" onClick={() => setLightboxItem(item)}>
                                <img src={item.image} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={item.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <div className="bg-white/20 backdrop-blur-xl p-4 rounded-full border border-white/40">
                                      <Maximize2 size={24} className="text-white" />
                                   </div>
                                </div>
                                <div className="absolute top-6 left-6">
                                   <span className="bg-green-900/90 backdrop-blur-md text-white text-[8px] px-4 py-2 rounded-full font-black uppercase tracking-widest border border-white/10 shadow-lg">
                                      {item.category}
                                   </span>
                                </div>
                             </div>
                             
                             <div className="p-10 space-y-4 flex-grow flex flex-col relative z-10 text-[#1e4a1e] bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] bg-opacity-10">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-2xl font-bold brand-font uppercase tracking-tight">{item.name}</h4>
                                  <span className="text-xl font-black text-green-800 tracking-tighter">CHF {item.price.toFixed(2)}</span>
                                </div>
                                <p className="text-[#416d41] text-sm italic leading-relaxed">"{item.description}"</p>
                                
                                <div className="pt-8 border-t border-[#bcd5bc]/50 mt-4 flex items-center justify-between">
                                  <button onClick={() => speakMenuItem(item)} className={`p-4 rounded-xl border transition-all ${speakingItemId === item.id ? 'bg-green-600 text-white' : 'bg-[#bcd5bc]/30 text-[#1e4a1e] hover:bg-[#bcd5bc]/50'}`}>
                                     <Volume2 size={18} />
                                  </button>
                                  <button className="px-8 py-4 bg-green-900 text-white rounded-2xl hover:bg-green-800 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95">
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
                      <div className="w-24 h-24 bg-gradient-to-tr from-green-400 via-yellow-300 to-pink-300 rounded-[2rem] rotate-12 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                         <Instagram className="text-white" size={44} />
                      </div>
                      <h3 className="text-4xl md:text-7xl font-bold brand-font uppercase tracking-tighter text-green-400">Oster-Momente</h3>
                      <p className="text-green-200/30 text-[10px] tracking-[0.4em] uppercase">Frühlingsgefühle am Hafen</p>
                   </div>
                   <SocialFeed posts={posts.filter(p => p.status === 'approved')} language={language} />
                </section>
              </div>
            )}
          </main>

          {/* Image Lightbox Modal */}
          {lightboxItem && (
            <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setLightboxItem(null)}>
               <div className="relative max-w-5xl w-full h-[85vh] flex flex-col md:flex-row bg-[#001C30] rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setLightboxItem(null)} className="absolute top-8 right-8 z-10 p-4 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all">
                    <X size={24} />
                  </button>
                  <div className="flex-1 h-full relative">
                    <img src={lightboxItem.image} className="w-full h-full object-cover" alt={lightboxItem.name} />
                  </div>
                  <div className="w-full md:w-96 p-12 flex flex-col justify-center space-y-8 bg-gradient-to-br from-[#001C30] to-blue-950">
                     <div>
                        <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] block mb-4">Gericht Detail</span>
                        <h3 className="text-4xl font-bold brand-font uppercase leading-tight mb-4">{lightboxItem.name}</h3>
                        <p className="text-white/60 text-lg italic leading-relaxed">"{lightboxItem.description}"</p>
                     </div>
                     <div className="flex items-center justify-between border-t border-white/10 pt-8">
                        <span className="text-3xl font-black text-orange-400">CHF {lightboxItem.price.toFixed(2)}</span>
                        <button className="px-10 py-5 bg-orange-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-orange-500 shadow-xl transition-all">
                           JETZT BESTELLEN
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          <footer className="p-24 border-t border-white/5 text-center bg-black/40">
             <Logo className="w-20 h-20 grayscale opacity-20 mx-auto mb-10" easterMode={easterMode} />
             <p className="text-[11px] font-black uppercase tracking-[0.5em] text-green-200/20">Rheinhafen Kleinhüningen Basel · 4057</p>
          </footer>

          <ChatBot menu={menu} posts={posts} language={language} easterMode={easterMode} autoStart={hasStarted} />
          <StaffLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={p => { if(p==='1234'){setIsAuthenticated(true);setUserMode('staff');return true;} return false;}} language={language} />
          <ReservationModal isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} language={language} onReserve={r => setReservations(prev => [r, ...prev])} />
          <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} language={language} onSendMessage={m => setMessages(prev => [m, ...prev])} />
          <GuestPostModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} guest={currentGuest} language={language} onPost={p => setPosts(prev => [p, ...prev])} />
        </>
      )}
    </div>
  );
}
