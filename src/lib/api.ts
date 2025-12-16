const BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAuth(token: string, user?: unknown) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser<T = unknown>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  try { return raw ? JSON.parse(raw) as T : null; } catch (_e) { return null; }
}

const API_URL = (() => {
  try { return new URL(BASE_URL, window.location.origin); } catch { return new URL('/', window.location.origin); }
})();
const API_ORIGIN = API_URL.origin;

export function toApiURL(p?: string): string {
  if (!p) return '';
  // Allow only http/https absolute URLs; disallow data: to avoid XSS vectors
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith('/') ? p : `/${p}`;
  return `${API_ORIGIN}${path}`;
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export const api = {
  get: <T = unknown>(path: string) => request(path) as Promise<T>,
  post: <T = unknown>(path: string, body?: unknown) =>
    request(path, { method: 'POST', body: JSON.stringify(body || {}) }) as Promise<T>,
  put: <T = unknown>(path: string, body?: unknown) =>
    request(path, { method: 'PUT', body: JSON.stringify(body || {}) }) as Promise<T>,
  delete: <T = unknown>(path: string) =>
    request(path, { method: 'DELETE' }) as Promise<T>,
};
