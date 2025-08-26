import {createContext, useContext, useEffect, useState} from 'react';
import {api} from '../lib/api';

const AuthCtx = createContext(null);

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);
    const [savedVersion, setSavedVersion] = useState(0);

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

    useEffect(() => {
        bootstrap();
    }, []);

    async function login({username, password, code}) {
        await api('/auth/login', {method: 'POST', body: {username, password, code}});
        await bootstrap();
    }

    async function logout() {
        await api('/auth/logout', {method: 'POST'});
        setUser(null);
    }

    function updateSaved(outfitId, saved) {
        setUser(prev => {
            if (!prev) return prev;
            const set = new Set(prev.savedOutfitIds || []);
            if (saved) set.add(outfitId); else set.delete(outfitId);
            return {...prev, savedOutfitIds: Array.from(set)};
        });
        setSavedVersion(v => v + 1);
    }

    async function updateProfile({username, profilePictureUrl}) {
        const res = await api('/users/me', {method: 'PATCH', body: {username, profilePictureUrl}});
        setUser(prev => prev ? {...prev, ...res} : res);
        return res;
    }

    return <AuthCtx.Provider
        value={{user, ready, login, logout, updateSaved, savedVersion, updateProfile}}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
