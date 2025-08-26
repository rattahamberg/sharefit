import { useNavigate } from "react-router-dom";

export default function TwoFASetup() {
    const navigate = useNavigate();
    const onVerify = (e) => {
        e.preventDefault();
        // TODO: POST /auth/2fa/enable { totpCode } then navigate("/dashboard")
        navigate("/dashboard");
    };
    return (
        <div className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
            <h2>Set up 2-Factor Authentication</h2>
            <p className="muted">Scan the QR in your authenticator app, then enter the 6-digit code.</p>
            <div style={{ height: 160, border: "1px dashed var(--border)", borderRadius: 8, margin: "12px 0" }} />
            <form onSubmit={onVerify}>
                <label className="label">6-digit code</label>
                <input className="input" name="code" inputMode="numeric" />
                <button className="btn" style={{ marginTop: 12 }}>Enable 2FA</button>
            </form>
        </div>
    );
}
