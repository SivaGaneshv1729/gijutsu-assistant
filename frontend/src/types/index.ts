export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Citation {
  id: string;
  text_content: string;
  name: string;
  access_level: string;
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