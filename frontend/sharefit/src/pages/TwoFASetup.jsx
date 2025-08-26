import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

export default function TwoFASetup() {
    const navigate = useNavigate();
    const location = useLocation();
    const username = location.state?.username;
    const [qr, setQr] = useState("");
    const [base32, setBase32] = useState("");
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!username) {
            navigate("/register", { replace: true });
            return;
        }
        (async () => {
            try {
                const { qr, base32 } = await api("/auth/totp/setup", { method: "POST", body: { username } });
                setQr(qr);
                setBase32(base32);
            } catch (e) {
                setErr(e?.message || "Failed to initialize 2FA");
            }
        })();
    }, [username, navigate]);

    const onVerify = async (e) => {
        e.preventDefault();
        setErr("");
        const fd = new FormData(e.currentTarget);
        const code = fd.get("code")?.trim();
        try {
            await api("/auth/totp/verify", { method: "POST", body: { username, base32, code } });
            navigate("/login", { replace: true });
        } catch (e) {
            setErr(e?.message || "Invalid code");
        }
    };

    return (
        <div className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
            <h2>Set up 2-Factor Authentication</h2>
            {err && <div className="error">{err}</div>}
            <p className="muted">Scan this QR with your authenticator app, then enter the 6-digit code.</p>
            <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
                {qr ? <img src={qr} alt="TOTP QR" style={{ width: 200, height: 200 }} /> :
                    <div style={{ height: 160, width: 160, border: "1px dashed var(--border)", borderRadius: 8 }} />}
            </div>
            <form onSubmit={onVerify}>
                <label className="label">6-digit code</label>
                <input className="input" name="code" inputMode="numeric" placeholder="123456" />
                <button className="btn" style={{ marginTop: 12 }}>Enable 2FA</button>
            </form>
            <div style={{ marginTop: 12 }}>
                <Link to="/login">Back to login</Link>
            </div>
        </div>
    );
}
