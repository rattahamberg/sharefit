import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const onSubmit = (e) => {
        e.preventDefault();
        // TODO: POST /auth/login then if user has 2FA enabled, go to /2fa/verify.
        navigate("/2fa/verify");
    };
    return (
        <form onSubmit={onSubmit} className="panel" style={{ maxWidth: 420, margin: "0 auto" }}>
            <h2>Login</h2>
            <label className="label">Username</label>
            <input className="input" name="username" />
            <label className="label">Password</label>
            <input type="password" className="input" name="password" />
            <button className="btn" style={{ marginTop: 12 }}>Continue</button>
            <div style={{ marginTop: 10 }}>
                New here? <Link to="/register">Create an account</Link>
            </div>
        </form>
    );
}
