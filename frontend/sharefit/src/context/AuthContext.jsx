import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    function updateSaved(outfitId, saved) {
        setUser(prev => {
            if(!prev) return prev;
            const set = new Set(prev.savedOutfitIds || []);
            if (saved) set.add(outfitId); else set.delete(outfitId);
            return { ...prev, savedOutfitIds: Array.from(set) };
        });
    }

    async function bootstrap() {
        try {
            const me = await api('/users/me');
            setUser(me);
        } catch {
            setUser(null);
        } finally {
            setReady(true);
        }
    }

    useEffect(() => { bootstrap(); }, []);

    async function login({ username, password, code }) {
        await api('/auth/login', { method: 'POST', body: { username, password, code } });
        await bootstrap();
    }

    async function logout() {
        await api('/auth/logout', { method: 'POST' });
        setUser(null);
    }

    return (
        <AuthCtx.Provider value={{ user, ready, login, logout, updateSaved }}>
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
