
import React, { useState } from 'react';
import { MenuItem, Language, SocialPost, Reservation, Category, ContactMessage } from './types';
import { Logo } from './components/Logo';
import { LanguageSelector } from './components/LanguageSelector';
import { SocialFeed } from './components/SocialFeed';
import { ChatBot } from './components/ChatBot';
import { StaffLoginModal } from './components/StaffLoginModal';
import { StaffDashboard } from './components/StaffDashboard';
import { ReservationModal } from './components/ReservationModal';
import { ContactModal } from './components/ContactModal';
import { UI_STRINGS } from './constants/translations';
import { Calendar, Mail, Settings, ChevronRight } from 'lucide-react';

const INITIAL_MENU: MenuItem[] = [
  // FRÜHSTÜCK VON BAHAR
  { id: 'b1', name: "Bahar's Hafenfrühstück", description: "Zwei Bio-Eier, Käse-Variationen, Oliven, frisches Fladenbrot und hausgemachte Marmelade", price: 18.50, category: 'Frühstück', available: true, image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=1200" },
  { id: 'b2', name: "Omlette 'Kleinhüningen'", description: "Drei Eier mit frischen Hafen-Kräutern, Tomaten und Feta", price: 14.00, category: 'Frühstück', available: true, image: "https://images.unsplash.com/photo-1510629954389-c1e0da47d414?auto=format&fit=crop&q=80&w=1200" },

  // SPARGEL SAISON
  { id: 'sp1', name: "Spargel Teller Classic", description: "Weisser Spargel mit Sauce Hollandaise dazu neue Kartoffeln", price: 29.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1515471209610-dae1c92d81fe?auto=format&fit=crop&q=80&w=1200" },
  { id: 'sp2', name: "Spargel & Kalb Deluxe", description: "Weisser Spargel mit Sauce Hollandaise dazu Kalbsschnitzel natur", price: 42.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200" },
  { id: 'sp3', name: "Spargel & Poulet Light", description: "Grüner Spargel mit Pouletbrust vom Grill an Weisswein-Zitronensauce", price: 34.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&q=80&w=1200" },
  { id: 'sp4', name: "Spargel & Lachs", description: "Weisser Spargel mit gebratenem Lachs an Zitronen-Hollandaise", price: 39.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=1200" },
  { id: 'sp5', name: "Spargel Pasta", description: "Spaghetti mit grünem Spargel & Cherry-Tomaten an Basilikum-Pesto", price: 24.00, category: 'Saison', available: true, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=1200" },
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

  // VOM FISCH
  { id: 'fi1', name: "Eglifilet Müllerin Art", description: "mit Butterreis & Spinat", price: 31.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1200" },
  { id: 'fi2', name: "Zanderfilet Steak", description: "gebraten mit Buttergemüse an Weisswein-Zitronensauce", price: 31.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1551248429-42207185c7d8?auto=format&fit=crop&q=80&w=1200" },

  // PIZZAS
  { id: 'p1', name: "Margherita", description: "Tomaten, Mozzarella, Basilikum", price: 15.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&q=80&w=1200" },
  { id: 'p7', name: "PIZZA RHEINHAFEN", description: "Tomaten, Mozzarella, Champignons, Oliven, Artischocken, Büffelmozzarella, Rucola", price: 24.00, category: 'Hauptgang', available: true, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=1200" }
];

const CATEGORIES: Category[] = ['Alle', 'Saison', 'Frühstück', 'Hauptgang', 'Vorspeise', 'Salate', 'Dessert', 'Getränke'];

const App: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [language, setLanguage] = useState<Language>('de');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isStaff, setIsStaff] = useState(false);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [carnevalMode] = useState(true);

  const t = UI_STRINGS[language];

  const handleStaffLogin = (pin: string) => {
    if (pin === '1234') {
      setIsStaff(true);
      setIsStaffLoginOpen(false);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#001424] text-white selection:bg-blue-500/30">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#001424]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Logo className="h-10 w-10" carnevalMode={carnevalMode} />
          <div className="hidden md:block">
            <h1 className="text-sm font-black tracking-widest brand-font uppercase">{t.restaurantName}</h1>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-tighter">{t.restaurantBasel}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
          <button 
            onClick={() => isStaff ? setIsStaff(false) : setIsStaffLoginOpen(true)}
            className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2 transition-all"
          >
            {isStaff ? <Settings className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {isStaff ? t.guestView : t.staffButton}
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {isStaff ? (
          <StaffDashboard 
            menu={menu} 
            setMenu={setMenu} 
            posts={posts} 
            setPosts={setPosts} 
            language={language}
            reservations={reservations}
            setReservations={setReservations}
            messages={messages}
            setMessages={setMessages}
          />
        ) : (
          <div className="space-y-24">
            <section className="text-center space-y-8 animate-in fade-in duration-1000">
              <h2 className="text-6xl md:text-8xl font-black brand-font uppercase tracking-tighter leading-none">
                {t.welcome}
              </h2>
              <p className="max-w-2xl mx-auto text-white/60 leading-relaxed text-sm md:text-base italic">
                "{t.introText}"
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <button 
                  onClick={() => setIsReservationOpen(true)}
                  className="px-10 py-5 bg-blue-700 hover:bg-blue-600 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95"
                >
                  <Calendar size={18} /> {t.reserveNow}
                </button>
                <button 
                  onClick={() => setIsContactOpen(true)}
                  className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95"
                >
                  <Mail size={18} /> {t.contactUs}
                </button>
              </div>
            </section>

            <section className="space-y-12">
               <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <h3 className="text-xs font-black uppercase tracking-[0.5em] text-white/20">{t.hafenNews}</h3>
                  <div className="h-px flex-1 bg-white/10" />
               </div>
               <SocialFeed posts={posts} language={language} />
            </section>

            <section className="space-y-12">
               <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <h3 className="text-xs font-black uppercase tracking-[0.5em] text-white/20">Menu</h3>
                  <div className="h-px flex-1 bg-white/10" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {menu.filter(item => item.available).map(item => (
                   <div key={item.id} className="group bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-500">
                     <div className="aspect-video relative overflow-hidden">
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                     </div>
                     <div className="p-8 space-y-4">
                       <div className="flex justify-between items-start">
                         <h4 className="font-bold text-xl uppercase tracking-tight">{item.name}</h4>
                         <span className="font-black text-blue-400">CHF {item.price.toFixed(2)}</span>
                       </div>
                       <p className="text-white/40 text-xs leading-relaxed italic line-clamp-2">"{item.description}"</p>
                     </div>
                   </div>
                 ))}
               </div>
            </section>
          </div>
        )}
      </main>

      <ChatBot menu={menu} posts={posts} language={language} autoStart={true} carnevalMode={carnevalMode} />
      
      <StaffLoginModal 
        isOpen={isStaffLoginOpen} 
        onClose={() => setIsStaffLoginOpen(false)} 
        onLogin={handleStaffLogin} 
        language={language} 
      />

      <ReservationModal 
        isOpen={isReservationOpen} 
        onClose={() => setIsReservationOpen(false)} 
        onReserve={(res) => setReservations([...reservations, res])}
        language={language} 
      />

      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
        onSendMessage={(msg) => setMessages([...messages, msg])}
        language={language} 
      />
    </div>
  );
};

export default App;
