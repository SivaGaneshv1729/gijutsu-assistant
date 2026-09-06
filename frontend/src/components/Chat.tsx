import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, FileText } from 'lucide-react';
import { queryRag } from '../services/api';
import type { Citation } from '../types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: 'Hello! I am the **MEI Assistant**. I have access to our technical manuals, SOPs, and machine alarm guides. Ask me anything about machinery, alarm codes, or standard procedures.',
};

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div key={message.content} className="flex gap-4 flex-row-reverse">
        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-indigo-600 text-white shadow-sm">
          <User className="h-5 w-5" />
        </div>
        <div className="px-5 py-4 rounded-2xl max-w-[85%] whitespace-pre-wrap bg-indigo-600 text-white rounded-tr-none shadow-md">
          <p className="leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div key={message.content} className="flex gap-4 flex-row">
      <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-white text-indigo-600 border border-slate-200 shadow-sm">
        <Bot className="h-6 w-6" />
      </div>
      <div className="px-5 py-4 rounded-2xl max-w-[85%] bg-white text-slate-800 rounded-tl-none shadow-sm border border-slate-200 space-y-3">
        <div className="prose prose-sm prose-slate max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="border-t border-slate-200 pt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Sources</p>
            <div className="space-y-2">
              {message.citations.map((c, idx) => (
                <details key={c.id} className="group">
                  <summary className="cursor-pointer flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    <FileText className="h-3.5 w-3.5" />
                    {c.name} <span className="text-slate-400">({idx + 1})</span>
                  </summary>
                  <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">
                    {c.text_content.slice(0, 400)}
                    {c.text_content.length > 400 ? '…' : ''}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const { data } = await queryRag(userMessage.content);
      const answer = data?.answer || 'No response received from the intelligence engine.';
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: answer, citations: data?.citations || [] },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'An error occurred while querying the intelligence engine. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth bg-slate-50">
        <div className="max-w-3xl mx-auto space-y-6 pb-24">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
          {loading && (
            <div className="flex gap-4 flex-row">
              <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-white text-indigo-600 border border-slate-200 shadow-sm">
                <Bot className="h-6 w-6" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white rounded-tl-none shadow-sm border border-slate-200 flex items-center gap-2">
                <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-6 pb-6 px-4 md:px-8">
        <form onSubmit={handleQuery} className="max-w-3xl mx-auto relative group">
          <textarea
            rows={1}
            className="w-full bg-white border border-slate-300 rounded-full pl-6 pr-16 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all group-hover:shadow-md text-slate-800 resize-none"
            placeholder="Ask about machinery, alarm codes, or SOPs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuery(e);
              }
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5 ml-1" />
          </button>
        </form>
        <div className="text-center mt-3 text-xs text-slate-400 font-medium">
          MEI Platform connects directly to internal vector databases via Hybrid Retrieval Augmented Generation.
        </div>
      </div>
    </div>
  );
}