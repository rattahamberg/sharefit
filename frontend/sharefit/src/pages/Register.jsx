import {useNavigate, Link} from "react-router-dom";
import {useState} from "react";
import {api} from "../lib/api";

export default function Register() {
    const navigate = useNavigate();
    const [err, setErr] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        const fd = new FormData(e.currentTarget);
        const username = fd.get("username")?.trim();
        const password = fd.get("password");
        const profilePictureUrl = fd.get("profilePictureUrl")?.trim();

        try {
            await api("/auth/register", {
                method: "POST",
                body: {username, password, profilePictureUrl}
            });
            navigate("/2fa/setup", {replace: true, state: {username}});
        } catch (e) {
            setErr(e?.message || "Registration failed");
        }
    };

    return (
        <form onSubmit={onSubmit} className="panel" style={{maxWidth: 480, margin: "0 auto"}}>
            <h2>Create Account</h2>
            {err && <div className="error">{err}</div>}
            <label className="label">Username</label>
            <input className="input" name="username" autoComplete="username"/>
            <label className="label">Password</label>
            <input type="password" className="input" name="password" autoComplete="new-password"/>
            <label className="label">Profile picture URL (optional)</label>
            <input className="input" name="profilePictureUrl" placeholder="https://example.com/avatar.jpg"/>
            <button className="btn" style={{marginTop: 12}}>Register</button>
            <div style={{marginTop: 10}}>
                Already have an account? <Link to="/login">Log in</Link>
            </div>
        </form>
    );
}
