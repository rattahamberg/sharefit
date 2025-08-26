import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [err, setErr] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        const fd = new FormData(e.currentTarget);
        const username = fd.get("username")?.trim();
        const password = fd.get("password");

        try {
            await login({ username, password }); // no code yet
            const from = location.state?.from?.pathname || "/dashboard";
            navigate(from, { replace: true });
        } catch (e) {
            const msg = e?.message || "";
            if (e.status === 400 && /TOTP code required/i.test(msg)) {
                navigate("/2fa/verify", { replace: true, state: { username, password, from: location.state?.from } });
            } else {
                setErr(msg || "Login failed");
            }
        }
    };

    return (
        <form onSubmit={onSubmit} className="panel" style={{ maxWidth: 420, margin: "0 auto" }}>
            <h2>Login</h2>
            {err && <div className="error">{err}</div>}
            <label className="label">Username</label>
            <input className="input" name="username" autoComplete="username" />
            <label className="label">Password</label>
            <input type="password" className="input" name="password" autoComplete="current-password" />
            <button className="btn" style={{ marginTop: 12 }}>Continue</button>
            <div style={{ marginTop: 10 }}>
                New here? <Link to="/register">Create an account</Link>
            </div>
        </form>
    );
}
