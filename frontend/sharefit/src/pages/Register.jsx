import { useNavigate, Link } from "react-router-dom";
export default function Register() {
    const navigate = useNavigate();
    const onSubmit = (e) => {
        e.preventDefault();
        // TODO: POST /auth/register → navigate("/login")
        navigate("/login");
    };
    return (
        <form onSubmit={onSubmit} className="panel" style={{ maxWidth: 480, margin: "0 auto" }}>
            <h2>Create Account</h2>
            <label className="label">Username</label>
            <input className="input" name="username" />
            <label className="label">Password</label>
            <input type="password" className="input" name="password" />
            <button className="btn" style={{ marginTop: 12 }}>Register</button>
            <div style={{ marginTop: 10 }}>
                Already have an account? <Link to="/login">Log in</Link>
            </div>
        </form>
    );
}
