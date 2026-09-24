export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidence?: string;
  isError?: boolean;
  query?: string;
  isTyping?: boolean;
}

export interface Citation {
  id: string;
  text_content: string;
  name?: string;
  access_level?: string;
  rrf_score?: number;
  image_url?: string;
  page_number?: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  date: 'today' | 'yesterday' | 'older';
  isActive?: boolean;
}

export interface QueryResponse {
  answer: string;
  citations: Citation[];
}

export interface DocumentSummary {
  id: string;
  name: string;
  type: string;
  accessLevel: string;
  createdAt: string | null;
  chunkCount: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  citationsJson?: string;
}