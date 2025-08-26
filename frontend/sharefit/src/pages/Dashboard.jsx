import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import UserAvatar from "../components/UserAvatar";
import OutfitCard from "../components/OutfitCard";
import EmptyState from "../components/EmptyState";
import {useAuth} from "../context/AuthContext";
import {api} from "../lib/api";
import {adaptOutfit} from "../lib/adapters.js";

export default function Dashboard() {
    const {user, savedVersion, updateProfile} = useAuth();
    const [posted, setPosted] = useState(null); // null = loading
    const [saved, setSaved] = useState(null);
    const [err, setErr] = useState("");
    const [saving, setSaving] = useState(false);
    const [uname, setUname] = useState(user?.username || "");
    const [pic, setPic] = useState(user?.profilePictureUrl || "");
    useEffect(() => {
        setUname(user?.username || "");
        setPic(user?.profilePictureUrl || "");
    }, [user]);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const mine = await api("/outfits/mine/list");
                if (!ignore) {
                    const list = (mine.outfits ?? []).map(adaptOutfit);
                    const ids = list.map(o => o.id);
                    let votes = {};
                    if (ids.length) {
                        const res = await api('/outfits/votes', {method: 'POST', body: {ids}});
                        votes = res.votes || {};
                    }
                    setPosted(list.map(o => ({...o, userVote: votes[o.id] ?? 0})));
                }
            } catch (e) {
                if (!ignore) {
                    setErr(e?.message || "Failed to load dashboard");
                    setPosted([])
                }
            }
        })();
        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const savedRes = await api("/users/me/saved");
                if (!ignore) {
                    const list = (savedRes.outfits ?? []).map(adaptOutfit);
                    const ids = list.map(o => o.id);
                    let votes = {};
                    if (ids.length) {
                        const res = await api('/outfits/votes', {method: 'POST', body: {ids}});
                        votes = res.votes || {};
                    }
                    setSaved(list.map(o => ({...o, userVote: votes[o.id] ?? 0})));
                }
            } catch (e) {
                if (!ignore) {
                    setErr(e?.message || "Failed to load saved outfits");
                    setSaved([]);
                }
            }
        })();
        return () => {
            ignore = true;
        };
    }, [savedVersion]);

    async function onSaveProfile(e) {
        e.preventDefault();
        setSaving(true);
        setErr("");
        try {
            await updateProfile({username: uname.trim(), profilePictureUrl: pic.trim()});
            // refresh both lists to get new name/avatar denormalized
            const [mine, savedRes] = await Promise.all([
                api("/outfits/mine/list"),
                api("/users/me/saved")
            ]);
            setPosted((mine.outfits ?? []).map(adaptOutfit));
            setSaved((savedRes.outfits ?? []).map(adaptOutfit));
        } catch (e2) {
            setErr(e2?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    }

    if (!user) return null; // guarded by PrivateRoute; could return a spinner

    return (
        <div className="row">
            <div className="panel" style={{width: "100%"}}>
                <div style={{display: "flex", alignItems: "center", gap: 12}}>
                    <UserAvatar size={56} src={user.profilePictureUrl || ""}/>
                    <div>
                        <div className="section-title">Welcome back</div>
                        <div style={{color: "var(--muted)"}}>@{user.username}</div>
                    </div>
                </div>
                {err && <div className="error" style={{marginTop: 8}}>{err}</div>}
                <form onSubmit={onSaveProfile} style={{marginTop: 12, display: "grid", gap: 8, maxWidth: 520}}>
                    <div className="section-title">Account</div>
                    <label className="label">Username</label>
                    <input className="input" value={uname} onChange={e => setUname(e.target.value)}/>
                    <label className="label">Profile picture URL</label>
                    <input className="input" value={pic} onChange={e => setPic(e.target.value)}
                           placeholder="https://..."/>
                    <div className="row" style={{alignItems: "center", gap: 10}}>
                        <UserAvatar size={40} src={pic}/>
                        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
                    </div>
                </form>
            </div>

            <section style={{flex: 1, minWidth: 320}}>
                <div className="toolbar">
                    <div className="section-title">Your posted outfits</div>
                    <Link className="btn" to="/create" title="Create new outfit">＋</Link>
                </div>
                {posted === null ? (
                    <div className="muted">Loading…</div>
                ) : posted.length ? (
                    <div className="grid">{posted.map(o => <OutfitCard key={o.id} outfit={o}/>)}</div>
                ) : (
                    <EmptyState title="No outfits yet."
                                action={<Link className="btn" to="/create">Create your first outfit</Link>}/>
                )}
            </section>

            <section style={{flex: 1, minWidth: 320}}>
                <div className="toolbar">
                    <div className="section-title">Saved outfits</div>
                    <Link className="btn secondary" to="/search" title="Browse all">🔎</Link>
                </div>
                {saved === null ? (
                    <div className="muted">Loading…</div>
                ) : saved.length ? (
                    <div className="grid">{saved.map(o => <OutfitCard key={o.id} outfit={o}/>)}</div>
                ) : (
                    <EmptyState title="Nothing saved yet."
                                action={<Link className="btn secondary" to="/search">Find outfits</Link>}/>
                )}
            </section>
        </div>
    );
}
