import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Plus, MessageSquare, Menu, RotateCcw, LogOut, FileText, Sparkles, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

interface Citation {
  id: string;
  text_content: string;
  name?: string;
  access_level?: string;
  rrf_score?: number;
  image_url?: string;
  page_number?: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidence?: string;
  isError?: boolean;
  query?: string; 
  isTyping?: boolean; 
}

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  useEffect(() => {
    let i = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const type = () => {
      // Dynamic chunk size (base chunk relative to text length, plus random burst)
      const baseChunk = Math.max(1, Math.floor(text.length / 80));
      const burst = Math.floor(Math.random() * (baseChunk * 2)) + 1;
      i += burst;
      
      setDisplayed(text.slice(0, i));
      
      if (i < text.length) {
        // 10% chance to simulate a network/generation "pause"
        const isPause = Math.random() < 0.1;
        const delay = isPause ? Math.random() * 150 + 50 : Math.random() * 20 + 5;
        timeoutId = setTimeout(type, delay);
      } else {
        if (onCompleteRef.current) onCompleteRef.current();
      }
    };
    
    timeoutId = setTimeout(type, 10);
    return () => clearTimeout(timeoutId);
  }, [text]);

  return <span>{displayed}</span>;
}

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: 'Greetings, Commander. I am the SHIBAURA Engineering Intelligence System. All manuals and diagnostics are loaded. How can I assist you?',
    isTyping: false
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, activeCitation]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const sendQuery = async (query: string) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query, language: 'en' })
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const payload = data.data || data;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: payload.answer || 'No answer received.',
        confidence: payload.confidence,
        citations: payload.citations,
        isTyping: false 
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // The user wants references to only open when clicked manually, like in NotebookLM.
      
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "System communication failure. Retrying uplink...",
        isError: true,
        query: query,
        isTyping: false
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const query = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: query };
    setMessages(prev => [...prev.map(m => ({ ...m, isTyping: false })), userMsg]);
    setInput('');
    setActiveCitation(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendQuery(query);
  };

  const handleRetry = async (query: string, errorMsgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== errorMsgId));
    await sendQuery(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNewChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Greetings, Commander. I am the SHIBAURA Engineering Intelligence System. All manuals and diagnostics are loaded. How can I assist you?',
      isTyping: false
    }]);
    setActiveCitation(null);
  };

  const MarkdownWithCitations = ({ content, citations, isTyping }: { content: string, citations?: Citation[], isTyping?: boolean }) => {
    const processedContent = content.replace(/(?:\[|【)(\d+(?:,\s*\d+)*)(?:\]|】)/g, '[$1](#cite-$1)');
    
    const markdownComponent = (
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => {
            if (props.href?.startsWith('#cite-')) {
              const indicesStr = props.href.replace('#cite-', '');
              const indices = indicesStr.split(',').map(s => parseInt(s.trim(), 10));
              
              return (
                <span className="inline-flex gap-1 mx-1 translate-y-[-2px]">
                  {indices.map(idx => {
                    const citation = citations?.[idx - 1];
                    if (!citation) return <sup key={idx} className="text-indigo-500/50 font-medium">[{idx}]</sup>;
                    
                    const isActive = activeCitation?.id === citation.id;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveCitation(citation)}
                        className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold shadow-lg transition-all duration-300 cursor-pointer border ${
                          isActive 
                            ? 'bg-indigo-500 border-indigo-400 text-white shadow-indigo-500/50 scale-110' 
                            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 hover:border-indigo-400 hover:text-indigo-100 hover:shadow-indigo-500/20'
                        }`}
                      >
                        {idx}
                      </button>
                    );
                  })}
                </span>
              );
            }
            return <a {...props} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />;
          },
          img: ({ node, ...props }) => (
            <div className="my-6 rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl transition-transform hover:scale-[1.02] duration-300 cursor-pointer">
              <img 
                {...props} 
                className="w-full max-w-2xl max-h-[600px] object-contain bg-white/5" 
                alt={props.alt || "Embedded Image"} 
                onClick={() => window.open(props.src, '_blank')}
              />
              {props.alt && (
                <div className="p-3 text-center text-xs text-slate-400 bg-black/40 border-t border-white/5">
                  {props.alt}
                </div>
              )}
            </div>
          )
        }}
      >
        {processedContent}
      </ReactMarkdown>
    );

    if (isTyping) {
      return <TypewriterText text={processedContent} onComplete={() => {
        setMessages(prev => prev.map(m => m.content === content ? { ...m, isTyping: false } : m));
      }} />;
    }

    return markdownComponent;
  };

  return (
    // DARK SPACE THEME 
    <div className="flex h-screen bg-[#05050A] text-slate-200 font-sans w-full overflow-hidden relative">
      
      {/* Deep Space Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#05050A] to-[#020205]"></div>
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      {/* LEFT PANE: Sidebar */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`${sidebarOpen ? 'w-[280px] translate-x-0' : 'w-[280px] -translate-x-full md:w-0 md:translate-x-0'} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 flex flex-col z-40 bg-black/40 backdrop-blur-2xl border-r border-white/5 absolute md:relative h-full`}>
        <div className="p-4 flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors hidden md:flex items-center justify-center shrink-0"
            title="Close sidebar"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] text-sm font-medium transition-all duration-300 group"
          >
            <span className="flex items-center gap-2 text-slate-200">
              <Sparkles size={16} className="text-indigo-400 group-hover:text-indigo-300" />
              New Uplink
            </span>
            <Plus size={16} className="text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2.5 rounded-xl border border-transparent hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 pt-0 no-scrollbar">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500/70 mb-3 px-3 mt-4">Transmissions</div>
          <div className="space-y-1">
            <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-indigo-500/10 text-sm text-left truncate transition-colors border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)] text-indigo-100 font-medium">
              <MessageSquare size={16} className="shrink-0 text-indigo-400" />
              <span className="truncate">Active Telemetry</span>
            </button>
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 text-sm text-left truncate transition-colors text-slate-400 hover:text-slate-200">
              <MessageSquare size={16} className="shrink-0" />
              <span className="truncate">Hydraulic Pump Maintenance</span>
            </button>
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 text-sm text-left truncate transition-colors text-slate-400 hover:text-slate-200">
              <MessageSquare size={16} className="shrink-0" />
              <span className="truncate">E101 Alarm Analysis</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-sm text-slate-400 hover:text-red-400 transition-all duration-300"
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>
      </div>

      {/* CENTER PANE: ChatGPT Interface */}
      <div className="flex-1 flex flex-col h-full relative z-10 min-w-0">
        
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 -ml-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors mr-3 backdrop-blur-md ${sidebarOpen ? 'md:hidden' : ''}`}
            title="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-full shadow-lg">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse"></div>
            <h1 className="text-sm font-semibold text-slate-200 tracking-wide flex items-center gap-2">
              SHIBAURA Copilot 
              <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Nexus
              </span>
            </h1>
          </div>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto relative scroll-smooth no-scrollbar">
          <div className="flex flex-col pb-48">
            {messages.length === 1 && !loading && (
              <div className="flex flex-col items-center justify-center mt-32 mb-10 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="relative w-24 h-24 mb-8 group">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl group-hover:bg-indigo-500/30 transition-all duration-500 animate-pulse"></div>
                  <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#1E1E2E] to-[#0B0F19] border border-indigo-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    <Zap size={40} className="text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 mb-4 tracking-tight text-center">
                  How can I assist, Commander?
                </h2>
                <p className="text-slate-400 text-center max-w-md text-[15px] leading-relaxed">
                  Query the Shibaura nexus for diagnostics, telemetry, and operational protocols.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="w-full animate-in fade-in duration-500">
                <div className={`max-w-3xl mx-auto flex gap-4 px-4 py-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                  {/* Assistant Avatar */}
                  {msg.role === 'assistant' && (
                    <div className="shrink-0 mt-1 hidden sm:block">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border ${msg.isError ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/20' : 'bg-gradient-to-br from-indigo-600 to-blue-800 text-white border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.4)]'}`}>
                        <Bot size={16} />
                      </div>
                    </div>
                  )}

                  {/* Content Bubble */}
                  <div className={`flex flex-col min-w-0 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`text-[15px] leading-relaxed font-normal p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-white/10 text-slate-100 border border-white/5 rounded-tr-sm backdrop-blur-md shadow-lg' 
                        : 'text-slate-200 prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-headings:font-bold prose-headings:text-slate-100'
                    }`}>
                      {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <MarkdownWithCitations content={msg.content} citations={msg.citations} isTyping={msg.isTyping} />
                      )}
                    </div>

                    {msg.isError && msg.query && (
                      <button
                        onClick={() => handleRetry(msg.query!, msg.id)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 mt-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw size={14} />
                        Re-initialize Query
                      </button>
                    )}
                  </div>
                  
                  {/* User Avatar (Hidden on small screens for cleaner look) */}
                  {msg.role === 'user' && (
                    <div className="shrink-0 mt-1 hidden sm:block">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-md">
                        <User size={16} className="text-slate-300" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="w-full animate-in fade-in duration-300">
                <div className="max-w-3xl mx-auto flex gap-6 px-4 py-8">
                  <div className="shrink-0 mt-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-blue-800 text-white border border-indigo-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                      <Bot size={18} />
                    </div>
                  </div>
                  <div className="flex-1 flex items-center h-9 gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} className="h-4" />
          </div>
        </div>

        {/* Floating Input Area (ChatGPT Style Glassmorphism) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#05050A] via-[#05050A]/90 to-transparent pt-16 pb-8 px-4 z-20 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="relative flex items-end shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all duration-300 group">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message SHIBAURA Nexus..."
                className="w-full max-h-[200px] bg-transparent text-slate-100 placeholder-slate-500 p-5 pr-16 resize-none outline-none text-[15px] leading-relaxed"
                rows={1}
              />
              <div className="absolute right-3 bottom-3 flex items-center">
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-full bg-white text-black disabled:bg-white/10 disabled:text-white/30 hover:bg-slate-200 transition-all duration-300 disabled:shadow-none shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  <Send size={18} className="translate-x-[1px] -translate-y-[1px]" />
                </button>
              </div>
            </div>
            <div className="mt-4 text-center text-[11px] text-slate-500 font-medium tracking-wide">
              Nexus intelligence can make mistakes. Verify critical telemetry with official logs.
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: NotebookLM-Style PDF Citation Viewer */}
      {/* Mobile Backdrop for Citation Pane */}
      {activeCitation && (
        <div 
          className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
          onClick={() => setActiveCitation(null)}
        />
      )}
      <div 
        className={`${activeCitation ? 'opacity-100 translate-y-0 xl:translate-x-0 pointer-events-auto' : 'opacity-0 translate-y-10 xl:translate-y-0 xl:translate-x-10 pointer-events-none xl:w-0'} 
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 flex flex-col z-50 xl:z-30 
          fixed inset-4 xl:relative xl:inset-auto xl:w-[500px] xl:m-4 
          rounded-3xl bg-black/80 xl:bg-black/40 backdrop-blur-3xl border border-white/20 xl:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden`}
      >
        {activeCitation && (
          <>
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-200 text-sm truncate">{activeCitation.name || 'Source Document'}</h3>
                  {activeCitation.page_number && (
                    <p className="text-[10px] text-cyan-400 mt-0.5 uppercase tracking-widest font-bold">
                      Page {activeCitation.page_number}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setActiveCitation(null)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </header>

            {/* PDF Viewer — takes up most of the pane */}
            {activeCitation.name?.toLowerCase().endsWith('.pdf') && activeCitation.page_number ? (
              <div className="flex-1 flex flex-col min-h-0">
                <iframe 
                  src={`/pdf-uploads/${encodeURIComponent(activeCitation.name)}#page=${activeCitation.page_number}`}
                  className="flex-1 w-full border-none bg-white"
                  title="PDF Viewer"
                />
                {/* Extracted text as a small collapsible footer */}
                <div className="shrink-0 border-t border-white/10 bg-black/60 max-h-[180px] overflow-y-auto no-scrollbar">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">Extracted Text</span>
                      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
                    </div>
                    <p className="text-[12px] text-slate-400 leading-relaxed">
                      {activeCitation.text_content}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback for non-PDF citations: show text content */
              <div className="flex-1 overflow-y-auto p-6 scroll-smooth no-scrollbar">
                {activeCitation.image_url && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl">
                    <img 
                      src={activeCitation.image_url} 
                      alt="Document Figure" 
                      className="w-full h-auto object-contain bg-white/5" 
                    />
                  </div>
                )}
                <p className="text-[14px] text-slate-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10">
                  {activeCitation.text_content}
                </p>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
