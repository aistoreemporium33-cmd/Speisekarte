import React from 'react';
import { Language } from '../types';
import { Globe } from 'lucide-react';

interface Props {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

export const LanguageSelector: React.FC<Props> = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20">
      <Globe className="w-4 h-4 text-white ml-2" />
      <div className="flex">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              currentLanguage === lang.code
                ? 'bg-white text-blue-900 font-bold shadow-sm'
                : 'text-white hover:bg-white/20'
            }`}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};