import { useEffect, useMemo, useState } from "react";
import OutfitCard from "../components/OutfitCard";
import { api } from "../lib/api";
import { adaptOutfit } from "../lib/adapters";

const PLACEHOLDERS = {
    title: "Search outfits by title…",
    tags: "Search by tag (e.g. streetwear)…",
    poster: "Search by poster username (e.g. alice)…"
};

export default function Search() {
    const [q, setQ] = useState("");
    const [mode, setMode] = useState("title"); // title | tags | poster
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // Build the query string the server expects
    const queryString = useMemo(() => {
        const term = q.trim();
        const params = new URLSearchParams();
        if (term) {
            if (mode === "title") params.set("q", term);
            if (mode === "tags") params.set("tag", term);
            if (mode === "poster") params.set("poster", term);
        }
        return params.toString();
    }, [q, mode]);

    useEffect(() => {
        let ignore = false;
        const t = setTimeout(async () => {
            setLoading(true);
            setErr("");
            try {
                const path = queryString ? `/outfits?${queryString}` : `/outfits`;
                const data = await api(path);
                if (!ignore) {
                    setResults((data.outfits ?? []).map(adaptOutfit));
                }
            } catch (e) {
                if (!ignore) {
                    setResults([]);
                    setErr(e?.message || "Search failed");
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        }, 250); // debounce a little
        return () => { ignore = true; clearTimeout(t); };
    }, [queryString]);

    return (
        <div className="panel">
            <div className="toolbar" style={{ gap: 8 }}>
                <input
                    className="input"
                    placeholder={PLACEHOLDERS[mode]}
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    onKeyDown={e => {
                        // optional: pressing Enter forces immediate search
                        if (e.key === "Enter") setQ(prev => prev);
                    }}
                />
                <select className="select" value={mode} onChange={e => setMode(e.target.value)}>
                    <option value="title">Title</option>
                    <option value="tags">Genre/Tags</option>
                    <option value="poster">Poster (username)</option>
                </select>
            </div>

            {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
            {loading && <div className="muted" style={{ marginTop: 8 }}>Searching…</div>}

            <div className="grid" style={{ marginTop: 8 }}>
                {results.map(o => <OutfitCard key={o.id} outfit={o} />)}
            </div>

            {!loading && !err && !results.length && (
                <div className="muted" style={{ marginTop: 8 }}>
                    {q.trim()
                        ? "No results. Try a different title/tag/username."
                        : "Type to search, or leave blank to see recent outfits."}
                </div>
            )}
        </div>
    );
}
