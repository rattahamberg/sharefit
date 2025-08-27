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
    const {user, savedVersion} = useAuth();
    const [q, setQ] = useState("");
    const [mode, setMode] = useState("title"); // title | tags | poster
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // recommended
    const [recs, setRecs] = useState([]);
    const [recLoading, setRecLoading] = useState(false);

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

    // Fetch search results (debounced)
    useEffect(() => {
        let ignore = false;
        const t = setTimeout(async () => {
            setLoading(true);
            setErr("");
            try {
                const path = queryString ? `/outfits?${queryString}` : `/outfits`;
                const data = await api(path);
                const base = (data.outfits ?? []).map(adaptOutfit);

                if (user && base.length) {
                    const ids = base.map(o => o.id);
                    const res = await api("/outfits/votes", {method: "POST", body: {ids}});
                    const votes = res.votes || {};
                    if (!ignore) setResults(base.map(o => ({...o, userVote: votes[o.id] ?? 0})));
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
        }, 250);

        return () => {
            ignore = true;
            clearTimeout(t);
        };
    }, [queryString, user]);

    // NEW: Fetch simple recommendations whenever the user or their saves change
    useEffect(() => {
        let ignore = false;
        (async () => {
            setRecLoading(true);
            try {
                // If not logged in: just show recent outfits and call it a day
                if (!user) {
                    const data = await api("/outfits");
                    const recent = (data.outfits ?? []).slice(0, 8).map(adaptOutfit);
                    if (!ignore) setRecs(recent);
                    return;
                }

                // 1) Pull your saved and posted outfits
                const [savedRes, mineRes] = await Promise.all([
                    api("/users/me/saved"),
                    api("/outfits/mine/list")
                ]);
                const savedDocs = savedRes.outfits ?? [];
                const mineDocs = mineRes.outfits ?? [];

                // 2) Count tags and posters you interact with
                const tagCount = new Map();
                const posterCount = new Map();

                const bump = (map, key) => map.set(key, (map.get(key) || 0) + 1);

                for (const d of savedDocs) {
                    (d.tags || []).forEach(t => bump(tagCount, t));
                    if (d.posterUsername) bump(posterCount, d.posterUsername);
                }
                for (const d of mineDocs) {
                    (d.tags || []).forEach(t => bump(tagCount, t));
                }

                // pick a few favorites
                const topTags = [...tagCount.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([t]) => t);

                const topPosters = [...posterCount.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([u]) => u);

                // 3) Fetch candidates from those tags/posters (multiple small calls)
                const calls = [
                    ...topTags.map(t => api(`/outfits?tag=${encodeURIComponent(t)}`)),
                    ...topPosters.map(u => api(`/outfits?poster=${encodeURIComponent(u)}`))
                ];
                const buckets = calls.length ? await Promise.all(calls) : [{outfits: []}];

                // 4) Merge + dedupe + filter out already-saved for variety
                const savedIds = new Set(user.savedOutfitIds || []);
                const uniq = new Map();
                for (const b of buckets) {
                    for (const d of (b.outfits ?? [])) {
                        const id = String(d._id);
                        if (savedIds.has(id)) continue; // optional: skip things you already saved
                        if (!uniq.has(id)) uniq.set(id, d);
                    }
                }

                // Fallback: if preferences are empty, just use recents
                let pool = [...uniq.values()];
                if (!pool.length) {
                    const data = await api("/outfits");
                    pool = (data.outfits ?? []);
                }

                // 5) Adapt, fetch my votes once, and cap to 8
                let base = pool
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 8)
                    .map(adaptOutfit);

                if (user && base.length) {
                    const ids = base.map(o => o.id);
                    const res = await api("/outfits/votes", {method: "POST", body: {ids}});
                    const votes = res.votes || {};
                    base = base.map(o => ({...o, userVote: votes[o.id] ?? 0}));
                }

                if (!ignore) setRecs(base);
            } catch {
                if (!ignore) setRecs([]);
            } finally {
                if (!ignore) setRecLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, [user, savedVersion]);

    return (
        <div className="panel">
            {/* Recommended strip shows only when not currently searching */}
            {!q.trim() && recs.length > 0 && (
                <section style={{marginBottom: 12}}>
                    <div className="section-title" style={{marginBottom: 8}}>
                        Recommended for you
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            overflowX: "auto",
                            paddingBottom: 6
                        }}
                    >
                        {recs.map(o => (
                            <div key={o.id} style={{flex: "0 0 280px"}}>
                                <OutfitCard outfit={o}/>
                            </div>
                        ))}
                    </div>
                </section>
            )}

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
                        : recLoading
                            ? "Loading suggestions…"
                            : "Type to search, or browse the recommendations above."}
                </div>
            )}
        </div>
    );
}
