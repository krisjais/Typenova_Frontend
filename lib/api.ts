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
  getLeaderboard: (params?: { category?: string; timeFilter?: string; friendsOnly?: boolean }) => {
    let url = '/api/leaderboard';
    if (params) {
      const q = new URLSearchParams();
      if (params.category) q.set('category', params.category);
      if (params.timeFilter) q.set('timeFilter', params.timeFilter);
      if (params.friendsOnly) q.set('friendsOnly', String(params.friendsOnly));
      const qs = q.toString();
      if (qs) url += `?${qs}`;
    }
    return request(url);
  },
  saveTheme: (body: object) => request('/api/theme', { method: 'POST', body: JSON.stringify(body) }),
  getTheme: () => request('/api/theme'),
  setLevel: (body: object) => request('/api/level', { method: 'POST', body: JSON.stringify(body) }),
  getLevel: () => request('/api/level'),
  getCustomTexts: () => request('/api/custom-texts'),
  createCustomText: (body: object) => request('/api/custom-texts', { method: 'POST', body: JSON.stringify(body) }),
  deleteCustomText: (id: string) => request(`/api/custom-texts/${id}`, { method: 'DELETE' }),
  saveLanguage: (body: object) => request('/api/language', { method: 'POST', body: JSON.stringify(body) }),
  getLanguage: () => request('/api/language'),
  getFriends: () => request('/api/friends'),
  searchUsers: (query: string) => request(`/api/friends/search?query=${encodeURIComponent(query)}`),
  sendFriendRequest: (targetId: string) => request('/api/friends/request', { method: 'POST', body: JSON.stringify({ targetId }) }),
  acceptFriendRequest: (targetId: string) => request('/api/friends/accept', { method: 'POST', body: JSON.stringify({ targetId }) }),
  declineFriendRequest: (targetId: string) => request('/api/friends/decline', { method: 'POST', body: JSON.stringify({ targetId }) }),
  cancelFriendRequest: (targetId: string) => request('/api/friends/cancel', { method: 'POST', body: JSON.stringify({ targetId }) }),
  removeFriend: (targetId: string) => request('/api/friends/remove', { method: 'POST', body: JSON.stringify({ targetId }) }),
  blockUser: (targetId: string) => request('/api/friends/block', { method: 'POST', body: JSON.stringify({ targetId }) }),
  unblockUser: (targetId: string) => request('/api/friends/unblock', { method: 'POST', body: JSON.stringify({ targetId }) }),
  getActivityFeed: () => request('/api/activity/feed'),
  getSharedResult: (id: string) => request(`/api/share/result/${id}`),
};
