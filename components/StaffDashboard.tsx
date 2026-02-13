
import { MenuItem, Reservation, SocialPost, Language, Category, DEFAULT_CATEGORIES, ContactMessage } from '../types';
import { UI_STRINGS } from '../constants/translations';
import React, { useState, useMemo } from 'react';
import { 
  Edit, Trash2, Loader2, Search, Filter, 
  Plus, Save, X, UtensilsCrossed, Instagram, 
  ShieldCheck, CheckCircle2, AlertCircle, Pizza, Coffee, Wine, Leaf, 
  Dessert as DessertIcon, Sparkles, Send, Camera, Layout, MessageSquare, Mail, User, Clock
} from 'lucide-react';
import { generateProfessionalResponse } from '../services/geminiService';

interface Props {
  menu: MenuItem[];
  setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  posts: SocialPost[];
  setPosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
  language: Language;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  messages: ContactMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
}

export const StaffDashboard: React.FC<Props> = ({ menu, setMenu, posts, setPosts, language, reservations, setReservations, messages, setMessages }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'reservations' | 'moderation' | 'social' | 'messages'>('menu');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  
  // Social Studio States
  const [socialTopic, setSocialTopic] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [socialImage, setSocialImage] = useState('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category>('Alle');

  const t = UI_STRINGS[language];

  const handleGenerateSocialPost = async () => {
    if (!socialTopic) return;
    setIsGeneratingCaption(true);
    try {
      const caption = await generateProfessionalResponse(socialTopic, language);
      setGeneratedCaption(caption);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handlePublishOfficialPost = () => {
    if (!generatedCaption) return;
    const newPost: SocialPost = {
      id: `official-${Date.now()}`,
      platform: 'instagram',
      content: generatedCaption,
      date: 'Heute',
      image: socialImage,
      isGuestPost: false,
      status: 'approved'
    };
    setPosts(prev => [newPost, ...prev]);
    setGeneratedCaption('');
    setSocialTopic('');
    setActiveTab('moderation');
  };

  const getCategoryIcon = (cat: Category) => {
    switch(cat) {
      case 'Hauptgang': return <Pizza size={16} />;
      case 'Getränke': return <Wine size={16} />;
      case 'Salate': return <Leaf size={16} />;
      case 'Dessert': return <DessertIcon size={16} />;
      case 'Frühstück': return <Coffee size={16} />;
      default: return <UtensilsCrossed size={16} />;
    }
  };

  const filteredMenu = useMemo(() => {
    return menu.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           m.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = filterCategory === 'Alle' || m.category === filterCategory;
      return matchesSearch && matchesCat;
    });
  }, [menu, searchQuery, filterCategory]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-blue-900/10 p-8 rounded-[3rem] border border-white/5">
        <div>
          <h2 className="text-4xl font-black brand-font uppercase tracking-tight">Hafen Cockpit</h2>
          <p className="text-white/40 text-xs font-black tracking-widest uppercase">Echtzeit-Verwaltung & Service</p>
        </div>
        <div className="flex bg-black/40 p-1.5 rounded-[2rem] border border-white/10 shadow-inner overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'menu', label: 'Speisekarte', icon: <UtensilsCrossed size={16} /> },
            { id: 'reservations', label: 'Tisch-Plan', icon: <ShieldCheck size={16} /> },
            { id: 'social', label: 'Studio', icon: <Sparkles size={16} /> },
            { id: 'moderation', label: 'Feed', icon: <Instagram size={16} /> },
            { id: 'messages', label: 'Kontakt', icon: <MessageSquare size={16} />, badge: messages.filter(m => !m.isRead).length }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'messages') {
                  setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
                }
              }} 
              className={`relative px-6 py-3 rounded-[1.5rem] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              {tab.icon} {tab.label}
              {tab.badge ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] animate-bounce">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </header>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
              <Mail className="mx-auto text-white/10" size={64} />
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Keine neuen Nachrichten vorhanden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {messages.map(msg => (
                <div key={msg.id} className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row gap-6 hover:bg-white/[0.07] transition-all">
                  <div className="md:w-1/4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                        <User className="text-blue-500" size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-white/40 block">Absender</span>
                        <h4 className="font-bold text-white text-sm">{msg.name}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
                        <Mail className="text-orange-500" size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-white/40 block">Email</span>
                        <a href={`mailto:${msg.email}`} className="text-xs text-blue-400 hover:underline">{msg.email}</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <Clock className="text-white/40" size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-white/40 block">Eingang</span>
                        <span className="text-[10px] text-white/60">{msg.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4 md:border-l md:border-white/5 md:pl-8">
                    <div>
                      <span className="text-[10px] font-black uppercase text-white/40 block mb-1">Betreff</span>
                      <h4 className="text-lg font-black brand-font text-white">{msg.subject}</h4>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-white/40 block mb-2">Nachricht</span>
                      <p className="text-sm text-white/80 leading-relaxed italic bg-black/20 p-6 rounded-2xl border border-white/5">
                        "{msg.message}"
                      </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))} className="px-6 py-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                        Löschen
                      </button>
                      <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all flex items-center gap-2">
                        <Send size={14} /> Antworten
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Social Media Studio Tab */}
      {activeTab === 'social' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
           {/* Generator Left */}
           <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 h-fit">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Sparkles className="text-white" size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black brand-font uppercase">{t.socialStudio}</h3>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{t.socialSub}</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1">Thema / Fokus des Posts</label>
                    <textarea 
                      value={socialTopic}
                      onChange={e => setSocialTopic(e.target.value)}
                      placeholder="Was gibt es Neues? (z.B. Unsere neue Trüffel-Pizza ist da!)"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm outline-none focus:border-pink-500 h-32 resize-none transition-all"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1">Bild-URL (Teaser)</label>
                    <div className="relative">
                       <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                       <input 
                         value={socialImage}
                         onChange={e => setSocialImage(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-xs text-white/60 focus:border-pink-500 outline-none" 
                       />
                    </div>
                 </div>

                 <button 
                  onClick={handleGenerateSocialPost}
                  disabled={isGeneratingCaption || !socialTopic}
                  className="w-full py-5 bg-gradient-to-r from-pink-600 to-purple-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                 >
                    {isGeneratingCaption ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Caption von Sora generieren lassen</>}
                 </button>
              </div>

              {generatedCaption && (
                <div className="pt-8 border-t border-white/5 space-y-4 animate-in slide-in-from-bottom-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-pink-500 tracking-widest">Vorschlag von Sora</span>
                      <button onClick={() => setGeneratedCaption('')} className="text-white/20 hover:text-white"><X size={14} /></button>
                   </div>
                   <div className="bg-pink-600/5 border border-pink-500/20 rounded-2xl p-6">
                      <p className="text-sm italic text-white/90 leading-relaxed">"{generatedCaption}"</p>
                   </div>
                   <button 
                    onClick={handlePublishOfficialPost}
                    className="w-full py-5 bg-white text-blue-900 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-blue-50 transition-all"
                   >
                      <Send size={18} /> Jetzt offiziell posten
                   </button>
                </div>
              )}
           </div>

           {/* Preview Right */}
           <div className="flex flex-col items-center justify-center p-10 bg-black/20 rounded-[3rem] border border-dashed border-white/10">
              <div className="w-full max-w-[360px] bg-[#001C30] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative">
                 <div className="p-4 border-b border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-blue-600 p-0.5">
                       <img src="https://cdn-icons-png.flaticon.com/512/8805/8805068.png" className="w-full h-full rounded-full object-cover border border-[#001C30]" />
                    </div>
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-tighter block text-white">@restaurantrheinhafen</span>
                       <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Vorschau</span>
                    </div>
                 </div>
                 <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
                    <img src={socialImage} className="w-full h-full object-cover" alt="Preview" />
                 </div>
                 <div className="p-6 space-y-3">
                    <div className="flex gap-4 mb-2">
                       <Instagram size={20} className="text-white/60" />
                       <Layout size={20} className="text-white/60" />
                    </div>
                    <p className="text-[12px] leading-relaxed text-white/80">
                       <span className="font-black mr-2 text-[10px]">RESTAURANTRHEINHAFEN</span>
                       {generatedCaption || "Ihr Text wird hier erscheinen..."}
                    </p>
                    <div className="flex gap-2">
                       <span className="text-[9px] font-black text-blue-400">#RHEINHAFEN</span>
                       <span className="text-[9px] font-black text-blue-400">#BASEL</span>
                    </div>
                 </div>
              </div>
              <p className="mt-8 text-[10px] uppercase font-black tracking-[0.4em] text-white/10 italic">Offizieller Post Simulator</p>
           </div>
        </div>
      )}

      {/* Speisekarte Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-4 items-center justify-between bg-white/5 p-6 rounded-[2.5rem] border border-white/5 shadow-xl">
             <div className="flex flex-wrap gap-3 flex-1 min-w-[300px]">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    placeholder="Gericht oder Zutat suchen..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm outline-none focus:border-blue-500 transition-all text-white"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <select 
                    value={filterCategory} 
                    onChange={e => setFilterCategory(e.target.value as Category)} 
                    className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-6 py-4 text-xs font-black uppercase outline-none focus:border-blue-500 appearance-none text-white"
                  >
                     <option value="Alle" className="bg-[#001C30]">Alle Kategorien</option>
                     {DEFAULT_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#001C30]">{c}</option>)}
                  </select>
                </div>
             </div>
             <button 
              onClick={() => {
                setEditingItem({
                  id: `item-${Date.now()}`,
                  name: '',
                  description: '',
                  price: 0,
                  category: 'Hauptgang',
                  available: true,
                  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'
                });
                setIsItemModalOpen(true);
              }} 
              className="px-10 py-5 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-2xl shadow-blue-900/40 transition-all active:scale-95"
             >
               <Plus size={20} /> Neues Gericht hinzufügen
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMenu.map(item => (
              <div key={item.id} className={`bg-white/5 border rounded-[3rem] overflow-hidden group transition-all duration-500 hover:shadow-2xl ${item.available ? 'border-white/10' : 'border-red-500/20 opacity-70'}`}>
                <div className="aspect-video relative overflow-hidden border-b border-white/5">
                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" alt={item.name} />
                  <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl ${item.available ? 'bg-green-600' : 'bg-red-600'}`}>
                    {item.available ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {item.available ? 'Auf Lager' : 'Ausverkauft'}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    {getCategoryIcon(item.category)}
                    {item.category}
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xl uppercase tracking-tight">{item.name}</h4>
                    <span className="font-black text-blue-400 text-lg">CHF {item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed line-clamp-2 italic">"{item.description}"</p>
                  
                  <div className="pt-6 flex gap-3 border-t border-white/5">
                    <button 
                      onClick={() => setMenu(prev => prev.map(m => m.id === item.id ? { ...m, available: !m.available } : m))} 
                      className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${item.available ? 'bg-white/5 border-white/10 hover:bg-red-500/10 hover:border-red-500/30' : 'bg-green-600/20 border-green-500/30 text-green-500 hover:bg-green-500/30'}`}
                    >
                      {item.available ? 'Abmelden (Sold Out)' : 'Wieder verfügbar'}
                    </button>
                    <button onClick={() => { setEditingItem(item); setIsItemModalOpen(true); }} className="p-4 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-600/20 transition-all"><Edit size={18} /></button>
                    <button onClick={() => { if(confirm('Löschen?')) setMenu(prev => prev.filter(m => m.id !== item.id)); }} className="p-4 bg-red-600/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-600/20 transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moderation Tab */}
      {activeTab === 'moderation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {posts.map(post => (
             <div key={post.id} className={`bg-white/5 border rounded-[3rem] overflow-hidden flex flex-col lg:flex-row ${post.status === 'pending' ? 'border-yellow-500/30' : 'border-white/10 opacity-70'}`}>
                <div className="w-full lg:w-1/2 aspect-square">
                   <img src={post.image} className="w-full h-full object-cover" alt="Post" />
                </div>
                <div className="p-10 flex flex-col justify-between flex-1 space-y-6">
                   <div>
                      <div className="flex items-center gap-4 mb-6">
                        <img src={post.isGuestPost ? post.guestAvatar : "https://cdn-icons-png.flaticon.com/512/8805/8805068.png"} className={`w-12 h-12 rounded-full border-2 p-0.5 ${post.isGuestPost ? 'border-pink-500' : 'border-blue-500'}`} alt="Avatar" />
                        <div>
                          <span className="font-black text-xs uppercase tracking-widest block">{post.isGuestPost ? post.guestHandle : '@restaurantrheinhafen'}</span>
                          <span className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">{post.date}</span>
                        </div>
                      </div>
                      <p className="text-sm text-white/60 italic leading-relaxed">"{post.content}"</p>
                   </div>
                   <div className="flex gap-3">
                      {post.status === 'pending' ? (
                        <>
                          <button onClick={() => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'approved' } : p))} className="flex-1 py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-500">Freigeben</button>
                          <button onClick={() => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'rejected' } : p))} className="flex-1 py-5 bg-red-600/10 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-500/20">Ablehnen</button>
                        </>
                      ) : (
                        <button onClick={() => setPosts(prev => prev.filter(p => p.id !== post.id))} className="w-full py-5 bg-red-600/10 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-500/20 flex items-center justify-center gap-2"><Trash2 size={14} /> Entfernen</button>
                      )}
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Item Add/Edit Modal */}
      {isItemModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <form 
            onSubmit={(e) => {
              e.preventDefault();
              const item = editingItem as MenuItem;
              setMenu(prev => {
                const exists = prev.find(m => m.id === item.id);
                if (exists) return prev.map(m => m.id === item.id ? item : m);
                return [item, ...prev];
              });
              setIsItemModalOpen(false);
            }} 
            className="bg-[#001C30] w-full max-w-2xl rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-300"
           >
              <div className="bg-blue-700 p-8 flex justify-between items-center text-white">
                 <div className="flex items-center gap-4">
                    <UtensilsCrossed size={28} />
                    <div>
                      <h3 className="text-xl font-black uppercase brand-font tracking-tight">Gericht-Konfigurator</h3>
                      <p className="text-[10px] uppercase font-black opacity-60">Karte anpassen</p>
                    </div>
                 </div>
                 <button type="button" onClick={() => setIsItemModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
              </div>
              
              <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1">Gericht Name</label>
                    <input required value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1">Preis (CHF)</label>
                    <input required type="number" step="0.05" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 ml-1">Kategorie</label>
                  <div className="grid grid-cols-3 gap-3">
                    {DEFAULT_CATEGORIES.map(c => (
                      <button key={c} type="button" onClick={() => setEditingItem({...editingItem, category: c})} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${editingItem.category === c ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 ml-1">Zutaten / Beschreibung</label>
                  <textarea required value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-blue-500 h-32 resize-none transition-all text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/40 ml-1">Bild-URL</label>
                  <input required value={editingItem.image} onChange={e => setEditingItem({...editingItem, image: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-blue-500 transition-all text-white/60" />
                </div>
              </div>
              <div className="p-8 bg-black/20 border-t border-white/5 flex gap-4">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs">Abbrechen</button>
                <button type="submit" className="flex-[2] py-5 bg-blue-700 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all">
                   <Save size={18} /> Speichern
                </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};
