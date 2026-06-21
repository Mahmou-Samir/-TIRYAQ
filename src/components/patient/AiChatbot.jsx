import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Loader2, Sparkles, Minimize2, Trash2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import {
  sendChatMessage, CHAT_SUGGESTIONS, getWelcomeMessage,
  fetchAiStatus, getProviderLabel,
} from '../../utils/aiChatService';

function renderMarkdownLite(text) {
  return text
    .split('\n')
    .map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i} className="block mb-1.5 last:mb-0">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="font-black text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
        </span>
      );
    });
}

export default function AiChatbot() {
  const { lang, t } = useSettings();
  const navigate = useNavigate();
  const C = t?.patient?.chatbot ?? {};
  const isRTL = lang === 'ar';
  const suggestions = CHAT_SUGGESTIONS[lang] || CHAT_SUGGESTIONS.ar;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiOnline, setAiOnline] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('teryaq_chat');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ role: 'assistant', content: getWelcomeMessage(lang), source: 'system' }];
  });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener('teryaq-open-chat', openChat);
    return () => window.removeEventListener('teryaq-open-chat', openChat);
  }, []);

  useEffect(() => {
    if (open) {
      fetchAiStatus().then((s) => setAiOnline(Boolean(s?.gemini || s?.openai || s?.openrouter)));
    }
  }, [open]);

  useEffect(() => {
    try { sessionStorage.setItem('teryaq_chat', JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: getWelcomeMessage(lang), source: 'system' }]);
    sessionStorage.removeItem('teryaq_chat');
  };

  const send = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const history = [...messages, userMsg]
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content?.trim())
      .map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { content, source } = await sendChatMessage(history, lang);
      setMessages((m) => [...m, { role: 'assistant', content, source }]);
    } catch {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: isRTL ? 'حدث خطأ. تأكد أن سيرفر AI يعمل على المنفذ 8000.' : 'Error — ensure AI server runs on port 8000.',
        source: 'local',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed z-[135] inset-x-3 bottom-28 lg:bottom-6 lg:end-6 lg:start-auto lg:w-[min(480px,calc(100vw-2rem))] lg:inset-x-auto flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden max-h-[min(78vh,640px)]"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="shrink-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-4 flex items-center gap-3 text-white">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center relative">
                <Bot size={24} />
                <span className={`absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full border-2 border-indigo-600 ${aiOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm flex items-center gap-1.5">
                  {C.title || 'د. ترياق AI'}
                  <Sparkles size={14} className="opacity-80" />
                  {aiOnline && (
                    <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Zap size={10} /> {C.powered || 'Gemini + GPT'}
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-white/70 font-bold truncate">
                  {aiOnline ? (C.subtitleOnline || 'ذكاء اصطناعي متقدم — متصل') : (C.subtitleOffline || 'وضع محلي — شغّل سيرفر AI')}
                </p>
              </div>
              <button type="button" onClick={clearChat} title={C.clear || 'مسح المحادثة'} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                <Trash2 size={16} />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                <Minimize2 size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`max-w-[92%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' ? renderMarkdownLite(msg.content) : msg.content}
                  </div>
                  {msg.role === 'assistant' && msg.source && msg.source !== 'system' && (
                    <span className="text-[9px] text-slate-400 font-bold mt-1 px-1">
                      {getProviderLabel(msg.source)}
                    </span>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-end">
                  <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center gap-2 text-violet-600">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-bold">{C.thinking || 'د. ترياق يفكر...'}</span>
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 2 && !loading && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px] font-black border border-violet-100 dark:border-violet-800 max-w-[200px] truncate"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="shrink-0 p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/50">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); navigate('/patient/health'); }}
                  className="shrink-0 px-3 py-2.5 rounded-xl text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
                >
                  {C.healthGuide || 'دليل الأمراض'}
                </button>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder={C.placeholder || 'صف أعراضك بالتفصيل...'}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-sm font-medium outline-none focus:border-violet-500 resize-none max-h-24"
                />
                <button
                  type="button"
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-violet-600 text-white disabled:opacity-40 hover:bg-violet-700 transition-colors self-end"
                >
                  <Send size={18} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          type="button"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="fixed z-[130] bottom-28 start-4 lg:bottom-6 lg:start-6 w-[3.75rem] h-[3.75rem] rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white shadow-2xl shadow-violet-600/40 flex items-center justify-center border-2 border-white/20"
          aria-label={C.open || 'فتح المساعد'}
        >
          <Bot size={28} />
          <span className="absolute -top-1 -end-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </motion.button>
      )}
    </>
  );
}
