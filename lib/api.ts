const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  signup: (body: object) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: object) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/api/auth/me'),
  saveStats: (body: object) => request('/api/stats/save', { method: 'POST', body: JSON.stringify(body) }),
  getStats: () => request('/api/stats'),
  getLeaderboard: () => request('/api/leaderboard'),
  saveTheme: (body: object) => request('/api/theme', { method: 'POST', body: JSON.stringify(body) }),
  getTheme: () => request('/api/theme'),
  setLevel: (body: object) => request('/api/level', { method: 'POST', body: JSON.stringify(body) }),
  getLevel: () => request('/api/level'),
};
