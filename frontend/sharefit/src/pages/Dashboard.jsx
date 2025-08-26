import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";
import OutfitCard from "../components/OutfitCard";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { adaptOutfit } from "../lib/adapters.js";

export default function Dashboard() {
    const { user } = useAuth(); // { username, profilePictureUrl, ... }
    const [posted, setPosted] = useState(null); // null = loading
    const [saved, setSaved] = useState(null);
    const [err, setErr] = useState("");

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const mine = await api("/outfits/mine/list");
                const savedRes = await api("/users/me/saved");
                if (!ignore) {
                    setPosted((mine.outfits ?? []).map(adaptOutfit));
                    setSaved((savedRes.outfits ?? []).map(adaptOutfit));
                }
            } catch (e) {
                if (!ignore) {
                    setErr(e?.message || "Failed to load dashboard");
                    setPosted([]);
                    setSaved([]);
                }
            }
        })();
        return () => { ignore = true; };
    }, []);

    if (!user) return null; // guarded by PrivateRoute; could return a spinner

    return (
        <div className="row">
            <div className="panel" style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <UserAvatar size={56} src={user.profilePictureUrl || ""} />
                    <div>
                        <div className="section-title">Welcome back</div>
                        <div style={{ color: "var(--muted)" }}>@{user.username}</div>
                    </div>
                </div>
                {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
            </div>

            <section style={{ flex: 1, minWidth: 320 }}>
                <div className="toolbar">
                    <div className="section-title">Your posted outfits</div>
                    <Link className="btn" to="/create" title="Create new outfit">＋</Link>
                </div>
                {posted === null ? (
                    <div className="muted">Loading…</div>
                ) : posted.length ? (
                    <div className="grid">{posted.map(o => <OutfitCard key={o.id} outfit={o} />)}</div>
                ) : (
                    <EmptyState title="No outfits yet." action={<Link className="btn" to="/create">Create your first outfit</Link>} />
                )}
            </section>

            <section style={{ flex: 1, minWidth: 320 }}>
                <div className="toolbar">
                    <div className="section-title">Saved outfits</div>
                    <Link className="btn secondary" to="/search" title="Browse all">🔎</Link>
                </div>
                {saved === null ? (
                    <div className="muted">Loading…</div>
                ) : saved.length ? (
                    <div className="grid">{saved.map(o => <OutfitCard key={o.id} outfit={o} />)}</div>
                ) : (
                    <EmptyState title="Nothing saved yet." action={<Link className="btn secondary" to="/search">Find outfits</Link>} />
                )}
            </section>
        </div>
    );
}
