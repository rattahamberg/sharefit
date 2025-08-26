import { Link } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";
import OutfitCard from "../components/OutfitCard";
import EmptyState from "../components/EmptyState";

export default function Dashboard() {
    // UI placeholders; replace with your data once authed
    const user = { username: "you", avatar: "" }; // TODO: GET /me
    const posted = [];   // TODO: GET /outfits?poster=me
    const saved = [];    // TODO: GET /users/me/saved

    return (
        <div className="row">
            <div className="panel" style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <UserAvatar size={56} src={user.avatar} />
                    <div>
                        <div className="section-title">Welcome back</div>
                        <div style={{ color: "var(--muted)" }}>@{user.username}</div>
                    </div>
                </div>
            </div>

            <section style={{ flex: 1, minWidth: 320 }}>
                <div className="toolbar">
                    <div className="section-title">Your posted outfits</div>
                    <Link className="btn" to="/create" title="Create new outfit">＋</Link>
                </div>
                {posted.length ? (
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
                {saved.length ? (
                    <div className="grid">{saved.map(o => <OutfitCard key={o.id} outfit={o} />)}</div>
                ) : (
                    <EmptyState title="Nothing saved yet." action={<Link className="btn secondary" to="/search">Find outfits</Link>} />
                )}
            </section>
        </div>
    );
}
