import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function TwoFAVerify() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [err, setErr] = useState("");

    const username = location.state?.username;
    const password = location.state?.password;
    const from = location.state?.from?.pathname || "/dashboard";

    useEffect(() => {
        if (!username || !password) navigate("/login", { replace: true });
    }, [username, password, navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        const fd = new FormData(e.currentTarget);
        const code = fd.get("code")?.trim();
        try {
            await login({ username, password, code });
            navigate(from, { replace: true });
        } catch (e) {
            setErr(e?.message || "Invalid code");
        }
    };

    return (
        <form onSubmit={onSubmit} className="panel" style={{ maxWidth: 420, margin: "0 auto" }}>
            <h2>Verify 2FA</h2>
            {err && <div className="error">{err}</div>}
            <label className="label">6-digit code</label>
            <input className="input" name="code" inputMode="numeric" placeholder="123456" />
            <button className="btn" style={{ marginTop: 12 }}>Verify</button>
        </form>
    );
}
