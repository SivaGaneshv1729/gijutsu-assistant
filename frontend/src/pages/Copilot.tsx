import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Menu, RotateCcw, LogOut, FileText, Sparkles, Zap, Settings, Trash2, Sun, Moon, PanelLeftOpen } from 'lucide-react';
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

interface HistoryItem {
  id: string;
  title: string;
  date: 'today' | 'yesterday';
  isActive?: boolean;
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', title: 'Active Telemetry Analysis', date: 'today', isActive: true },
    { id: '2', title: 'Hydraulic Pump Maintenance', date: 'today' },
    { id: '3', title: 'E101 Alarm Diagnostics', date: 'today' },
    { id: '4', title: 'Explain E502 Error Code', date: 'yesterday' },
    { id: '5', title: 'Translate Japanese Manual', date: 'yesterday' },
  ]);

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  
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
                    if (!citation) return <sup key={idx} className="text-orange-600 dark:text-indigo-300/50 font-medium">[{idx}]</sup>;
                    
                    const isActive = activeCitation?.id === citation.id;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveCitation(citation)}
                        className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold shadow-lg transition-all duration-300 cursor-pointer border ${
                          isActive 
                            ? 'bg-orange-500 dark:bg-indigo-500 border-orange-400 dark:border-indigo-400 text-white shadow-orange-500 dark:shadow-indigo-500/50 scale-110' 
                            : 'bg-orange-500 dark:bg-indigo-500/10 border-orange-500 dark:border-indigo-500/30 text-orange-600 dark:text-indigo-300 hover:bg-orange-500 dark:bg-indigo-500/30 hover:border-orange-400 dark:border-indigo-400 hover:text-orange-900 dark:text-indigo-100 hover:shadow-orange-500 dark:shadow-indigo-500/20'
                        }`}
                      >
                        {idx}
                      </button>
                    );
                  })}
                </span>
              );
            }
            
            // Check for animated clip/video
            const isVideoFile = props.href?.match(/\.(mp4|webm|ogg)$/i);
            const isYouTube = props.href?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i);
            
            if (isVideoFile || isYouTube) {
              return (
                <div className="my-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 shadow-2xl transition-transform hover:scale-[1.01] duration-300">
                  {isVideoFile ? (
                    <video 
                      src={props.href} 
                      controls 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full max-w-2xl max-h-[400px] object-cover bg-black"
                    />
                  ) : (
                    <div className="relative w-full max-w-2xl aspect-video bg-black">
                      <iframe 
                        src={`https://www.youtube-nocookie.com/embed/${isYouTube?.[1]}?autoplay=1&mute=1&loop=1&playlist=${isYouTube?.[1]}`}
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0"
                      />
                    </div>
                  )}
                  {props.children && (
                    <div className="p-3 text-center text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-[#0B0F19] border-t border-gray-100 dark:border-white/5 font-medium flex items-center justify-center gap-2">
                      <Zap size={12} className="text-orange-500 dark:text-indigo-400" />
                      {props.children}
                    </div>
                  )}
                </div>
              );
            }

            return <a {...props} target="_blank" rel="noopener noreferrer" className="text-orange-500 dark:text-indigo-400 hover:text-orange-400 hover:underline font-medium transition-colors drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />;
          },
          img: ({ node, ...props }) => (
            <div className="my-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 shadow-2xl transition-transform hover:scale-[1.02] duration-300 cursor-pointer">
              <img 
                {...props} 
                className="w-full max-w-2xl max-h-[600px] object-contain bg-gray-50 dark:bg-white/5" 
                alt={props.alt || "Embedded Image"} 
                onClick={() => window.open(props.src, '_blank')}
              />
              {props.alt && (
                <div className="p-3 text-center text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-[#0B0F19] border-t border-gray-100 dark:border-white/5">
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
    <div className={`w-full overflow-hidden relative ${theme}`}>
      <div className="flex h-screen bg-[#F9FAFB] dark:bg-[#05050A] text-gray-800 dark:text-slate-200 dark:text-slate-200 font-sans w-full overflow-hidden relative transition-colors duration-500">
      
      {/* Deep Space Animated Background */}
      
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      {/* LEFT PANE: Sidebar */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-50 dark:bg-white/5 backdrop-blur-sm z-30 transition-opacity duration-300" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`${sidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-[280px] md:translate-x-0 md:w-0'} transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 z-40 absolute md:relative h-full overflow-hidden`}>
        <div className="w-[280px] h-full flex flex-col bg-[#F9FAFB] md:bg-white dark:bg-[#0B0F19] dark:bg-black/40 shadow-[0_0_15px_rgba(0,0,0,0.03)] dark:shadow-none backdrop-blur-2xl border-r border-gray-100 dark:border-white/5">
          
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-orange-500 dark:bg-indigo-500/20 text-orange-500 dark:text-indigo-400">
                <Bot size={22} />
              </div>
              <span className="font-bold tracking-wide text-gray-900 dark:text-slate-100 text-lg">SHIBAURA</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 mb-5">
            <button onClick={handleNewChat} className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-orange-500 dark:bg-indigo-500 hover:bg-orange-600 dark:bg-indigo-600 transition-all text-white text-sm font-semibold shadow-lg shadow-orange-500 dark:shadow-indigo-500/20 hover:shadow-orange-500 dark:shadow-indigo-500/40">
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <span>New Uplink</span>
              </div>
              <span className="text-orange-800 dark:text-indigo-200 text-[10px] font-mono border border-orange-400 dark:border-indigo-400/30 px-1.5 py-0.5 rounded">⌘N</span>
            </button>
          </div>


                    <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
            {history.some(h => h.date === 'today') && (
              <>
                <div className="px-6 mb-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Today</span>
                </div>
                <div className="px-3 mb-5 space-y-0.5">
                  {history.filter(h => h.date === 'today').map(item => (
                    <button key={item.id} className={`w-full text-left px-3 py-2 rounded-lg text-[13px] truncate transition-colors border-l-[3px] group flex items-center justify-between ${item.isActive ? 'bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-slate-200 font-medium border-orange-500 dark:border-indigo-500' : 'hover:bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 border-transparent'}`}>
                      <span className="truncate">{item.title}</span>
                      <div onClick={(e) => deleteHistoryItem(e, item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 dark:text-slate-500 hover:text-red-500 transition-all cursor-pointer">
                        <Trash2 size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {history.some(h => h.date === 'yesterday') && (
              <>
                <div className="px-6 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Yesterday</span>
                </div>
                <div className="px-3 space-y-0.5">
                  {history.filter(h => h.date === 'yesterday').map(item => (
                    <button key={item.id} className={`w-full text-left px-3 py-2 rounded-lg text-[13px] truncate transition-colors border-l-[3px] group flex items-center justify-between ${item.isActive ? 'bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-slate-200 font-medium border-orange-500 dark:border-indigo-500' : 'hover:bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 border-transparent'}`}>
                      <span className="truncate">{item.title}</span>
                      <div onClick={(e) => deleteHistoryItem(e, item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 dark:text-slate-500 hover:text-red-500 transition-all cursor-pointer">
                        <Trash2 size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-[#F9FAFB]">
            <div 
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-3 mb-4 px-3 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 cursor-pointer transition-colors"
            >
              <Settings size={16} />
              <span className="text-sm font-medium">Settings</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:border-white/10 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 dark:bg-indigo-500/20 border border-orange-500 dark:border-indigo-500/50 flex items-center justify-center">
                  <User size={16} className="text-orange-500 dark:text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">Admin User</span>
                  <span className="text-[11px] text-gray-400 dark:text-slate-500">Pro License</span>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 -mr-1 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Disconnect">
                <LogOut size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* CENTER PANE: ChatGPT Interface */}
      <div className="flex-1 flex flex-col h-full relative z-10 min-w-0">
        
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between p-4 pointer-events-none">
          <div className="flex items-center pointer-events-auto">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg bg-white/50 hover:bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 transition-colors mr-3 backdrop-blur-md shadow-sm border border-gray-100 dark:border-white/5"
                title="Open sidebar"
              >
                <PanelLeftOpen size={20} />
              </button>
            )}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 transition-colors mr-3 md:hidden pointer-events-auto"
                title="Close sidebar"
              >
                <Menu size={20} />
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className="flex items-center gap-3 bg-white dark:bg-[#0B0F19] dark:bg-black/40 shadow-md dark:shadow-none backdrop-blur-xl border border-gray-100 dark:border-white/5 px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-orange-400 dark:bg-indigo-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse"></div>
              <h1 className="text-sm font-semibold text-gray-800 dark:text-slate-200 tracking-wide">
                SHIBAURA Copilot
              </h1>
            </div>
          </div>
          
          <div className="w-10"></div> {/* Spacer for center alignment */}
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto relative scroll-smooth no-scrollbar">
          <div className="flex flex-col pb-48">
            {messages.length === 1 && !loading && (
              <div className="flex flex-col items-center justify-center mt-20 sm:mt-32 mb-10 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Upgrade Badge */}
                <div className="mb-12 px-4 py-1.5 rounded-full border border-orange-500 dark:border-indigo-500/30 bg-orange-500 dark:bg-indigo-500/10 text-orange-500 dark:text-indigo-400 text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-orange-500 dark:bg-indigo-500/20 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  <Sparkles size={14} />
                  Upgrade free plan to full access
                </div>

                <div className="mb-6 p-4 rounded-3xl bg-orange-500 dark:bg-indigo-500/10 text-orange-500 dark:text-indigo-400 border border-orange-500 dark:border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                  <Bot size={40} />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-16 tracking-tight text-center">
                  Let's start a smart conversation
                </h2>
                
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="w-full animate-in fade-in duration-500">
                <div className={`max-w-3xl mx-auto flex gap-4 px-4 py-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                  {/* Assistant Avatar */}
                  {msg.role === 'assistant' && (
                    <div className="shrink-0 mt-1 hidden sm:block">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border ${msg.isError ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/20' : 'bg-gradient-to-br from-indigo-600 to-blue-800 text-white border-orange-500 dark:border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.4)]'}`}>
                        <Bot size={16} />
                      </div>
                    </div>
                  )}

                  {/* Content Bubble */}
                  <div className={`flex flex-col min-w-0 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`text-[15px] leading-relaxed font-normal p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-slate-100 border border-gray-100 dark:border-white/5 rounded-tr-sm backdrop-blur-md shadow-lg' 
                        : 'text-gray-800 dark:text-slate-200 prose  max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50 dark:prose-pre:bg-black/50 dark:bg-white/5 prose-pre:border prose-pre:border-gray-200 dark:border-white/10 prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-slate-100 dark:prose-invert dark:text-slate-100'
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
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-md">
                        <User size={16} className="text-gray-700 dark:text-slate-300" />
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
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-blue-800 text-white border border-orange-500 dark:border-indigo-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                      <Bot size={18} />
                    </div>
                  </div>
                  <div className="flex-1 flex items-center h-9 gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-orange-400 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-orange-400 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} className="h-4" />
          </div>
        </div>

        {/* Floating Input Area (ChatGPT Style Glassmorphism) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#F9FAFB] dark:from-[#05050A] via-[#F9FAFB]/90 dark:via-[#05050A]/90 to-transparent pt-16 pb-8 px-4 z-20 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="relative flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white dark:bg-[#0B0F19] backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden focus-within:border-orange-500 dark:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="w-full max-h-[200px] bg-transparent text-gray-900 dark:text-slate-100 placeholder-slate-500 p-5 pb-3 resize-none outline-none text-[15px] leading-relaxed"
                rows={1}
              />
              <div className="flex items-center justify-end px-3 pb-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="p-2 rounded-full bg-orange-500 dark:bg-indigo-500 text-white disabled:bg-orange-100 disabled:text-orange-300 hover:bg-orange-400 dark:bg-indigo-400 transition-all duration-300 disabled:shadow-none shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                  >
                    <Send size={16} className="translate-x-[1px] -translate-y-[1px]" />
                  </button>
                </div>
              </div>
            </div>
                  <div className="mt-2 text-center text-[10px] text-gray-400 dark:text-slate-500 tracking-wide pb-2">
              SHIBAURA AI can make mistakes. Verify critical telemetry with official logs.
            </div>  </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: NotebookLM-Style PDF Citation Viewer */}
      {/* Mobile Backdrop for Citation Pane */}
      {activeCitation && (
        <div 
          className="xl:hidden fixed inset-0 bg-gray-50 dark:bg-white/5 backdrop-blur-sm z-40" 
          onClick={() => setActiveCitation(null)}
        />
      )}
      <div 
        className={`${activeCitation ? 'opacity-100 translate-y-0 xl:translate-x-0 pointer-events-auto' : 'opacity-0 translate-y-10 xl:translate-y-0 xl:translate-x-10 pointer-events-none xl:w-0 xl:m-0'} 
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 flex flex-col z-50 xl:z-30 
          fixed inset-4 xl:relative xl:inset-auto ${activeCitation ? 'xl:w-[500px] xl:m-4' : 'xl:w-0 xl:m-0'} 
          rounded-3xl bg-white/90 xl:bg-white dark:bg-[#0B0F19] backdrop-blur-3xl border border-gray-300 dark:border-white/20 xl:border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden`}
      >
        {activeCitation && (
          <>
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-orange-500 dark:bg-indigo-500/20 text-orange-500 dark:text-indigo-400 flex items-center justify-center border border-orange-500 dark:border-indigo-500/30 shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm truncate">{activeCitation.name || 'Source Document'}</h3>
                  {activeCitation.page_number && (
                    <p className="text-[10px] text-orange-500 dark:text-indigo-400 mt-0.5 uppercase tracking-widest font-bold">
                      Page {activeCitation.page_number}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setActiveCitation(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </header>

            {/* PDF Viewer — takes up most of the pane */}
            {activeCitation.name?.toLowerCase().endsWith('.pdf') && activeCitation.page_number ? (
              <div className="flex-1 flex flex-col min-h-0">
                <iframe 
                  src={`/pdf-uploads/${encodeURIComponent(activeCitation.name)}#page=${activeCitation.page_number}`}
                  className="flex-1 w-full border-none bg-white dark:bg-[#0B0F19]"
                  title="PDF Viewer"
                />
                {/* Extracted text as a small collapsible footer */}
                <div className="shrink-0 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 max-h-[180px] overflow-y-auto no-scrollbar">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
                      <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-[0.3em]">Extracted Text</span>
                      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
                    </div>
                    <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
                      {activeCitation.text_content}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback for non-PDF citations: show text content */
              <div className="flex-1 overflow-y-auto p-6 scroll-smooth no-scrollbar">
                {activeCitation.image_url && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 shadow-2xl">
                    <img 
                      src={activeCitation.image_url} 
                      alt="Document Figure" 
                      className="w-full h-auto object-contain bg-gray-50 dark:bg-white/5" 
                    />
                  </div>
                )}
                <p className="text-[14px] text-gray-700 dark:text-slate-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-white/10">
                  {activeCitation.text_content}
                </p>
              </div>
            )}
          </>
        )}
      </div>


      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSettingsOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#0B0F19] dark:bg-[#0B0F19] w-[400px] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 dark:border-white/10 overflow-hidden flex flex-col transition-colors duration-500">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5 dark:border-white/5">
              <h2 className="font-bold text-gray-900 dark:text-slate-100 dark:text-slate-100 text-lg">Settings</h2>
              <button onClick={() => setSettingsOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:bg-white/10 dark:hover:bg-white/10 text-gray-500 dark:text-slate-400 dark:text-slate-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200 dark:text-slate-200 mb-4">Appearance</h3>
              <div className="flex bg-gray-100 dark:bg-white/10 dark:bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    theme === 'light' ? 'bg-white dark:bg-[#0B0F19] text-orange-500 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200'
                  }`}
                >
                  <Sun size={16} /> Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    theme === 'dark' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:hover:text-slate-200 hover:text-gray-800 dark:text-slate-200'
                  }`}
                >
                  <Moon size={16} /> Dark
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

