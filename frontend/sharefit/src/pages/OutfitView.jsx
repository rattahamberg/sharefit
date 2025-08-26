import { useParams } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";

export default function OutfitView() {
    const { id } = useParams();
    // TODO: GET /outfits/:id with items, images, rating, comments
    const outfit = {
        id, title: "Outfit Title", posterName: "alice", posterAvatar: "",
        rating: 0, items: [{ name: "Black Jeans", link: "#" }, { name: "White Tee", link: "#" }],
        images: [], comments: []
    };

    const onLike = () => {/* TODO: POST /outfits/:id/like */};
    const onDislike = () => {/* TODO: POST /outfits/:id/dislike */};
    const onComment = (e) => { e.preventDefault(); /* TODO: POST /outfits/:id/comments */ };

    return (
        <div className="row">
            <div className="panel" style={{ flex: 2, minWidth: 320 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <UserAvatar size={32} src={outfit.posterAvatar} />
                    <span style={{ color: "var(--muted)" }}>{outfit.posterName}</span>
                </div>
                <h2 style={{ marginTop: 10 }}>{outfit.title}</h2>

                <div className="row" style={{ marginTop: 10 }}>
                    {(outfit.images?.length ? outfit.images : [null]).map((img, i) => (
                        <div key={i} style={{ flex: 1, minWidth: 260, aspectRatio: "4/3", background: "#0f1218", borderRadius: 8 }} />
                    ))}
                </div>

                <div className="panel" style={{ marginTop: 12 }}>
                    <div className="section-title">Items & Links</div>
                    <ul>
                        {outfit.items.map((it, i) => (
                            <li key={i}><a href={it.link} target="_blank" rel="noreferrer">{it.name}</a></li>
                        ))}
                    </ul>
                </div>
            </div>

            <aside className="panel" style={{ flex: 1, minWidth: 280 }}>
                <div className="toolbar">
                    <div className="section-title">Rating: {outfit.rating}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn secondary" onClick={onLike}>👍</button>
                        <button className="btn secondary" onClick={onDislike}>👎</button>
                    </div>
                </div>

                <div style={{ marginTop: 8 }}>
                    <div className="section-title">Comments</div>
                    <form onSubmit={onComment} style={{ marginBottom: 12 }}>
                        <label className="label">Add a comment</label>
                        <textarea className="textarea" rows={3} />
                        <button className="btn" style={{ marginTop: 8 }}>Post</button>
                    </form>
                    <div style={{ display: "grid", gap: 10 }}>
                        {outfit.comments.map((c, i) => (
                            <div key={i} className="panel">
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <UserAvatar size={24} src={c.avatar} />
                                    <span style={{ color: "var(--muted)" }}>{c.username}</span>
                                </div>
                                <div>{c.text}</div>
                            </div>
                        ))}
                        {!outfit.comments.length && <div style={{ color: "var(--muted)" }}>No comments yet.</div>}
                    </div>
                </div>
            </aside>
        </div>
    );
}
