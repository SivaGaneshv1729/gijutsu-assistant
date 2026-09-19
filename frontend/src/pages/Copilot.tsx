import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, ChevronDown, ChevronUp, ShieldAlert, Plus, MessageSquare, Menu, RotateCcw, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
  confidence?: string;
  isError?: boolean;
  query?: string; // store original query for retry
}

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: 'Hello. I am the SHIBAURA Engineering Copilot. How can I assist you with maintenance, diagnostics, or operational queries today?',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
        citations: payload.citations
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error processing your request. Please try again.",
        isError: true,
        query: query,
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
    setMessages(prev => [...prev, userMsg]);
    setInput('');

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
      content: 'Hello. I am the SHIBAURA Engineering Copilot. How can I assist you today?',
    }]);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 overflow-hidden font-sans w-full">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden hidden md:flex`}>
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 pt-0">
          <div className="text-xs font-semibold text-gray-500 mb-2 px-2 mt-4">Today</div>
          <button className="flex items-center gap-2 w-full p-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-sm text-left truncate transition-colors">
            <MessageSquare size={16} className="shrink-0" />
            <span className="truncate">V70 Controller Diagnostics</span>
          </button>
          <button className="flex items-center gap-2 w-full p-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-sm text-left truncate transition-colors text-gray-500">
            <MessageSquare size={16} className="shrink-0" />
            <span className="truncate">Hydraulic Pump Maintenance</span>
          </button>
        </div>

        {/* Logout button */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center p-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 md:hidden mr-2"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 tracking-tight">
            SHIBAURA Copilot <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-bold tracking-wider">Enterprise</span>
          </h1>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto relative z-0">
          <div className="flex flex-col pb-32">
            {messages.length === 1 && !loading && (
              <div className="flex flex-col items-center justify-center mt-32 mb-10 px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                  <Bot size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 tracking-tight">How can I help you today?</h2>
                <p className="text-gray-500 text-center max-w-md text-sm leading-relaxed">I'm connected to the Shibaura engineering knowledge base. Ask me about maintenance procedures, safety protocols, or machine specifications.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`w-full ${msg.role === 'assistant' ? 'bg-gray-50/50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800' : ''}`}>
                <div className="max-w-3xl mx-auto flex gap-4 md:gap-6 px-4 py-6 md:py-8">

                  {/* Avatar */}
                  <div className="shrink-0 flex flex-col items-center">
                    {msg.role === 'assistant' ? (
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${msg.isError ? 'bg-red-500' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}>
                        <Bot size={18} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center shadow-sm">
                        <User size={18} className="text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-4 pt-1">
                    <div className="text-gray-800 dark:text-gray-200 font-normal md:text-[15px] prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600">
                      {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <MarkdownWithCitations content={msg.content} citations={msg.citations} />
                      )}
                    </div>

                    {/* Error Retry Button */}
                    {msg.isError && msg.query && (
                      <button
                        onClick={() => handleRetry(msg.query!, msg.id)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw size={14} />
                        Retry
                      </button>
                    )}

                    {/* Citations Footer */}
                    {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-8 pt-4">
                        <CitationBlock citations={msg.citations} confidence={msg.confidence} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="w-full bg-gray-50/50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
                <div className="max-w-3xl mx-auto flex gap-4 md:gap-6 px-4 py-6 md:py-8">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm">
                      <Bot size={18} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 flex items-center h-8 gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={endOfMessagesRef} className="h-4" />
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-950 dark:via-gray-950/80 pt-10 pb-6 px-4 z-10 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="relative flex items-end shadow-2xl shadow-black/5 dark:shadow-black/40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-visible focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Shibaura engineering manuals..."
                className="w-full max-h-[200px] bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 p-4 pr-12 resize-none outline-none text-[15px] leading-relaxed"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-3 bottom-3 p-1.5 rounded-xl bg-blue-600 text-white disabled:opacity-0 disabled:scale-75 hover:bg-blue-500 transition-all duration-200"
              >
                <Send size={18} className="translate-x-0.5 -translate-y-0.5" />
              </button>
            </div>
            <div className="mt-2 text-center flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
              <ShieldAlert size={12} />
              AI can make mistakes. Always verify procedures with official documentation.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// NotebookLM Style Markdown & Citations
// ----------------------------------------------------------------------

function MarkdownWithCitations({ content, citations }: { content: string, citations?: any[] }) {
  // Pre-process markdown to convert [1], 【1】, or [1, 2] into custom markdown links: [[1]](#cite-1)
  const processedContent = content.replace(/(?:\[|【)(\d+(?:,\s*\d+)*)(?:\]|】)/g, '[$1](#cite-$1)');

  return (
    <ReactMarkdown
      components={{
        a: ({ node, ...props }) => {
          if (props.href?.startsWith('#cite-')) {
            const indicesStr = props.href.replace('#cite-', '');
            const indices = indicesStr.split(',').map(s => parseInt(s.trim(), 10));
            
            return (
              <span className="inline-flex gap-0.5 mx-1 translate-y-[-2px]">
                {indices.map(idx => (
                  <CitationBadge key={idx} index={idx} citations={citations} />
                ))}
              </span>
            );
          }
          return <a {...props} className="text-blue-500 hover:underline font-medium" />;
        }
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}

function CitationBadge({ index, citations }: { index: number, citations?: any[] }) {
  const citation = citations?.[index - 1]; // 1-indexed to 0-indexed
  
  if (!citation) return <sup className="text-gray-400 font-medium">[{index}]</sup>;
  
  return (
    <span className="group relative inline-block cursor-default">
      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 text-[10px] font-bold shadow-sm transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 dark:group-hover:bg-blue-500 dark:group-hover:text-white">
        {index}
      </span>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] pointer-events-none">
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl shadow-2xl p-4 text-xs text-left border border-gray-200 dark:border-gray-700 ring-1 ring-black/5">
          <div className="font-bold text-blue-600 dark:text-blue-400 mb-1.5 line-clamp-1 text-[11px] uppercase tracking-wider">
            {citation.name || citation.section || 'Source Document'}
          </div>
          <div className="text-gray-600 dark:text-gray-300 line-clamp-4 leading-relaxed font-serif italic">
            "{citation.text_content}"
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 rotate-45 border-r border-b border-gray-200 dark:border-gray-700"></div>
        </div>
      </div>
    </span>
  );
}

function CitationBlock({ citations, confidence }: { citations: any[], confidence?: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-transparent rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden w-full max-w-2xl">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText size={14} />
          <span>{citations.length} sources referenced</span>
          {confidence && (
            <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-bold ml-2 ${
              confidence === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {confidence} Confidence
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4 bg-gray-50/50 dark:bg-gray-900/30 max-h-80 overflow-y-auto">
          {citations.map((c, i) => (
            <div key={i} className="text-[13px] flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-gray-300 dark:border-gray-700">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-gray-800 dark:text-gray-200 font-semibold leading-tight mb-1">
                  {c.name || c.section || 'Unknown Source'}
                </p>
                {c.text_content && (
                  <p className="text-gray-500 dark:text-gray-400 text-[12px] line-clamp-2 leading-relaxed">
                    "{c.text_content.substring(0, 200)}{c.text_content.length > 200 ? '...' : ''}"
                  </p>
                )}
                {c.access_level && (
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 mt-2">
                    {c.access_level}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
