
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, Star, Sparkles } from 'lucide-react';
import { MenuItem, SocialPost, Language } from '../types';
import { generateSystemInstruction, generateSpeech } from '../services/geminiService';
import { WaiterAvatar } from './WaiterAvatar';

interface Props {
  menu: MenuItem[];
  posts: SocialPost[];
  language: Language;
  autoStart?: boolean;
  newYearMode?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const dataView = new DataView(audioData);
  const numSamples = audioData.byteLength / 2;
  const buffer = audioContext.createBuffer(1, numSamples, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < numSamples; i++) {
     channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
  }
  return buffer;
}

const getGreeting = (lang: Language, ny?: boolean): string => {
    switch (lang) {
        case 'de': return "Buongiorno! Isch bin Enzo. Wir haben bis zum nächsten Samstag Renovierarbeiten-e und wir wünschen alle ein guten rutsch! Ciao bis zum nächsten Samstag!";
        case 'it': return "Buongiorno! Sono Enzo. Abbiamo lavori di ristrutturazione fino a sabato prossimo e auguriamo a tutti un felice anno nuovo! Ciao, a sabato prossimo!";
        case 'fr': return "Bonjour! Je suis Enzo. Nous avons des travaux de rénovation jusqu'à samedi prochain et nous souhaitons à tous une bonne année ! Ciao, à samedi prochain !";
        case 'tr': return "Merhaba! Ben Enzo. Gelecek Cumartesiye kadar tadilat işlerimiz var ve herkese iyi seneler diliyoruz! Ciao, gelecek Cumartesi görüşmek üzere!";
        case 'en': return "Buongiorno! I am Enzo. We have renovation work until next Saturday and we wish everyone a happy New Year! Ciao, see you next Saturday!";
        default: return "Buongiorno! We are renovating until next Saturday. Happy New Year! Ciao bis zum nächsten Samstag!";
    }
};

const getPlaceholder = (lang: Language): string => {
    switch (lang) {
        case 'de': return "Frag Enzo nach der Eröffnung...";
        case 'it': return "Chiedi a Enzo della riapertura...";
        case 'fr': return "Demander à Enzo...";
        case 'tr': return "Enzo'ya sor...";
        case 'en': return "Ask Enzo about reopening...";
        default: return "Message Enzo...";
    }
};

