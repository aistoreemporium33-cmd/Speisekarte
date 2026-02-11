
import React from 'react';
import { SocialPost, Language } from '../types';
import { UI_STRINGS } from '../constants/translations';
import { Instagram, Facebook, Video, Megaphone, Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, User, MessageSquare, CheckCircle, ExternalLink, Camera } from 'lucide-react';

interface Props {
  posts: SocialPost[];
  language: Language;
}

export const SocialFeed: React.FC<Props> = ({ posts, language }) => {
  const t = UI_STRINGS[language];
  const officialHandle = "@restaurantrheinhafen";
  const instaUrl = "https://www.instagram.com/restaurantrheinhafen/";
  
  const getIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-500" />;
      case 'tiktok': return <Video className="w-4 h-4 text-slate-200" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4 text-green-500" />;
      default: return <Megaphone className="w-4 h-4 text-gray-500" />;
    }
  };

  if (posts.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6 bg-blue-900/10 rounded-[3rem] border border-white/5 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-blue-800/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="text-blue-500" size={32} />
        </div>
        <h4 className="text-2xl font-black uppercase brand-font tracking-widest">Noch keine Hafen-Momente</h4>
        <p className="text-white/40 text-sm italic max-w-xs mx-auto">"Uè! Werde der Erste, der seinen Besuch mit uns teilt. Wir warten auf deine Story!" — Pasquale</p>
        <div className="pt-4">
           <span className="text-[8px] font-black uppercase tracking-[0.3em] text-pink-500 bg-pink-500/10 px-4 py-2 rounded-full border border-pink-500/20">Teile deinen Moment oben im Login-Bereich</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="grid grid-cols-1 gap-12">
        {posts.map((post) => (
          <div key={post.id} className={`bg-blue-900/10 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border ${post.isGuestPost ? 'border-pink-500/20' : 'border-white/5'} group transition-all duration-700 hover:border-white/10`}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${post.isGuestPost ? 'p-0.5 bg-gradient-to-tr from-yellow-500 to-pink-500' : 'bg-gradient-to-br from-red-600 to-blue-600 p-0.5'} shadow-lg`}>
                  <div className="w-full h-full rounded-full bg-blue-950 overflow-hidden flex items-center justify-center border border-[#001C30]">
                    <img src={post.isGuestPost ? post.guestAvatar : "https://cdn-icons-png.flaticon.com/512/8805/8805068.png"} className="w-full h-full object-cover" alt="User" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      {post.isGuestPost ? post.guestHandle : officialHandle}
                      {!post.isGuestPost && <CheckCircle size={14} className="text-blue-500 fill-white" />}
                      {post.isGuestPost && <CheckCircle size={12} className="text-pink-500" />}
                    </h4>
                    {!post.isGuestPost && (
                      <a href={instaUrl} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                     {getIcon(post.platform)}
                     <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">{post.date}</span>
                     {!post.isGuestPost && (
                        <span className="text-[8px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest ml-2 border border-blue-400/20">Official Feed</span>
                     )}
                     {post.isGuestPost && (
                        <span className="text-[8px] bg-pink-500/10 text-pink-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest ml-2 border border-pink-500/20">Gäste-Post</span>
                     )}
                  </div>
                </div>
              </div>
              <button className="text-white/20 hover:text-white transition-colors p-2">
                <MoreHorizontal size={24} />
              </button>
            </div>

            {post.image && (
              <div className="relative aspect-video md:aspect-[16/10] overflow-hidden">
                  <img src={post.image} alt="Update" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  {!post.isGuestPost && (
                    <div className="absolute bottom-6 right-6">
                      <a href={instaUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all">
                        Original ansehen <Instagram size={14} />
                      </a>
                    </div>
                  )}
              </div>
            )}

            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <button className="text-red-500 hover:scale-125 transition-transform flex items-center gap-2">
                    <Heart size={28} fill="#ef4444" />
                    <span className="text-xs font-bold text-white">{post.isGuestPost ? 12 : 184}</span>
                  </button>
                  <button className="text-white/70 hover:text-white transition-colors hover:scale-110">
                    <MessageCircle size={28} />
                  </button>
                  <button className="text-white/70 hover:text-white transition-colors hover:scale-110">
                    <Share2 size={28} />
                  </button>
                </div>
                <button className="text-white/70 hover:text-white transition-colors">
                  <Bookmark size={28} />
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-white/90 text-sm leading-relaxed">
                  <span className="font-black text-white mr-3 uppercase tracking-wider text-[11px]">
                    {post.isGuestPost ? post.guestHandle?.toLowerCase().replace('@', '') : 'restaurantrheinhafen'}
                  </span>
                  {post.content}
                </p>
                <div className="flex gap-3 pt-2">
                  <span className="text-[10px] text-blue-400 font-black">#RHEINHAFEN</span>
                  <span className="text-[10px] text-blue-400 font-black">#BASEL</span>
                  <span className="text-[10px] text-blue-400 font-black">#AUTHENTICITALIAN</span>
                  {post.isGuestPost && <span className="text-[10px] text-pink-400 font-black">#GUESTLOVE</span>}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{t.viewComments}</p>
                <div className="flex gap-2 text-xs">
                  <span className="font-bold text-white/60">Pasquale:</span>
                  <span className="text-white/40 italic">"Jamme jà! Das ist die wahre Leidenschaft am Hafen! ❤️🍕"</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center pt-8">
        <a 
          href={instaUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-full font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:scale-105 transition-all active:scale-95"
        >
          <Instagram size={20} />
          Folge @restaurantrheinhafen
        </a>
      </div>
    </div>
  );
};
