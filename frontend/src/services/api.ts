import type { DocumentSummary, QueryResponse } from '../types';

const API_BASE = '';

function getToken(): string {
  return localStorage.getItem('token') || '';
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string })?.error || `Request failed (${res.status})`;
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

export async function getCurrentUser(): Promise<{ username: string; role: string }> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse<{ username: string; role: string }>(res);
}

export async function queryRag(query: string): Promise<{ data?: QueryResponse }> {
  const res = await fetch(`${API_BASE}/api/rag/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ query }),
  });
  return handleResponse<{ data?: QueryResponse }>(res);
}

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