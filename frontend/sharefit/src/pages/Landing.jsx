import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="panel" style={{ textAlign: "center" }}>
            <h1>ShareFit</h1>
            <p style={{ color: "var(--muted)" }}>
                Make and browse outfit sets with links to buy items. Get inspired and share yours.
            </p>
            <div style={{ display: "inline-flex", gap: 10, marginTop: 12 }}>
                <Link className="btn" to="/login">Login</Link>
                <Link className="btn secondary" to="/register">Register</Link>
            </div>
        </div>
    );
}
