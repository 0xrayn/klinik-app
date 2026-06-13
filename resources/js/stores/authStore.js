import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const useAuth = create(
    persist(
        (set, get) => ({
            user:            null,
            token:           null,
            isAuthenticated: false,
            loading:         false,

            login: async (credentials) => {
                set({ loading: true });
                try {
                    await axios.get('/sanctum/csrf-cookie');
                    const res = await axios.post('/api/auth/login', credentials);
                    const { user, token } = res.data.data;
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    set({ user, token, isAuthenticated: true, loading: false });
                    return user;
                } catch (e) {
                    set({ loading: false });
                    throw e;
                }
            },

            logout: async () => {
                try { await axios.post('/api/auth/logout'); } catch (_) {}
                delete axios.defaults.headers.common['Authorization'];
                set({ user: null, token: null, isAuthenticated: false });
            },

            init: async () => {
                const { token } = get();
                if (!token) return false;
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await axios.get('/api/auth/me');
                    set({ user: res.data.data, isAuthenticated: true });
                    return true;
                } catch (_) {
                    set({ user: null, token: null, isAuthenticated: false });
                    return false;
                }
            },

            hasRole:    (r)  => get().user?.roles?.some(x => x.name === r)  ?? false,
            hasAnyRole: (rs) => rs.some(r => get().user?.roles?.some(x => x.name === r)) ?? false,
            setUser: (user) => set({ user }),
        }),
        { name: 'ks-auth', partialize: s => ({ token: s.token, user: s.user }) }
    )
);

export default useAuth;
