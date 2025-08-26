import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import UserAvatar from "./UserAvatar";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function OutfitCard({ outfit }) {
    // outfit: { id, title, posterName, posterAvatar, rating, commentsCount, tags, image }
    const { user, updateSaved } = useAuth();
    const initiallySaved = useMemo(
        () => Boolean(user?.savedOutfitIds?.includes?.(outfit.id)),
        [user?.savedOutfitIds, outfit.id]
    );

    const [rating, setRating] = useState(outfit.rating ?? 0);
    const [vote, setVote] = useState(outfit.userVote ?? 0);          // unknown initially; will reflect after user clicks
    const [saved, setSaved] = useState(initiallySaved);

    useEffect(() => {
        setSaved(Boolean(user?.savedOutfitIds?.includes?.(outfit.id)));
        }, [user?.savedOutfitIds, outfit.id]);

    const [busy, setBusy] = useState(false);

    useEffect(() => { setVote(outfit.userVote ?? 0); }, [outfit.userVote]);

    async function onRate(next) {
        if (busy) return;
        setBusy(true);
        try {
            // toggle if same button clicked twice
            const send = vote === next ? 0 : next; // 1 like, -1 dislike, 0 clear
            const { rating } = await api(`/outfits/${outfit.id}/rate`, {
                method: "POST",
                body: { value: send }
            });
            setVote(send);
            setRating(rating);
        } catch (e) {
            // optional: toast e.message
        } finally {
            setBusy(false);
        }
    }

    async function onToggleSave() {
        if (busy) return;
        setBusy(true);
        try {
            if (saved) {
                await api(`/outfits/${outfit.id}/unsave`, { method: "POST" });
                setSaved(false);
                updateSaved(outfit.id, false);
            } else {
                await api(`/outfits/${outfit.id}/save`, { method: "POST" });
                setSaved(true);
                updateSaved(outfit.id, true);
            }
        } catch (e) {
            // optional: toast e.message
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="panel">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <UserAvatar size={28} src={outfit.posterAvatar} />
                {/* Spec: usernames shown but profiles not selectable */}
                <span style={{ color: "var(--muted)" }}>{outfit.posterName}</span>
                {outfit.tags?.length ? <span className="badge">{outfit.tags.join(" • ")}</span> : null}
            </div>

            <div style={{ borderRadius: 8, overflow: "hidden", background: "#0f1218", aspectRatio: "4/3", marginBottom: 10 }}>
                {outfit.image ? <img src={outfit.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
            </div>

            <div className="row" style={{ alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{outfit.title}</div>
                    <div style={{ color: "var(--muted)" }}>Rating: {rating} • {outfit.commentsCount} comments</div>
                </div>

                <div className="row" style={{ gap: 6 }}>
                    <button
                        className="btn secondary"
                        title="Like"
                        data-pressed={vote === 1}
                        aria-pressed={vote === 1}
                        onClick={() => onRate(1)}
                        disabled={busy}
                    >👍</button>

                    <button
                        className="btn secondary"
                        title="Dislike"
                        data-pressed={vote === -1}
                        aria-pressed={vote === -1}
                        onClick={() => onRate(-1)}
                        disabled={busy}
                    >👎</button>

                    <button
                        className="btn secondary"
                        title={saved ? "Unsave" : "Save"}
                        data-pressed={saved}
                        aria-pressed={saved}
                        onClick={onToggleSave}
                        disabled={busy}
                    >★</button>

                    <Link className="btn" to={`/outfits/${outfit.id}`}>View</Link>
                </div>
            </div>
        </div>
    );
}
