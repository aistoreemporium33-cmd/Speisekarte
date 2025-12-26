
import React from 'react';
import { SocialPost } from '../types';
import { Instagram, Facebook, Video, Megaphone } from 'lucide-react';

interface Props {
  posts: SocialPost[];
}

export const SocialFeed: React.FC<Props> = ({ posts }) => {
  const getIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-500" />;
      case 'tiktok': return <Video className="w-5 h-5 text-slate-200" />; // Using Video as proxy for TikTok
      default: return <Megaphone className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-800 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-2">
              {getIcon(post.platform)}
              <span className="text-xs font-semibold uppercase text-slate-400">{post.platform}</span>
            </div>
            <span className="text-xs text-slate-500">{post.date}</span>
          </div>
          {post.image && (
            <div className="h-48 overflow-hidden">
                <img src={post.image} alt="Social Update" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>
          )}
          <div className="p-4">
            <p className="text-slate-300 text-sm leading-relaxed">{post.content}</p>
          </div>
        </div>
      ))}
      {posts.length === 0 && (
        <div className="col-span-full text-center py-10 text-slate-500">
            <p>Keine Neuigkeiten im Moment.</p>
        </div>
      )}
    </div>
  );
};