export const ChatBot: React.FC<Props> = ({ menu, posts, language, autoStart = false, newYearMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isSoundOnRef = useRef(isSoundOn);
  const hasAutoGreetedRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { isSoundOnRef.current = isSoundOn; }, [isSoundOn]);

  const initAudio = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      const langMap: Record<string, string> = { de: 'de-DE', it: 'it-IT', fr: 'fr-FR', tr: 'tr-TR', en: 'en-US' };
      recognitionRef.current.lang = langMap[language] || 'de-DE';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, [language]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Spracherkennung wird nicht unterstützt.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      initAudio();
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
  };

  useEffect(() => {
    if (autoStart && !hasAutoGreetedRef.current) {
        initAudio();
        setIsOpen(true);
        setIsSoundOn(true);
        hasAutoGreetedRef.current = true;
        const greeting = getGreeting(language, newYearMode);
        setMessages([{ id: 'init', role: 'model', text: greeting }]);
        setTimeout(() => playResponseAudio(greeting), 200);
    }
  }, [autoStart, language, newYearMode]);

  useEffect(() => {
    if (isOpen) {
      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: generateSystemInstruction(menu, posts, language) + (newYearMode ? "\n- CELEBRATE NEW YEAR'S EVE. Mention the fireworks in Basel." : ""),
        }
      });
    }
  }, [isOpen, menu, posts, language, newYearMode]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const playResponseAudio = async (text: string) => {
    if (!isSoundOnRef.current) return;
    try {
        if (currentSourceRef.current) { currentSourceRef.current.stop(); }
        setIsSpeaking(true);
        initAudio();
        const audioData = await generateSpeech(text);
        if (audioData && audioContextRef.current) {
            const buffer = await decodeAudioData(audioData);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => { setIsSpeaking(false); currentSourceRef.current = null; };
            currentSourceRef.current = source;
            source.start(0);
        } else { setIsSpeaking(false); }
    } catch (e) { setIsSpeaking(false); }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || !chatSessionRef.current || isLoading) return;
    
    initAudio();
    const userMsg = { id: Date.now().toString(), role: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let fullText = "";
      const tempId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: tempId, role: 'model', text: "", isStreaming: true }]);

      const stream = await chatSessionRef.current.sendMessageStream({ message: text });
      for await (const chunk of stream) {
          fullText += (chunk.text || "");
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, text: fullText } : m));
      }
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isStreaming: false } : m));
      playResponseAudio(fullText);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Scusi, wir haben ein technisches Problem-e." }]);
    } finally { setIsLoading(false); }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => { initAudio(); setIsOpen(true); }} 
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 border-4 overflow-hidden ${newYearMode ? 'bg-[#d4af37] border-white' : 'bg-[#003399] border-red-500'}`}
      >
        <div className="relative">
          <WaiterAvatar className="w-12 h-12" christmasMode={newYearMode} />
          {newYearMode && <div className="absolute -top-2 -right-2 animate-pulse"><Sparkles size={20} className="text-white fill-yellow-200" /></div>}
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-[90vw] md:w-96 h-[500px] bg-[#001C30] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border-2 ${newYearMode ? 'border-yellow-500/50 shadow-yellow-500/10' : 'border-red-500/50'} animate-in slide-in-from-bottom-10`}>
      <div className={`${newYearMode ? 'bg-[#d4af37]' : 'bg-[#003399]'} p-4 flex justify-between items-center ${newYearMode ? 'text-blue-900' : 'text-red-500'} border-b ${newYearMode ? 'border-yellow-600/30' : 'border-red-500/30'}`}>
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center overflow-hidden border-2 ${isSpeaking ? 'border-white animate-pulse' : 'border-white/30'}`}>
                <WaiterAvatar className="w-8 h-8 mt-1" christmasMode={newYearMode} />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1">
                Enzo {newYearMode && <span className="text-yellow-100">🍾</span>}
              </h3>
              <span className={`text-[10px] uppercase tracking-tighter ${newYearMode ? 'text-blue-800' : 'text-red-200'}`}>
                {newYearMode ? 'Gala Sommelier' : 'Ihre Begleitung'}
              </span>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsSoundOn(!isSoundOn)} className={`p-2 rounded-full border transition-all ${isSoundOn ? (newYearMode ? 'bg-blue-900/10 text-blue-900 border-blue-900/30' : 'bg-red-500/20 text-red-100 border-red-500/50') : (newYearMode ? 'text-blue-900/40 border-transparent' : 'text-red-500/40 border-transparent')}`}>
                {isSoundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={() => setIsOpen(false)} className={`p-2 rounded-full hover:bg-black/10 ${newYearMode ? 'text-blue-900' : 'text-red-500'}`}><X size={20} /></button>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-[#001C30]/95`}>
        {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md ${
                    msg.role === 'user' 
                      ? (newYearMode ? 'bg-blue-800 text-white border-blue-600' : 'bg-red-600 text-white border-red-500') + ' rounded-tr-none border'
                      : (newYearMode ? 'bg-gradient-to-br from-yellow-100 to-white text-blue-900 border-yellow-400' : 'bg-blue-900 text-red-100 border-red-500/30') + ' rounded-tl-none border'
                }`}>
                    {msg.text || (msg.isStreaming && <Loader2 size={12} className={`animate-spin ${newYearMode ? 'text-blue-900' : 'text-red-500'}`} />)}
                </div>
            </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className={`p-3 bg-[#001C30] border-t ${newYearMode ? 'border-yellow-500/20' : 'border-red-500/30'} flex items-center gap-2`}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder={getPlaceholder(language)} 
          className={`flex-1 bg-blue-900/50 border rounded-full px-4 py-2.5 text-sm text-white outline-none transition-all placeholder:text-blue-300/40 ${newYearMode ? 'border-yellow-500/30 focus:border-yellow-500 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-red-500/30 focus:border-red-500'}`} 
          disabled={isLoading}
          autoFocus
        />
        <button 
          type="button"
          onClick={toggleRecording}
          title="Sprachsteuerung"
          className={`p-2.5 rounded-full transition-all shadow-lg ${isRecording ? 'bg-red-500 text-white animate-pulse' : (newYearMode ? 'bg-blue-900 text-yellow-500 hover:bg-blue-800 border border-yellow-500/20' : 'bg-blue-900 text-red-400 hover:bg-blue-800 border border-red-500/20')}`}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading} 
          className={`p-2.5 ${newYearMode ? 'bg-gradient-to-br from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600' : 'bg-red-600 hover:bg-red-500'} text-white rounded-full transition-all shadow-lg disabled:opacity-50 disabled:grayscale flex items-center justify-center min-w-[42px]`}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
};
