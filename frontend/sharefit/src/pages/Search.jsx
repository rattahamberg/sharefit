import { useState } from "react";
import OutfitCard from "../components/OutfitCard";

export default function Search() {
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("title");       // title | tags | poster
    // TODO: GET /outfits?query=...&sort=... OR three server filters
    const results = []; // placeholder array

    return (
        <div className="panel">
            <div className="toolbar">
                <input className="input" placeholder="Search outfits..." value={q} onChange={e=>setQ(e.target.value)} />
                <select className="select" value={sort} onChange={e=>setSort(e.target.value)}>
                    <option value="title">Title</option>
                    <option value="tags">Genre/Tags</option>
                    <option value="poster">Poster (username)</option>
                </select>
            </div>
            <div className="grid">
                {results.map(o => <OutfitCard key={o.id} outfit={o} />)}
            </div>
        </div>
    );
}
