'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Ban,
  ShieldAlert,
  SearchCode,
  Check,
  X,
  Loader,
  Flame,
  Award,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface Friend {
  _id: string;
  username: string;
  email: string;
  bestWpm: number;
  streak: number;
  level: string;
  isOnline: boolean;
  latestTest?: {
    wpm: number;
    accuracy: number;
    date: string;
  };
}

interface Request {
  _id: string;
  username: string;
  email: string;
  bestWpm: number;
  level: string;
}

export default function FriendsPage() {
  const { user, loading } = useAuth();
  const [friendsData, setFriendsData] = useState<{
    friends: Friend[];
    friendRequestsSent: Request[];
    friendRequestsReceived: Request[];
    blockedUsers: { _id: string; username: string; email: string }[];
  }>({
    friends: [],
    friendRequestsSent: [],
    friendRequestsReceived: [],
    blockedUsers: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'blocked'>('friends');

  const fetchSocial = () => {
    if (!user) return;
    setLoadingSocial(true);
    api.getFriends()
      .then((d: any) => {
        setFriendsData(d);
      })
      .catch(console.error)
      .finally(() => setLoadingSocial(false));
  };

  useEffect(() => {
    if (user) {
      fetchSocial();
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    api.searchUsers(searchQuery)
      .then((res: any) => {
        setSearchResults(res || []);
      })
      .catch(console.error)
      .finally(() => setSearching(false));
  };

  const sendRequest = async (targetId: string) => {
    try {
      await api.sendFriendRequest(targetId);
      // Refresh search and request lists
      fetchSocial();
      setSearchResults(prev => prev.map(u => u._id === targetId ? { ...u, requestSent: true } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRequest = async (targetId: string) => {
    try {
      await api.acceptFriendRequest(targetId);
      fetchSocial();
    } catch (err) {
      console.error(err);
    }
  };

  const declineRequest = async (targetId: string) => {
    try {
      await api.declineFriendRequest(targetId);
      fetchSocial();
    } catch (err) {
      console.error(err);
    }
  };

  const cancelRequest = async (targetId: string) => {
    try {
      await api.cancelFriendRequest(targetId);
      fetchSocial();
    } catch (err) {
      console.error(err);
    }
  };

  const removeFriend = async (targetId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    try {
      await api.removeFriend(targetId);
      fetchSocial();
    } catch (err) {
      console.error(err);
    }
  };

  const blockUser = async (targetId: string) => {
    if (!confirm('Are you sure you want to block this user?')) return;
    try {
      await api.blockUser(targetId);
      fetchSocial();
      setSearchResults(prev => prev.filter(u => u._id !== targetId));
    } catch (err) {
      console.error(err);
    }
  };

  const unblockUser = async (targetId: string) => {
    try {
      await api.unblockUser(targetId);
      fetchSocial();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || (user && loadingSocial)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
          <Loader size={18} className="animate-spin text-[var(--color-accent)]" />
          Loading Social Dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-muted)] flex items-center justify-center">
          <Users size={28} className="text-[var(--color-accent)]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">Sign in to connect with friends</h2>
          <p className="text-[var(--color-text-secondary)] text-sm">Add friends, view their speed records, and compete in multiplayer races.</p>
        </div>
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl text-[14px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  const pendingCount = friendsData.friendRequestsReceived.length;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center">
              <Users size={20} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">Social Hub</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">Manage friends, view stats, and invite racers</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/games/race"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-md shadow-[var(--color-accent)]/10"
            >
              Enter Multiplayer Arena
            </Link>
          </div>
        </div>

        {/* Layout: Left = Social lists, Right = Add Friends Search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Tabs & Friends / Requests / Blocked Lists */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="flex rounded-xl p-1 bg-[var(--color-surface)] border border-[var(--color-border)] w-full">
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'friends'
                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-extrabold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                Friends ({friendsData.friends.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative cursor-pointer ${
                  activeTab === 'requests'
                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-extrabold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                Requests
                {pendingCount > 0 && (
                  <span className="absolute top-1.5 right-4 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('blocked')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'blocked'
                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-extrabold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                Blocked ({friendsData.blockedUsers.length})
              </button>
            </div>

            <div className="glass-card p-6 min-h-[350px] flex flex-col">
              {/* Friends Tab */}
              {activeTab === 'friends' && (
                <div className="flex-1 flex flex-col">
                  {friendsData.friends.length > 0 ? (
                    <div className="space-y-3">
                      {friendsData.friends.map(friend => (
                        <div
                          key={friend._id}
                          className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {/* Online Indicator */}
                            <div className="relative">
                              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-[var(--color-border)] flex items-center justify-center font-bold text-xs uppercase text-[var(--color-text-secondary)]">
                                {friend.username.charAt(0)}
                              </div>
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--color-surface)] ${
                                  friend.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                                }`}
                                title={friend.isOnline ? 'Online' : 'Offline'}
                              />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-[var(--color-text)]">{friend.username}</span>
                                {friend.streak > 0 && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-[var(--color-warning)] font-semibold">
                                    <Flame size={10} />
                                    {friend.streak}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                                Best: <span className="font-bold text-[var(--color-accent)]">{friend.bestWpm} WPM</span>
                                {friend.latestTest && (
                                  <>
                                    <span className="mx-1.5">•</span>
                                    Recent: <span className="font-bold">{friend.latestTest.wpm} WPM</span> ({friend.latestTest.accuracy}% acc)
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => blockUser(friend._id)}
                              className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-rose-400 hover:border-rose-400/20 transition-colors cursor-pointer"
                              title="Block User"
                            >
                              <Ban size={12} />
                            </button>
                            <button
                              onClick={() => removeFriend(friend._id)}
                              className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-rose-400 hover:border-rose-400/20 transition-colors cursor-pointer"
                              title="Unfriend"
                            >
                              <UserX size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                      <Users size={32} className="text-[var(--color-text-secondary)] opacity-20 mb-3" />
                      <p className="text-xs text-[var(--color-text-secondary)]">No friends added yet.</p>
                      <p className="text-[10px] text-[var(--color-text-secondary)] mt-1 opacity-70">Search and add users on the right to start connecting!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div className="flex-1 flex flex-col gap-6">
                  {/* Received requests */}
                  <div>
                    <h3 className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)] mb-3">
                      Received Requests ({friendsData.friendRequestsReceived.length})
                    </h3>
                    {friendsData.friendRequestsReceived.length > 0 ? (
                      <div className="space-y-2">
                        {friendsData.friendRequestsReceived.map(req => (
                          <div
                            key={req._id}
                            className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center font-bold text-xs uppercase">
                                {req.username.charAt(0)}
                              </div>
                              <div>
                                <div className="text-xs font-bold">{req.username}</div>
                                <div className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">Best: {req.bestWpm} WPM</div>
                              </div>
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => acceptRequest(req._id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Check size={10} />
                                Accept
                              </button>
                              <button
                                onClick={() => declineRequest(req._id)}
                                className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-xs hover:bg-white/[0.04] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <X size={10} />
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[var(--color-text-secondary)] italic opacity-60">No pending received requests.</p>
                    )}
                  </div>

                  {/* Sent requests */}
                  <div>
                    <h3 className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)] mb-3">
                      Sent Requests ({friendsData.friendRequestsSent.length})
                    </h3>
                    {friendsData.friendRequestsSent.length > 0 ? (
                      <div className="space-y-2">
                        {friendsData.friendRequestsSent.map(req => (
                          <div
                            key={req._id}
                            className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center font-bold text-xs uppercase">
                                {req.username.charAt(0)}
                              </div>
                              <div>
                                <div className="text-xs font-bold">{req.username}</div>
                                <div className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">Best: {req.bestWpm} WPM</div>
                              </div>
                            </div>

                            <button
                              onClick={() => cancelRequest(req._id)}
                              className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <X size={10} />
                              Cancel
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[var(--color-text-secondary)] italic opacity-60">No pending sent requests.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Blocked Tab */}
              {activeTab === 'blocked' && (
                <div className="flex-1 flex flex-col">
                  {friendsData.blockedUsers.length > 0 ? (
                    <div className="space-y-2">
                      {friendsData.blockedUsers.map(b => (
                        <div
                          key={b._id}
                          className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                        >
                          <div className="flex items-center gap-3">
                            <ShieldAlert size={14} className="text-rose-400" />
                            <div>
                              <div className="text-xs font-bold text-[var(--color-text)]">{b.username}</div>
                              <div className="text-[9px] text-[var(--color-text-secondary)]">{b.email}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => unblockUser(b._id)}
                            className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-xs hover:bg-white/[0.04] text-[10px] font-semibold cursor-pointer"
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                      <Ban size={32} className="text-[var(--color-text-secondary)] opacity-20 mb-3" />
                      <p className="text-xs text-[var(--color-text-secondary)]">No blocked users.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Search Users */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-[var(--color-text-secondary)] border-b border-[var(--color-border)] pb-2 mb-4">
                  Find Players
                </h3>

                <form onSubmit={handleSearch} className="flex gap-2 mb-5">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Username or email..."
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--color-text)]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-xs text-[var(--color-text)] hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {/* Search Results */}
                <div className="max-h-[300px] overflow-y-auto flex flex-col gap-2 pr-1">
                  {searching ? (
                    <div className="flex items-center justify-center py-6 text-xs text-[var(--color-text-secondary)] gap-2">
                      <Loader size={12} className="animate-spin" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(resUser => {
                      const isFriend = friendsData.friends.some(f => f._id === resUser._id);
                      const isPendingSent = friendsData.friendRequestsSent.some(r => r._id === resUser._id) || resUser.requestSent;
                      const isPendingReceived = friendsData.friendRequestsReceived.some(r => r._id === resUser._id);

                      return (
                        <div
                          key={resUser._id}
                          className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                        >
                          <div className="flex flex-col min-w-0 mr-2">
                            <span className="text-xs font-bold truncate">{resUser.username}</span>
                            <span className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">
                              Best: {resUser.bestWpm} WPM • {resUser.level || 'Intermediate'}
                            </span>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            {isFriend ? (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                                <UserCheck size={10} />
                                Friends
                              </span>
                            ) : isPendingSent ? (
                              <span className="text-[9px] font-bold text-[var(--color-warning)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                                <Clock size={10} />
                                Sent
                              </span>
                            ) : isPendingReceived ? (
                              <button
                                onClick={() => acceptRequest(resUser._id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Check size={10} />
                                Accept
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => sendRequest(resUser._id)}
                                  className="p-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
                                  title="Add Friend"
                                >
                                  <UserPlus size={12} />
                                </button>
                                <button
                                  onClick={() => blockUser(resUser._id)}
                                  className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-rose-400 hover:border-rose-500/20 transition-colors cursor-pointer"
                                  title="Block"
                                >
                                  <Ban size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : searchQuery ? (
                    <div className="py-6 text-center text-xs text-[var(--color-text-secondary)] opacity-60">
                      No users found.
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-[var(--color-text-secondary)] opacity-60 flex flex-col items-center gap-2">
                      <SearchCode size={20} className="opacity-30" />
                      Search by username or email to add friends!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
