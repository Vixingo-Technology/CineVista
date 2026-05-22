import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Film, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'model',
    content: "Hi! I'm the CineVista assistant. I can suggest movies based on your taste, director preferences, or current mood. What do you feel like watching today?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });
      
      const data = await response.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-[#EAB308] hover:bg-[#EAB308]/90 text-black rounded-full shadow-lg shadow-[#EAB308]/20 flex items-center justify-center transition-colors z-50 group"
          >
            <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[360px] h-[520px] bg-[#0F0F10] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0F0F10]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAB308]/10 flex items-center justify-center border border-[#EAB308]/20">
                  <Bot className="w-6 h-6 text-[#EAB308]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">CineVista AI</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Movie Assistant Active</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0A0A0B]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                    <div className="w-6 h-6 rounded-full bg-[#EAB308]/10 flex-shrink-0 flex items-center justify-center mt-1">
                      <Film className="w-3 h-3 text-[#EAB308]" />
                    </div>
                  )}
                  <div 
                    className={`max-w-[85%] p-4 text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#EAB308] text-black rounded-2xl rounded-tr-none font-medium' 
                        : 'bg-white/5 text-gray-300 rounded-2xl rounded-tl-none border border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-6 h-6 rounded-full bg-[#EAB308]/10 flex-shrink-0 flex items-center justify-center mt-1">
                    <Film className="w-3 h-3 text-[#EAB308]" />
                  </div>
                  <div className="bg-white/5 text-gray-300 rounded-2xl rounded-tl-none border border-white/5 p-4">
                    <Loader2 className="w-4 h-4 animate-spin text-[#EAB308]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-[#0F0F10] border-t border-white/10">
              <form onSubmit={handleSend} className="relative flex flex-col">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask CineVista AI..."
                    className="w-full bg-[#1A1A1C] border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-[#EAB308] text-white placeholder:text-gray-500 transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-2 bg-[#EAB308] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold disabled:opacity-50 hover:bg-[#EAB308]/90 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[9px] text-gray-600 text-center mt-3">AI-powered recommendations synced with IMDb & TMDB data.</p>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
