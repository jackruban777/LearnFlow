import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PaperPlaneTilt,
  Robot,
  Sparkle,
  ArrowClockwise,
  CircleNotch,
} from '@phosphor-icons/react';
import { AppShell } from '../components/layout/AppShell';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassBadge } from '../components/ui/GlassBadge';
import { api } from '../lib/api';
import { useNotification } from '../hooks/useNotification';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_SUGGESTIONS = [
  'Explain closure scope in JavaScript',
  'Write a Python quicksort algorithm',
  'How do indexes speed up SQL queries?',
  'What is the difference between REST and GraphQL?',
];

// Simple markdown parser for mentor chat replies
function formatMentorContent(content: string) {
  if (!content) return null;

  const lines = content.split('\n');
  const rendered: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        rendered.push(
          <div key={`code-${idx}`} className="relative my-3 rounded-xl overflow-hidden bg-black/40 border border-white/5 font-mono text-xs">
            <div className="flex justify-between items-center bg-white/5 px-4 py-1.5 border-b border-white/5 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
              <span>{codeLang || 'code'}</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeLines.join('\n'))}
                className="hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-gray-300">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        codeLines = [];
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.replace('```', '').trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      rendered.push(<div key={idx} className="h-2" />);
      return;
    }

    // Bold replacement helper
    const parts = trimmed.split('**');
    const nodes = parts.map((part, pIdx) => {
      if (pIdx % 2 === 1) {
        return <strong key={pIdx} className="font-semibold text-white">{part}</strong>;
      }
      return part;
    });

    rendered.push(
      <p key={idx} className="text-sm leading-relaxed mb-2 text-gray-300">
        {nodes}
      </p>
    );
  });

  return <div>{rendered}</div>;
}

export function MentorChat() {
  const { showToast } = useNotification();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your AI Study Buddy. Ask me anything about programming languages, algorithms, architecture design, or interview preps!",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [thinking, setThinking] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep scroll aligned to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsgs: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMsgs);
    setInputText('');
    setThinking(true);

    try {
      const res = await api.post('/mentor/chat', {
        messages: newMsgs,
      });

      const reply = res.data.data;
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      showToast('error', 'Message Failed', 'Could not fetch response from study buddy');
    } finally {
      setThinking(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hi! I'm your AI Study Buddy. Ask me anything about programming languages, algorithms, architecture design, or interview preps!",
      },
    ]);
  };

  return (
    <AppShell title="AI Mentor Chat">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-6.5rem)] overflow-hidden">
        
        {/* Top Header bar with Info & Clear */}
        <div className="px-5 py-3.5 border border-white/10 border-b-0 bg-white/5 backdrop-blur-glass rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-violet/20 border border-accent-violet/30 flex items-center justify-center text-accent-violet">
              <Robot size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-display">Study Buddy</h3>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <Sparkle size={10} className="text-accent-emerald animate-pulse" />
                Active memory retrieval
              </p>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg border border-white/5 hover:border-white/10 bg-white/5 text-gray-400 hover:text-white transition-colors"
            title="Clear Chat Logs"
          >
            <ArrowClockwise size={14} />
          </button>
        </div>

        {/* Scrollable Conversation screen */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-4 border border-white/10 bg-dark-900/40 select-text"
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar dot */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                    isUser
                      ? 'bg-accent-violet/20 border-accent-violet/30 text-accent-violet'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  {isUser ? '👤' : <Robot size={14} />}
                </div>

                {/* Dialog Bubble */}
                <div
                  className={`p-4 rounded-2xl border text-sm shadow-sm ${
                    isUser
                      ? 'bg-accent-violet/85 border-white/10 text-white rounded-tr-none'
                      : 'bg-white/5 border-white/5 text-gray-300 rounded-tl-none backdrop-blur-glass'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    formatMentorContent(msg.content)
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking bubble */}
          {thinking && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border bg-white/5 border-white/10 text-gray-400">
                <Robot size={14} />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none border bg-white/5 border-white/5 text-gray-400 flex items-center gap-2">
                <CircleNotch size={14} className="animate-spin text-accent-violet" />
                <span className="text-xs italic font-medium">Thinking…</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips and Input tray */}
        <div className="p-4 border border-white/10 border-t-0 bg-white/5 backdrop-blur-glass rounded-b-2xl space-y-3">
          {/* Suggestion Chips */}
          {messages.length === 1 && (
            <div className="flex gap-2 flex-wrap pb-1">
              {CHAT_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug)}
                  className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-[11px] font-medium text-gray-400 hover:text-white transition-all text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Chat input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything about these concepts…"
              className="flex-1 glass-input py-2.5 px-4 text-xs"
              disabled={thinking}
            />
            <button
              type="submit"
              disabled={thinking || !inputText.trim()}
              className="p-3 bg-accent-violet hover:bg-accent-violet/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white shadow-md transition-all scale-100 hover:scale-105 active:scale-95"
            >
              <PaperPlaneTilt size={16} weight="fill" />
            </button>
          </form>
        </div>

      </div>
    </AppShell>
  );
}
