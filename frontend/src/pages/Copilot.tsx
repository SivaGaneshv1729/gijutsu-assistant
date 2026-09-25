import { useState, useRef, useEffect } from 'react';
import { MermaidRenderer } from '../components/MermaidRenderer';
import { Settings, Check, FileText, Send, Edit, ThumbsDown, Copy, RotateCcw, MessageSquare, Zap, Paperclip, Users, User, Sidebar, X, Mic, Search, Trash2, ThumbsUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import type { Message, Citation, ChatSession } from '../types';
import { listSessions, createSession, deleteSession as apiDeleteSession, getSessionMessages, sendChatMessage } from '../services/api';


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
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: t('chat.greeting'),
    isTyping: false
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [theme, setTheme] = useState('dark');
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [pdfPanelWidth, setPdfPanelWidth] = useState(450);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingPdf, setIsResizingPdf] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (e: any) => {
          let finalTranscript = '';
          for (let i = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
          }
          if (finalTranscript) setInput(prev => prev + ' ' + finalTranscript.trim());
        };
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      const sysMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**System:** Attached document \`${data.fileName}\` to the knowledge base. It is now available for querying!`,
        isTyping: false
      };
      setMessages(prev => [...prev, sysMsg]);
      
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const startResizingSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      setSidebarWidth(Math.max(150, Math.min(moveEvent.clientX, 600)));
    };
    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startResizingPdfPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingPdf(true);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = window.innerWidth - moveEvent.clientX;
      setPdfPanelWidth(Math.max(300, Math.min(newWidth, window.innerWidth - 300)));
    };
    const handleMouseUp = () => {
      setIsResizingPdf(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  // const settingsOpen = false;

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>({});

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedback(prev => ({ ...prev, [id]: prev[id] === type ? null : type }));
  };

  const handleRetry = async (msgIndex: number) => {
    if (loading) return;
    const userMsg = messages[msgIndex - 1];
    if (!userMsg || userMsg.role !== 'user') return;
    const query = userMsg.content;
    setMessages(prev => prev.slice(0, msgIndex));
    await sendQuery(query);
  };


  useEffect(() => {
    listSessions().then(setSessions).catch(console.error);
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      setLoading(true);
      getSessionMessages(currentSessionId)
        .then(dbMessages => {
          const uiMessages: Message[] = dbMessages.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            citations: m.citationsJson ? JSON.parse(m.citationsJson) : undefined,
          }));
          setMessages(uiMessages.length ? uiMessages : [{
            id: '1', role: 'assistant', content: t('chat.sessionLoaded'), isTyping: false
          }]);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [currentSessionId]);

  const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiDeleteSession(id);
      setSessions(prev => prev.filter(item => item.id !== id));
      if (currentSessionId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
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
    let sessionId = currentSessionId;
    try {
      if (!sessionId) {
        const newSession = await createSession(query);
        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        setSessions(prev => [newSession, ...prev]);
      }

      const msg = await sendChatMessage(sessionId, query, language);
      const aiMsg: Message = {
        id: msg.id,
        role: 'assistant',
        content: msg.content,
        citations: msg.citationsJson ? JSON.parse(msg.citationsJson) : undefined,
        isTyping: false 
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      if (err.message.includes('401') || err.message.includes('403')) {
        navigate('/login');
        return;
      }
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t("chat.systemError") + err.message,
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
    setCurrentSessionId(null);
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: t('chat.greeting'),
      isTyping: false
    }]);
    setActiveCitation(null);
  };

  const MarkdownWithCitations = ({ content, citations, isTyping }: { content: string, citations?: Citation[], isTyping?: boolean }) => {
    const processedContent = citations && citations.length > 0
      ? content.replace(/\[(\d+(?:,\s*\d+)*)\]/g, (_: string, p1: string) => {
          const cleanIndices = p1.replace(/\s+/g, '');
          return `[citations](#cite-${cleanIndices})`;
        })
      : content;
    
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
                        className={`inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded text-[10px] font-bold transition-all duration-300 cursor-pointer border ${
                          isActive 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
                            : 'bg-[#1e293b] border-white/10 text-slate-400 hover:bg-[#334155] hover:text-white'
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
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match && match[1] === 'mermaid') {
              return <MermaidRenderer chart={String(children).replace(/\n$/, '')} />;
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
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
  
  const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${active ? 'bg-[#18181b] text-white' : 'text-slate-400 hover:text-white hover:bg-[#18181b]/50'}`}>
        {icon}
        <span>{label}</span>
    </div>
  );

  return (
    <div className={`flex h-screen bg-[#09090b] text-slate-200 font-sans w-full overflow-hidden ${theme}`}>
      
      {/* LEFT SIDEBAR */}
      <div 
        style={{ width: sidebarOpen ? sidebarWidth : 0, transition: isResizingSidebar ? 'none' : 'width 0.3s ease-in-out' }}
        className={`relative shrink-0 flex flex-col bg-[#09090b] border-r border-white/5 h-full overflow-hidden z-30`}
      >
        {/* Resize Handler */}
        {sidebarOpen && (
           <div
             onMouseDown={startResizingSidebar}
             className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/50 z-50 transition-colors"
           />
        )}
        {/* Logo and Collapse */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="font-bold text-xl tracking-wider text-white">{t('app.title')}</div>
          <div className="flex items-center gap-3 text-slate-400">
            <button onClick={handleNewChat} title={t("sidebar.newChat")}><Edit size={16} className="hover:text-white transition-colors" /></button>
            <button onClick={() => setSidebarOpen(false)} title={t("sidebar.close")}><Sidebar size={16} className="hover:text-white transition-colors" /></button>
          </div>
        </div>
        
        {/* Search */}
        <div className="px-4 mb-6">
          <div className="bg-[#18181b] rounded-lg px-3 py-2 flex items-center gap-2 border border-white/5 focus-within:border-white/20 transition-colors">
            <Search size={14} className="text-slate-500" />
            <input type="text" placeholder={t("sidebar.search")} className="bg-transparent border-none outline-none text-sm text-slate-300 w-full placeholder-slate-600" />
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-3 mb-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold px-3 mb-2 shrink-0">{t("sidebar.menu")}</div>
          <div className="space-y-0.5">
             <SidebarItem icon={<Settings size={16}/>} label={t("sidebar.settings")} onClick={() => setSettingsOpen(true)} />
             <SidebarItem icon={<Users size={16}/>} label={t("sidebar.teams")} />
          </div>
        </div>

        {/* Recent Chats */}
        <div className="px-3 mb-6 flex-1 overflow-y-auto no-scrollbar flex flex-col">
          <div className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold px-3 mb-3 shrink-0">{t("sidebar.recentChats")}</div>
          <div className="space-y-0.5 flex-1">
            {sessions.length === 0 ? (
                <div className="text-center text-slate-500 py-6 text-xs">{t("sidebar.noChats")}</div>
            ) : (
                sessions.map(item => (
                    <div key={item.id} onClick={() => { setCurrentSessionId(item.id); }} className={`flex items-center justify-between group cursor-pointer px-3 py-2 rounded-lg text-[13px] transition-colors ${currentSessionId === item.id ? 'bg-[#18181b] text-white' : 'text-slate-400 hover:text-white hover:bg-[#18181b]/50'}`}>
                        <div className="flex items-center gap-3 truncate pr-2">
                            <MessageSquare size={14} className={currentSessionId === item.id ? 'text-blue-500 shrink-0' : 'text-slate-500 shrink-0'} />
                            <span className="truncate">{item.title}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(e, item.id); }} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-colors shrink-0"><Trash2 size={14}/></button>
                    </div>
                ))
            )}
          </div>
        </div>
        
        {/* User / Upgrade bottom */}
        <div className="p-4 mt-auto shrink-0">
            <div className="mt-4 flex items-center justify-between px-2 cursor-pointer group" onClick={handleLogout}>
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-slate-500 transition-colors"><User size={14} className="text-slate-300"/></div>
                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{t("sidebar.logout")}</span>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full relative bg-[#0f141e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#172033] via-[#0f141e] to-[#0a0f18] shadow-[-10px_0_40px_rgba(0,0,0,0.5)] z-10 overflow-hidden">
        
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-6 shrink-0 z-20">
          {!sidebarOpen ? (
            <button onClick={() => setSidebarOpen(true)} className="text-slate-500 hover:text-white transition-colors"><Sidebar size={18} /></button>
          ) : <div></div>}
          
          <div className="flex items-center gap-4">

             
             <button 
                onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
                className="w-9 h-9 rounded-full bg-slate-800 border border-slate-600 hover:border-slate-400 flex items-center justify-center text-[13px] font-bold tracking-widest text-slate-200 transition-all shadow-sm hover:scale-105 cursor-pointer"
                title="Change Language"
             >
                {language === 'en' ? 'US' : 'JA'}
             </button>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-10 pb-32 no-scrollbar scroll-smooth">
          <div className="max-w-3xl mx-auto flex flex-col gap-8 pt-8">
            {messages.length === 1 && !loading && (
               <div className="text-center mt-20 text-slate-500 text-sm">
                   How can I help you today?
               </div>
            )}
            {messages.map((msg, index) => (
                <div key={msg.id} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'user' ? (
                        <div className="bg-[#1e293b]/80 backdrop-blur-sm text-slate-200 text-[14px] leading-relaxed px-5 py-4 rounded-2xl rounded-tr-sm max-w-[80%] border border-white/5 shadow-md">
                            {msg.content}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 max-w-[85%] w-full">
                            <div className="text-slate-300 text-[15px] leading-relaxed prose prose-invert max-w-none 
                                          prose-p:leading-relaxed prose-pre:bg-[#1e293b]/50 prose-pre:border prose-pre:border-white/5 
                                          prose-blockquote:border-l-[3px] prose-blockquote:border-white/80 prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-white prose-blockquote:bg-white/5 prose-blockquote:py-1 prose-blockquote:rounded-r-sm">
                                <MarkdownWithCitations content={msg.content} citations={msg.citations} isTyping={msg.isTyping} />
                            </div>
                            {/* Action Row */}
                            <div className="flex items-center gap-3 text-slate-500 mt-1">
                                <button 
                                  onClick={() => handleFeedback(msg.id, 'up')} 
                                  className={`transition-colors ${feedback[msg.id] === 'up' ? 'text-blue-500' : 'hover:text-slate-300'}`}
                                  title={t("action.good")}
                                ><ThumbsUp size={14}/></button>
                                <button 
                                  onClick={() => handleFeedback(msg.id, 'down')} 
                                  className={`transition-colors ${feedback[msg.id] === 'down' ? 'text-red-500' : 'hover:text-slate-300'}`}
                                  title={t("action.bad")}
                                ><ThumbsDown size={14}/></button>
                                <button 
                                  onClick={() => handleCopy(msg.id, msg.content)} 
                                  className="hover:text-slate-300 transition-colors"
                                  title={t("action.copy")}
                                >
                                  {copiedMessageId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14}/>}
                                </button>
                                {index === messages.length - 1 && (
                                  <button 
                                    onClick={() => handleRetry(index)} 
                                    className="hover:text-slate-300 transition-colors"
                                    title={t("action.retry")}
                                  ><RotateCcw size={14}/></button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
            {loading && (
                <div className="w-full flex justify-start">
                    <div className="flex items-center gap-1.5 h-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            )}
            <div ref={endOfMessagesRef} className="h-4" />
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-8 left-0 w-full flex justify-center px-4 pointer-events-none z-20">
            <div className="w-full max-w-3xl bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center px-4 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-auto transition-all focus-within:bg-[#1e293b] focus-within:border-white/20">
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className={`p-2 transition-colors ${isUploading ? 'text-blue-500 animate-pulse' : 'text-slate-500 hover:text-slate-300'}`}><Paperclip size={18} /></button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt,.md" onChange={handleFileUpload} />
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("chat.placeholder")}
                    className="flex-1 bg-transparent text-slate-200 placeholder-slate-600 px-4 py-2 resize-none outline-none text-[15px] max-h-[150px]"
                    rows={1}
                />
                <button onClick={toggleListen} className={`p-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:text-slate-300'}`}><Mic size={18} /></button>
                <button onClick={handleSend} disabled={!input.trim() || loading} className="p-2 text-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:text-slate-600 transition-colors ml-1"><Send size={18} className="translate-x-[1px] translate-y-[1px]" /></button>
            </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR (PDF PANEL) */}
      <div 
        style={{ width: activeCitation ? pdfPanelWidth : 0, transition: isResizingPdf ? 'none' : 'width 0.3s ease-in-out' }}
        className={`${activeCitation ? 'border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]' : 'border-l-0'} 
          relative right-0 shrink-0 flex flex-col bg-[#09090b] h-full overflow-hidden z-40 max-w-full`}
      >
        {/* Resize Handler */}
        {activeCitation && (
           <div
             onMouseDown={startResizingPdfPanel}
             className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/50 z-50 transition-colors"
           />
        )}
        {activeCitation && (
            <>
                <div className="flex items-center justify-between px-5 h-16 border-b border-white/5 shrink-0 bg-[#09090b]">
                    <div className="flex items-center gap-3 text-slate-300 min-w-0">
                        <FileText size={16} className="text-blue-500 shrink-0" />
                        <span className="font-medium text-[13px] truncate">{activeCitation.name || 'Source Document'}</span>
                        {activeCitation.page_number && <span className="text-[10px] text-slate-400 bg-[#1e293b] px-2 py-0.5 rounded-full shrink-0 border border-white/5">{t('pdf.page')} {activeCitation.page_number}</span>}
                    </div>
                    <button onClick={() => setActiveCitation(null)} className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0"><X size={16}/></button>
                </div>
                {activeCitation.name?.toLowerCase().endsWith('.pdf') && activeCitation.page_number ? (
                    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0c]">
                        <iframe 
                            src={`/pdf-uploads/${encodeURIComponent(activeCitation.name)}#page=${activeCitation.page_number}`}
                            className="flex-1 w-full border-none"
                            title="PDF Viewer"
                        />
                        <div className="shrink-0 border-t border-white/5 bg-[#09090b] max-h-[250px] overflow-y-auto p-5 no-scrollbar">
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">{t('pdf.extractedContent')}</div>
                            <div className="text-[13px] text-slate-300 leading-relaxed border-l-[3px] border-white/20 pl-4 py-1">
                                {activeCitation.text_content}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0c] no-scrollbar">
                        {activeCitation.image_url && (
                            <img src={activeCitation.image_url} className="w-full rounded-lg mb-6 border border-white/5 shadow-lg" alt="Citation" />
                        )}
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">{t('pdf.extractedContent')}</div>
                        <div className="text-[14px] text-slate-300 leading-relaxed bg-[#1e293b]/30 p-5 rounded-2xl border border-white/5">
                            {activeCitation.text_content}
                        </div>
                    </div>
                )}
            </>
        )}
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-[400px] shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Settings</h2>
                    <button onClick={() => setSettingsOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Theme</label>
                        <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2 text-sm text-slate-300 outline-none">
                            <option value="dark">Dark Theme</option>
                            <option value="light">Light Theme (Experimental)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Voice Input</label>
                        <p className="text-xs text-slate-400">Ensure microphone permissions are enabled in your browser to use the speech-to-text functionality.</p>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
