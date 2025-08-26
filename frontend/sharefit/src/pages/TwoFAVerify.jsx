import { useNavigate } from "react-router-dom";

export default function TwoFAVerify() {
    const navigate = useNavigate();
    const onSubmit = (e) => {
        e.preventDefault();
        // TODO: POST /auth/2fa/verify { totpCode } → navigate("/dashboard")
        navigate("/dashboard");
    };
    return (
        <form onSubmit={onSubmit} className="panel" style={{ maxWidth: 420, margin: "0 auto" }}>
            <h2>Verify 2FA</h2>
            <label className="label">6-digit code</label>
            <input className="input" name="code" inputMode="numeric" />
            <button className="btn" style={{ marginTop: 12 }}>Verify</button>
        </form>
    );
}
