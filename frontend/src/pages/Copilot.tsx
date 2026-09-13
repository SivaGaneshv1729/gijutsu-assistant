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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Engineering Copilot
            <span className="px-2 py-1 text-xs font-semibold bg-accent/20 text-accent rounded-full">BETA</span>
          </h1>
          <p className="text-textMuted mt-1">Grounded RAG assistance for manufacturing workflows.</p>
        </div>
      </header>

      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative">
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
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-br-sm' 
                    : 'bg-surface border border-white/5 rounded-bl-sm shadow-sm prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-img:rounded-xl'
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
        <div className="p-4 border-t border-white/5 bg-surface/50">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about alarms, maintenance, or machine specifications..."
              className="w-full pl-5 pr-14 py-4 bg-background border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-text placeholder-textMuted/50 outline-none shadow-inner"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 p-2 rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-2 text-center flex items-center justify-center gap-2 text-xs text-textMuted">
            <ShieldAlert size={14} />
            AI can make mistakes. Always verify with official documentation before modifying machine parameters.
          </div>
        </div>
      </div>
    </div>
  );
}

function CitationBlock({ citations, confidence }: { citations: any[], confidence?: string }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-background rounded-xl border border-white/5 overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-xs font-medium text-textMuted hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText size={14} />
          <span>{citations.length} Sources Referenced</span>
          {confidence && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
              confidence === 'High' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {confidence} Confidence
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {expanded && (
        <div className="p-3 border-t border-white/5 space-y-2 bg-surface/30">
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
