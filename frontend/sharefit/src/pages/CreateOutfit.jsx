import { useState } from "react";

export default function CreateOutfit() {
    const [items, setItems] = useState([{ name: "", link: "" }]);
    const addItem = () => setItems([...items, { name: "", link: "" }]);
    const updateItem = (i, key, val) => {
        const next = [...items]; next[i][key] = val; setItems(next);
    };
    const onSubmit = (e) => {
        e.preventDefault();
        // TODO: POST /outfits { title, tags, images, items }
    };

    return (
        <form onSubmit={onSubmit} className="panel">
            <h2>Create Outfit</h2>
            <label className="label">Title</label>
            <input className="input" name="title" />
            <label className="label">Genre / Tags (comma-separated)</label>
            <input className="input" name="tags" placeholder="streetwear, minimal, summer" />
            <label className="label">Image URLs (optional, comma-separated)</label>
            <input className="input" name="images" placeholder="https://..." />

            <div className="section-title" style={{ marginTop: 12 }}>Items</div>
            {items.map((it, i) => (
                <div key={i} className="row" style={{ alignItems: "center" }}>
                    <input className="input" placeholder="Item name" value={it.name} onChange={e=>updateItem(i,"name",e.target.value)} />
                    <input className="input" placeholder="Link to buy" value={it.link} onChange={e=>updateItem(i,"link",e.target.value)} />
                </div>
            ))}
            <button type="button" className="btn secondary" onClick={addItem} style={{ marginTop: 8 }}>Add Item</button>

            <div style={{ marginTop: 12 }}>
                <button className="btn">Publish Outfit</button>
            </div>
        </form>
    );
}
