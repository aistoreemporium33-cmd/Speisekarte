
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react';
import { MenuItem, SocialPost, Language } from '../types';
import { generateSystemInstruction, generateSpeech } from '../services/geminiService';
import { WaiterAvatar } from './WaiterAvatar';
import { UI_STRINGS } from '../constants/translations';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

interface Props {
  menu: MenuItem[];
  posts: SocialPost[];
  language: Language;
  autoStart?: boolean;
  carnevalMode?: boolean;
}

// Audio Utils for PCM Data Handling
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
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

export const ChatBot: React.FC<Props> = ({ menu, posts, language, autoStart = false, carnevalMode = false }) => {
  const t = UI_STRINGS[language];
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [currentInputTranscription, setCurrentInputTranscription] = useState('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');

  const chatSessionRef = useRef<any>(null);
  const liveSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const greetedRef = useRef(false);

  const initAudio = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    if (outputAudioContextRef.current.state === 'suspended') outputAudioContextRef.current.resume();
  };

  const speakText = async (text: string) => {
    if (!isSoundOn) return;
    initAudio();
    setIsSpeaking(true);
    const audioData = await generateSpeech(text);
    if (audioData) {
      const ctx = outputAudioContextRef.current!;
      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
      const buffer = await ctx.decodeAudioData(audioData.buffer);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        activeSourcesRef.current.delete(source);
        if (activeSourcesRef.current.size === 0) setIsSpeaking(false);
      };
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
      activeSourcesRef.current.add(source);
    } else {
      setIsSpeaking(false);
    }
  };

  // Initial Greeting when App activates
  useEffect(() => {
    if (autoStart && !greetedRef.current) {
      greetedRef.current = true;
      const greeting = carnevalMode ? t.soraGreetingCarneval : t.soraGreeting;
      
      setMessages([{
        id: 'welcome-sora',
        role: 'model',
        text: greeting
      }]);

      // Speak immediately
      setTimeout(() => {
        speakText(greeting);
      }, 500);
    }
  }, [autoStart, carnevalMode, t]);

  useEffect(() => {
    if (isOpen && !isLiveMode) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: generateSystemInstruction(menu, posts, language, carnevalMode),
        }
      });
    }
  }, [isOpen, isLiveMode, menu, posts, language, carnevalMode, t]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const toggleLiveMode = async () => {
    if (isLiveMode) {
      if (liveSessionRef.current?.close) liveSessionRef.current.close();
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
      setIsLiveMode(false);
      setIsSpeaking(false);
      return;
    }

    initAudio();
    setIsLiveMode(true);
    setCurrentInputTranscription('');
    setCurrentOutputTranscription('');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = stream;

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBlob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextRef.current!.destination);
          
          sessionPromise.then(session => {
             liveSessionRef.current = { 
               close: () => {
                 session.close();
                 source.disconnect();
                 scriptProcessor.disconnect();
               }
             };
          });
        },
        onmessage: async (message: LiveServerMessage) => {
          const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64 && isSoundOn) {
            setIsSpeaking(true);
            const ctx = outputAudioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            
            const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            
            source.onended = () => {
              activeSourcesRef.current.delete(source);
              if (activeSourcesRef.current.size === 0) setIsSpeaking(false);
            };

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            activeSourcesRef.current.add(source);
          }

          if (message.serverContent?.interrupted) {
            activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
            activeSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsSpeaking(false);
          }

          if (message.serverContent?.inputTranscription) {
            setCurrentInputTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
          }
          if (message.serverContent?.outputTranscription) {
            setCurrentOutputTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
          }

          if (message.serverContent?.turnComplete) {
            if (currentInputTranscription || currentOutputTranscription) {
              setMessages(prev => [
                ...prev,
                { id: `in-${Date.now()}`, role: 'user', text: currentInputTranscription || "..." },
                { id: `out-${Date.now()}`, role: 'model', text: currentOutputTranscription || "..." }
              ]);
            }
            setCurrentInputTranscription('');
            setCurrentOutputTranscription('');
          }
        },
        onerror: (e) => console.error("Live Error:", e),
        onclose: () => setIsLiveMode(false)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        },
        systemInstruction: generateSystemInstruction(menu, posts, language, carnevalMode)
      }
    });
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !chatSessionRef.current || isLoading) return;
    
    const text = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      let fullText = "";
      const tempId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: tempId, role: 'model', text: "", isStreaming: true }]);

      const stream = await chatSessionRef.current.sendMessageStream({ message: text });
      for await (const chunk of stream) {
          const c = chunk as any;
          fullText += (c.text || "");
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, text: fullText } : m));
      }
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isStreaming: false } : m));
      
      // Auto-speak model response
      speakText(fullText);

    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: t.soraError }]);
    } finally { setIsLoading(false); }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => { initAudio(); setIsOpen(true); }} 
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full ${carnevalMode ? 'bg-orange-600' : 'bg-blue-700'} shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 border-2 border-white/20`}
      >
        <WaiterAvatar className={`w-12 h-12 ${isSpeaking ? 'animate-pulse scale-110' : ''}`} carnevalMode={carnevalMode} />
        <div className="absolute -top-1 -right-1 animate-pulse">
           <Sparkles size={16} className="text-yellow-400" />
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-[95vw] md:w-96 h-[600px] bg-[#001C30] rounded-[2.5rem] shadow-2xl flex flex-col z-50 overflow-hidden border ${carnevalMode ? 'border-orange-500/30' : 'border-blue-500/30'} animate-in slide-in-from-bottom-4`}>
      <div className={`${carnevalMode ? 'bg-orange-600' : 'bg-blue-700'} p-5 flex justify-between items-center text-white shrink-0 shadow-lg`}>
        <div className="flex items-center gap-3">
          <div className={`relative w-12 h-12 rounded-full ${carnevalMode ? 'bg-orange-900' : 'bg-blue-900'} flex items-center justify-center border-2 transition-all ${isSpeaking || isLiveMode ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-white/20'}`}>
            <WaiterAvatar className="w-9 h-9 mt-1" carnevalMode={carnevalMode} />
            {(isSpeaking || isLiveMode) && (
               <div className={`absolute inset-0 rounded-full border-2 ${carnevalMode ? 'border-orange-400' : 'border-blue-400'} animate-ping opacity-20`} />
            )}
          </div>
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest">Sora</h3>
            <span className="text-[9px] opacity-70 uppercase font-bold">{isLiveMode ? 'Live Translator' : (carnevalMode ? 'Fasnacht-Host' : 'Gastgeberin')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsSoundOn(!isSoundOn)} className="p-2 hover:bg-white/10 rounded-full transition-colors">{isSoundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-950/20 to-transparent custom-scrollbar">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user' ? (carnevalMode ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-blue-600 text-white rounded-tr-none') : 'bg-blue-900/40 text-white/90 border border-white/5 rounded-tl-none shadow-sm'}`}>
                    {msg.text || (msg.isStreaming && <Loader2 size={14} className="animate-spin" />)}
                </div>
            </div>
        ))}
        {isLiveMode && (currentInputTranscription || currentOutputTranscription) && (
           <div className="space-y-4 border-t border-white/5 pt-4">
              {currentInputTranscription && (
                <div className="flex justify-end">
                   <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tr-none text-[11px] text-white/60 italic">
                      {currentInputTranscription}
                   </div>
                </div>
              )}
              {currentOutputTranscription && (
                <div className="flex justify-start">
                   <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl rounded-tl-none text-[11px] text-blue-300">
                      {currentOutputTranscription}
                   </div>
                </div>
              )}
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-blue-950/40 border-t border-white/5 flex flex-col gap-4">
        {isLiveMode ? (
           <div className="flex items-center justify-between bg-blue-900/30 p-4 rounded-2xl border border-blue-500/20 animate-pulse">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                 <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Live Listening...</span>
              </div>
              <button onClick={toggleLiveMode} className="bg-red-600 p-3 rounded-xl text-white hover:bg-red-500 transition-colors">
                 <MicOff size={20} />
              </button>
           </div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <button type="button" onClick={toggleLiveMode} className={`p-4 rounded-xl border ${carnevalMode ? 'border-orange-500/20 hover:bg-orange-500/10' : 'border-blue-500/20 hover:bg-blue-500/10'} text-white transition-all`}>
              <Mic size={20} className={carnevalMode ? 'text-orange-400' : 'text-blue-400'} />
            </button>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder={t.soraPlaceholder} 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder:text-white/20" 
            />
            <button type="submit" disabled={!input.trim() || isLoading} className={`${carnevalMode ? 'bg-orange-600' : 'bg-blue-700'} p-3 rounded-xl text-white disabled:opacity-50 transition-colors shadow-lg`}>
              <Send size={18} />
            </button>
          </form>
        )}
        <div className="flex justify-center">
           <p className="text-[8px] font-black uppercase tracking-widest text-white/10 italic">Power by Gemini 2.5 Flash Native Audio</p>
        </div>
      </div>
    </div>
  );
};
