import {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import UserAvatar from "../components/UserAvatar";
import {api} from "../lib/api";
import {useAuth} from "../context/AuthContext";

// Map backend doc -> view model
function adaptOutfitDetail(doc) {
    return {
        id: doc._id,
        title: doc.title,
        posterName: doc.posterUsername,
        posterAvatar: doc.posterAvatar || "",
        rating: doc.rating ?? 0,
        items: (doc.items ?? []).map(it => ({name: it.name, link: it.link})),
        images: doc.pictures ?? [],
        comments: (doc.comments ?? []).map(c => ({
            id: c._id,
            userId: c.userId,
            username: c.username,
            avatar: c.profilePictureUrl || "",
            text: c.text,
            parentId: c.parentId ?? null,
            deleted: !!c.deleted,
            createdAt: c.createdAt
        })),
        _votes: doc.votes || {}
    };
}

export default function OutfitView() {
    const {id} = useParams();
    const {user, updateSaved} = useAuth(); // updateSaved added earlier in AuthContext
    const [outfit, setOutfit] = useState(null);
    const [rating, setRating] = useState(0);
    const [vote, setVote] = useState(0); // -1, 0, 1
    const [comment, setComment] = useState("");
    const [replyOpen, setReplyOpen] = useState({}); // { [commentId]: true }
    const [replyText, setReplyText] = useState({}); // { [commentId]: "text" }
    const [err, setErr] = useState("");
    const [busy, setBusy] = useState(false);

    // Saved toggle state (keeps in sync with context)
    const initiallySaved = useMemo(
        () => Boolean(user?.savedOutfitIds?.includes?.(id)),
        [user?.savedOutfitIds, id]
    );
    const [saved, setSaved] = useState(initiallySaved);
    useEffect(() => setSaved(initiallySaved), [initiallySaved]);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const {outfit: doc} = await api(`/outfits/${id}`);
                if (ignore) return;
                const o = adaptOutfitDetail(doc);
                setOutfit(o);
                setRating(o.rating);
                if (user?.id && o._votes && typeof o._votes[user.id] !== "undefined") {
                    setVote(o._votes[user.id] || 0);
                } else {
                    setVote(0);
                }
            } catch (e) {
                if (!ignore) setErr(e?.message || "Failed to load outfit");
            }
        })();
        return () => {
            ignore = true;
        };
    }, [id, user?.id]);

    if (!outfit) {
        return <div className="panel">Loading…{err ?
            <div className="error" style={{marginTop: 8}}>{err}</div> : null}</div>;
    }

    const onRate = async (next) => {
        if (busy) return;
        setBusy(true);
        try {
            const send = vote === next ? 0 : next;
            const {rating} = await api(`/outfits/${id}/rate`, {method: "POST", body: {value: send}});
            setVote(send);
            setRating(rating);
        } catch (e) {
            setErr(e?.message || "Failed to rate");
        } finally {
            setBusy(false);
        }
    };

    const onToggleSave = async () => {
        if (busy) return;
        setBusy(true);
        try {
            if (saved) {
                await api(`/outfits/${id}/unsave`, {method: "POST"});
                setSaved(false);
                updateSaved(id, false);
            } else {
                await api(`/outfits/${id}/save`, {method: "POST"});
                setSaved(true);
                updateSaved(id, true);
            }
        } catch (e) {
            setErr(e?.message || "Failed to toggle save");
        } finally {
            setBusy(false);
        }
    };

    const onComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            const {comment: created} = await api(`/outfits/${id}/comments`, {
                method: "POST", body: {text: comment.trim()}
            });
            setOutfit(prev => ({
                ...prev,
                comments: [...prev.comments, {
                    id: created._id,
                    userId: created.userId,
                    username: created.username,
                    avatar: created.profilePictureUrl || "",
                    text: created.text,
                    parentId: created.parentId ?? null,
                    deleted: !!created.deleted,
                    createdAt: created.createdAt
                }]
            }));
            setComment("");
        } catch (e) {
            setErr(e?.message || "Failed to post comment");
        }
    };

    async function onReplySubmit(parentId) {
        const text = (replyText[parentId] || "").trim();
        if (!text) return;
        try {
            const {comment: created} = await api(`/outfits/${id}/comments`, {
                method: "POST", body: {text, parentId}
            });
            setOutfit(prev => ({
                ...prev, comments: [...prev.comments, {
                    id: created._id || created.id || parentId + "-child",
                    userId: user.id,
                    username: user.username,
                    avatar: user.profilePictureUrl || "",
                    text,
                    parentId,
                    deleted: false,
                    createdAt: new Date().toISOString()
                }]
            }));
            setReplyText(rt => ({...rt, [parentId]: ""}));
            setReplyOpen(ro => ({...ro, [parentId]: false}));
        } catch (e) {
            setErr(e?.message || "Failed to reply");
        }
    }

    async function onDeleteComment(commentId) {
        try {
            await api(`/outfits/${id}/comments/${commentId}`, {method: "DELETE"});
            setOutfit(prev => ({
                ...prev,
                comments: prev.comments.map(c =>
                    c.id === commentId ? {...c, deleted: true, text: "[deleted]", username: "[deleted]", avatar: ""} : c
                )
            }));
        } catch (e) {
            setErr(e?.message || "Failed to delete comment");
        }
    }

    function renderThread(flatComments, handlers) {
        const { me, onReplyOpen, onReplyText, onReplySubmit, onDelete, replyOpen, replyText } = handlers;

        // sort without mutating state
        const list = [...flatComments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // index by id for quick lookup
        const byId = new Map(list.map(c => [String(c.id), c]));

        // group by root (parentId ? parentId : id)
        const roots = [];
        const childrenByRoot = {};
        for (const c of list) {
            if (!c.parentId) {
                roots.push(c);
            } else {
                const rootId = String(c.parentId);
                (childrenByRoot[rootId] ||= []).push(c);
            }
        }

        // clicking reply on ANY comment should open the root reply box
        function openReplyFor(commentId) {
            const c = byId.get(String(commentId));
            if (!c) return;
            const rootId = c.parentId ? String(c.parentId) : String(c.id);
            onReplyOpen(rootId);
        }

        return (
            <div style={{ display: "grid", gap: 10 }}>
                {roots.length === 0 && <div style={{ color: "var(--muted)" }}>No comments yet.</div>}

                {roots.map(root => (
                    <div
                        key={root.id}
                        className="comment-block"
                        style={{
                            padding: "10px 12px",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            maxWidth: "100%"
                        }}
                    >
                        <CommentRow c={root} me={me} onReplyOpen={openReplyFor} onDelete={onDelete} />

                        {/* children (one level) */}
                        {(childrenByRoot[String(root.id)] || []).map(child => (
                            <div
                                key={child.id}
                                className="comment child"
                                style={{
                                    marginTop: 8,
                                    borderLeft: "2px solid var(--border)",
                                    paddingLeft: 12,
                                    maxWidth: "100%"
                                }}
                            >
                                <CommentRow c={child} me={me} onReplyOpen={openReplyFor} onDelete={onDelete} isChild />
                            </div>
                        ))}

                        {/* single reply box for the whole root thread */}
                        {replyOpen[root.id] && !root.deleted && (
                            <div style={{ marginTop: 8 }}>
              <textarea
                  className="textarea"
                  rows={2}
                  value={replyText[root.id] || ""}
                  onChange={e => onReplyText(root.id, e.target.value)}
                  placeholder="Write a reply…"
                  style={{ width: "100%" }}
              />
                                <button className="btn" style={{ marginTop: 6 }} onClick={() => onReplySubmit(root.id)}>
                                    Reply
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    function CommentRow({ c, me, onReplyOpen, onDelete }) {
        const mine = me && String(c.userId) === String(me);
        return (
            <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, minWidth: 0 }}>
                    <UserAvatar size={24} src={c.deleted ? "" : c.avatar} />
                    <span style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
          {c.username}
        </span>
                    <span style={{ color: "var(--muted)", marginLeft: "auto", fontSize: 12, whiteSpace: "nowrap" }}>
          {new Date(c.createdAt).toLocaleString()}
        </span>
                </div>
                <div
                    className="comment-text"
                    style={{
                        color: c.deleted ? "var(--muted)" : "inherit",
                        fontStyle: c.deleted ? "italic" : "normal",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        maxWidth: "100%"
                    }}
                >
                    {c.deleted ? "[deleted]" : c.text}
                </div>
                <div className="row" style={{ gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    {!c.deleted && (
                        <button className="btn secondary" onClick={() => onReplyOpen(c.id)}>
                            Reply
                        </button>
                    )}
                    {mine && !c.deleted && (
                        <button className="btn secondary" onClick={() => onDelete(c.id)}>
                            Delete
                        </button>
                    )}
                </div>
            </>
        );
    }


    return (
        <div className="row">
            <div className="panel" style={{flex: 2, minWidth: 320}}>
                <div style={{display: "flex", alignItems: "center", gap: 10}}>
                    <UserAvatar size={32} src={outfit.posterAvatar}/>
                    <span style={{color: "var(--muted)"}}>{outfit.posterName}</span>
                </div>
                <h2 style={{marginTop: 10}}>{outfit.title}</h2>

                <div className="row" style={{marginTop: 10, gap: 10}}>
                    {(outfit.images?.length ? outfit.images : [null]).map((img, i) => (
                        <div key={i} style={{
                            flex: 1,
                            minWidth: 260,
                            aspectRatio: "4/3",
                            background: "#0f1218",
                            borderRadius: 8,
                            overflow: "hidden"
                        }}>
                            {img ? <img src={img} alt=""
                                        style={{width: "100%", height: "100%", objectFit: "cover"}}/> : null}
                        </div>
                    ))}
                </div>

                <div className="panel" style={{marginTop: 12}}>
                    <div className="section-title">Items & Links</div>
                    {outfit.items?.length ? (
                        <ul>
                            {outfit.items.map((it, i) => (
                                <li key={i}><a href={it.link} target="_blank" rel="noreferrer">{it.name}</a></li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{color: "var(--muted)"}}>No items listed.</div>
                    )}
                </div>
            </div>

            <aside className="panel" style={{flex: 1, minWidth: 280}}>
                <div className="toolbar" style={{gap: 8}}>
                    <div className="section-title">Rating: {rating}</div>
                    <div style={{display: "flex", gap: 8}}>
                        <button
                            className="btn secondary"
                            data-pressed={vote === 1}
                            aria-pressed={vote === 1}
                            onClick={() => onRate(1)}
                            disabled={busy}
                            title="Like"
                        >👍
                        </button>
                        <button
                            className="btn secondary"
                            data-pressed={vote === -1}
                            aria-pressed={vote === -1}
                            onClick={() => onRate(-1)}
                            disabled={busy}
                            title="Dislike"
                        >👎
                        </button>
                        <button
                            className="btn secondary"
                            data-pressed={saved}
                            aria-pressed={saved}
                            onClick={onToggleSave}
                            disabled={busy}
                            title={saved ? "Unsave" : "Save"}
                        >★
                        </button>
                    </div>
                </div>

                <div style={{marginTop: 8}}>
                    <div className="section-title">Comments</div>
                    <form onSubmit={onComment} style={{marginBottom: 12}}>
                        <label className="label">Add a comment</label>
                        <textarea
                            className="textarea"
                            rows={3}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Say something nice."
                        />
                        <button className="btn" style={{marginTop: 8}}>Post</button>
                    </form>

                    {renderThread(outfit.comments, {
                        me: user?.id,
                        onReplyOpen: (cid) => setReplyOpen(s => ({...s, [cid]: !s[cid]})),
                        onReplyText: (cid, v) => setReplyText(s => ({...s, [cid]: v})),
                        onReplySubmit,
                        onDelete: onDeleteComment,
                        replyOpen,
                        replyText
                    })}
                </div>

                {err && <div className="error" style={{marginTop: 10}}>{err}</div>}
            </aside>
        </div>
    );
}
