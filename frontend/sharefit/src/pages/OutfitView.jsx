import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// Map backend doc -> view model
function adaptOutfitDetail(doc) {
    return {
        id: doc._id,
        title: doc.title,
        posterName: doc.posterUsername,
        posterAvatar: doc.posterAvatar || "",
        rating: doc.rating ?? 0,
        items: (doc.items ?? []).map(it => ({ name: it.name, link: it.link })),
        images: doc.pictures ?? [],
        comments: (doc.comments ?? []).map(c => ({
            username: c.username,
            avatar: c.profilePictureUrl || "",
            text: c.text,
            createdAt: c.createdAt
        })),
        // raw map if we want to read current vote
        _votes: doc.votes || {}
    };
}

export default function OutfitView() {
    const { id } = useParams();
    const { user } = useAuth(); // expects { id, username, profilePictureUrl, ... }
    const [outfit, setOutfit] = useState(null);
    const [rating, setRating] = useState(0);
    const [vote, setVote] = useState(0); // -1, 0, 1
    const [comment, setComment] = useState("");
    const [err, setErr] = useState("");

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const { outfit: doc } = await api(`/outfits/${id}`);
                if (ignore) return;
                const o = adaptOutfitDetail(doc);
                setOutfit(o);
                setRating(o.rating);
                // pre-highlight my vote if we know my user id
                if (user?.id && o._votes && typeof o._votes[user.id] !== "undefined") {
                    setVote(o._votes[user.id] || 0);
                } else {
                    setVote(0);
                }
            } catch (e) {
                if (!ignore) setErr(e?.message || "Failed to load outfit");
            }
        })();
        return () => { ignore = true; };
    }, [id, user?.id]);

    if (!outfit) {
        return <div className="panel">Loading…{err ? <div className="error" style={{ marginTop: 8 }}>{err}</div> : null}</div>;
    }

    const onRate = async (next) => {
        try {
            // toggle if same button clicked twice
            const send = vote === next ? 0 : next;
            const { rating } = await api(`/outfits/${id}/rate`, { method: "POST", body: { value: send } });
            setVote(send);
            setRating(rating);
        } catch (e) {
            setErr(e?.message || "Failed to rate");
        }
    };

    const onComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            await api(`/outfits/${id}/comments`, { method: "POST", body: { text: comment.trim() } });
            // append locally; server already stores username/avatar from req.user
            setOutfit(prev => ({
                ...prev,
                comments: [...prev.comments, { username: user.username, avatar: user.profilePictureUrl || "", text: comment.trim() }]
            }));
            setComment("");
        } catch (e) {
            setErr(e?.message || "Failed to post comment");
        }
    };

    return (
        <div className="row">
            <div className="panel" style={{ flex: 2, minWidth: 320 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <UserAvatar size={32} src={outfit.posterAvatar} />
                    <span style={{ color: "var(--muted)" }}>{outfit.posterName}</span>
                </div>
                <h2 style={{ marginTop: 10 }}>{outfit.title}</h2>

                <div className="row" style={{ marginTop: 10, gap: 10 }}>
                    {(outfit.images?.length ? outfit.images : [null]).map((img, i) => (
                        <div key={i} style={{ flex: 1, minWidth: 260, aspectRatio: "4/3", background: "#0f1218", borderRadius: 8, overflow: "hidden" }}>
                            {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                        </div>
                    ))}
                </div>

                <div className="panel" style={{ marginTop: 12 }}>
                    <div className="section-title">Items & Links</div>
                    {outfit.items?.length ? (
                        <ul>
                            {outfit.items.map((it, i) => (
                                <li key={i}><a href={it.link} target="_blank" rel="noreferrer">{it.name}</a></li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ color: "var(--muted)" }}>No items listed.</div>
                    )}
                </div>
            </div>

            <aside className="panel" style={{ flex: 1, minWidth: 280 }}>
                <div className="toolbar">
                    <div className="section-title">Rating: {rating}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            className="btn secondary"
                            data-pressed={vote === 1}
                            aria-pressed={vote === 1}
                            onClick={() => onRate(1)}
                            title="Like"
                        >👍</button>
                        <button
                            className="btn secondary"
                            data-pressed={vote === -1}
                            aria-pressed={vote === -1}
                            onClick={() => onRate(-1)}
                            title="Dislike"
                        >👎</button>
                    </div>
                </div>

                <div style={{ marginTop: 8 }}>
                    <div className="section-title">Comments</div>
                    <form onSubmit={onComment} style={{ marginBottom: 12 }}>
                        <label className="label">Add a comment</label>
                        <textarea
                            className="textarea"
                            rows={3}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Say something nice."
                        />
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

                {err && <div className="error" style={{ marginTop: 10 }}>{err}</div>}
            </aside>
        </div>
    );
}
