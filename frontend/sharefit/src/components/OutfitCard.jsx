import { Link } from "react-router-dom";
import UserAvatar from "./UserAvatar";

export default function OutfitCard({ outfit }) {
    // outfit: { id, title, posterName, posterAvatar, rating, commentsCount, tags, image }
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
            <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{outfit.title}</div>
                    <div style={{ color: "var(--muted)" }}>Rating: {outfit.rating} • {outfit.commentsCount} comments</div>
                </div>
                <Link className="btn" to={`/outfits/${outfit.id}`}>View</Link>
            </div>
        </div>
    );
}
