import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function splitCSV(str) {
    return (str || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
}

export default function CreateOutfit() {
    const navigate = useNavigate();
    const [items, setItems] = useState([{ name: "", link: "" }]);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState("");

    const addItem = () => setItems([...items, { name: "", link: "" }]);
    const updateItem = (i, key, val) => {
        const next = [...items]; next[i][key] = val; setItems(next);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setSubmitting(true);

        const fd = new FormData(e.currentTarget);
        const title = fd.get("title")?.trim();
        const tags = splitCSV(fd.get("tags"));
        const pictures = splitCSV(fd.get("images"));

        // keep only items with at least a name and a link
        const cleanItems = items
            .map(it => ({ name: it.name.trim(), link: it.link.trim() }))
            .filter(it => it.name && it.link);

        if (!title) {
            setErr("Title is required.");
            setSubmitting(false);
            return;
        }

        try {
            const { outfit } = await api("/outfits", {
                method: "POST",
                body: { title, tags, pictures, items: cleanItems }
            });
            navigate(`/outfits/${outfit._id}`, { replace: true });
        } catch (e2) {
            setErr(e2?.message || "Failed to publish outfit");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="panel">
            <h2>Create Outfit</h2>
            {err && <div className="error" style={{ marginBottom: 8 }}>{err}</div>}

            <label className="label">Title</label>
            <input className="input" name="title" />

            <label className="label">Genre / Tags (comma-separated)</label>
            <input className="input" name="tags" placeholder="streetwear, minimal, summer" />

            <label className="label">Image URLs (optional, comma-separated)</label>
            <input className="input" name="images" placeholder="https://..." />

            <div className="section-title" style={{ marginTop: 12 }}>Items</div>
            {items.map((it, i) => (
                <div key={i} className="row" style={{ alignItems: "center", gap: 8 }}>
                    <input
                        className="input"
                        placeholder="Item name"
                        value={it.name}
                        onChange={e => updateItem(i, "name", e.target.value)}
                    />
                    <input
                        className="input"
                        placeholder="Link to buy"
                        value={it.link}
                        onChange={e => updateItem(i, "link", e.target.value)}
                    />
                </div>
            ))}
            <button
                type="button"
                className="btn secondary"
                onClick={addItem}
                style={{ marginTop: 8 }}
            >
                Add Item
            </button>

            <div style={{ marginTop: 12 }}>
                <button className="btn" disabled={submitting}>
                    {submitting ? "Publishing…" : "Publish Outfit"}
                </button>
            </div>
        </form>
    );
}
