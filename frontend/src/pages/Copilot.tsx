import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
  confidence?: string;
}

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: 'Hello. I am the SHIBAURA Engineering Copilot. How can I assist you with maintenance, diagnostics, or operational queries today?',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: input, language: 'en' })
      });

      if (!res.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await res.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.answer,
        confidence: data.data.confidence,
        citations: data.data.citations
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error communicating with the Engineering Intelligence service. Please try again.",
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 w-full">
      <header className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            SHIBAURA Engineering Copilot
          </h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden max-w-5xl mx-auto w-full relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-4xl ${msg.role === 'user' ? 'ml-auto' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                  <Bot size={20} className="text-primary" />
                </div>
              )}
              
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                    : 'bg-transparent text-gray-800 dark:text-gray-200 prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-img:rounded-lg'
                }`}>
                  {msg.role === 'user' ? (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
                
                {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 w-full max-w-sm">
                    <CitationBlock citations={msg.citations} confidence={msg.confidence} />
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0 border border-white/10">
                  <User size={20} className="text-textMuted" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-4xl">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                <Bot size={20} className="text-primary" />
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-white/5 rounded-bl-sm flex gap-1 items-center h-[52px]">
                <div className="w-2 h-2 rounded-full bg-textMuted animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-textMuted animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-textMuted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about machinery, maintenance, or operations..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-2 text-center flex items-center justify-center gap-1 text-[11px] text-gray-400">
            <ShieldAlert size={12} />
            Always verify with official documentation.
          </div>
        </div>
      </div>
    </div>
  );
}

function CitationBlock({ citations, confidence }: { citations: any[], confidence?: string }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2.5 text-[11px] font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText size={12} />
          <span>{citations.length} Sources Referenced</span>
          {confidence && (
            <span className={`px-1.5 py-0.5 rounded uppercase font-bold ${
              confidence === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {confidence} Confidence
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      
      {expanded && (
        <div className="p-2.5 border-t border-gray-200 dark:border-gray-700 space-y-2 bg-white dark:bg-gray-900">
          {citations.map((c, i) => (
            <div key={i} className="text-xs flex items-start gap-2">
              <span className="text-primary font-mono mt-0.5">[{i + 1}]</span>
              <div>
                <p className="text-text font-medium">{c.section}</p>
                <p className="text-textMuted font-mono text-[10px] mt-0.5">{c.chunk_id}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
