import {useEffect, useMemo, useState} from "react";
import OutfitCard from "../components/OutfitCard";
import {api} from "../lib/api";
import {adaptOutfit} from "../lib/adapters";
import {useAuth} from "../context/AuthContext";

const PLACEHOLDERS = {
    title: "Search outfits by title…",
    tags: "Search by tag (e.g. streetwear)…",
    poster: "Search by poster username (e.g. alice)…"
};

export default function Search() {
    const {user} = useAuth();
    const [q, setQ] = useState("");
    const [mode, setMode] = useState("title"); // title | tags | poster
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // Build query string for server
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
                // 1) fetch outfits
                const path = queryString ? `/outfits?${queryString}` : `/outfits`;
                const data = await api(path);
                const base = (data.outfits ?? []).map(adaptOutfit);

                // 2) fetch my votes in one shot (only if logged in and we have results)
                if (user && base.length) {
                    const ids = base.map(o => o.id);
                    const res = await api("/outfits/votes", {method: "POST", body: {ids}});
                    const votes = res.votes || {};
                    if (!ignore) {
                        setResults(base.map(o => ({...o, userVote: votes[o.id] ?? 0})));
                    }
                } else {
                    if (!ignore) setResults(base);
                }
            } catch (e) {
                if (!ignore) {
                    setResults([]);
                    setErr(e?.message || "Search failed");
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        }, 250); // debounce

        return () => {
            ignore = true;
            clearTimeout(t);
        };
    }, [queryString, user]); // re-run if auth status changes

    return (
        <div className="panel">
            <div className="toolbar" style={{gap: 8}}>
                <input
                    className="input"
                    placeholder={PLACEHOLDERS[mode]}
                    value={q}
                    onChange={e => setQ(e.target.value)}
                />
                <select className="select" value={mode} onChange={e => setMode(e.target.value)}>
                    <option value="title">Title</option>
                    <option value="tags">Genre/Tags</option>
                    <option value="poster">Poster (username)</option>
                </select>
            </div>

            {err && <div className="error" style={{marginTop: 8}}>{err}</div>}
            {loading && <div className="muted" style={{marginTop: 8}}>Searching…</div>}

            <div className="grid" style={{marginTop: 8}}>
                {results.map(o => <OutfitCard key={o.id} outfit={o}/>)}
            </div>

            {!loading && !err && !results.length && (
                <div className="muted" style={{marginTop: 8}}>
                    {q.trim()
                        ? "No results. Try a different title/tag/username."
                        : "Type to search, or leave blank to see recent outfits."}
                </div>
            )}
        </div>
    );
}
