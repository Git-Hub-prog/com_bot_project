import { useMemo, useState } from 'react';
import { authApi } from '../services/authApi';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const value = useMemo(() => ({
    user,
    loading,
    setUser,
    isAuthenticated: Boolean(user),
    login: async (credentials) => { setLoading(true); try { const data = await authApi.login(credentials); setUser(data.user); return data; } finally { setLoading(false); } },
    refreshUser: async () => { setLoading(true); try { const data = await authApi.me(); setUser(data.user); return data.user; } finally { setLoading(false); } },
    logout: async () => { setLoading(true); try { await authApi.logout(); setUser(null); } finally { setLoading(false); } },
  }), [loading, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
