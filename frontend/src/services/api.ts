import type { DocumentSummary, ChatSession, ChatMessage } from '../types';

const API_BASE = '';

function getToken(): string {
  return localStorage.getItem('token') || '';
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(message);
  }
  return data as T;
}

export async function login(username: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<{ token: string }>(res);
}

export async function register(username: string, email: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse<{ token: string }>(res);
}

export async function getCurrentUser(): Promise<{ username: string; role: string }> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse<{ username: string; role: string }>(res);
}

// ----------------------------------------------------
// Knowledge Base
// ----------------------------------------------------
export async function listDocuments(): Promise<DocumentSummary[]> {
  const res = await fetch(`${API_BASE}/api/knowledge/documents`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse<DocumentSummary[]>(res);
}

export async function deleteDocument(id: string): Promise<{ deleted: boolean }> {
  const res = await fetch(`${API_BASE}/api/knowledge/documents/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse<{ deleted: boolean }>(res);
}


// ----------------------------------------------------
// Chat & RAG
// ----------------------------------------------------

export async function createSession(title?: string): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/api/chat/sessions`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}` 
    },
    body: JSON.stringify(title ? { title } : {}),
  });
  return handleResponse<ChatSession>(res);
}

export async function listSessions(): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE}/api/chat/sessions`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse<ChatSession[]>(res);
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/chat/sessions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse<void>(res);
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/messages`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse<ChatMessage[]>(res);
}

export async function sendChatMessage(sessionId: string, query: string): Promise<ChatMessage> {
  const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ query }),
  });
  return handleResponse<ChatMessage>(res);
}