const TOKEN_KEY = 'vendr-token';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  const cleanToken = token ? String(token).replace(/^\"|\"$/g, '').trim() : null;
  if (cleanToken) headers.Authorization = 'Bearer ' + cleanToken;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  try { data = await res.json(); } catch { data = null; }

  if (!res.ok) {
    if (res.status === 401) throw new Error(data?.error || 'Unauthorized (401)');
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  get:   <T>(path: string)               => request<T>('GET',   path),
  post:  <T>(path: string, body: unknown) => request<T>('POST',  path, body),
  put:   <T>(path: string, body: unknown) => request<T>('PUT',   path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
};
