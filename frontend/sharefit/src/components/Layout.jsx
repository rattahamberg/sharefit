import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user, ready, logout } = useAuth();   // ready prevents flicker if you want to use it
    const authed = !!user;

    async function onLogout() {
        await logout();
        navigate('/', { replace: true });
    }

    return (
        <>
            <header style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="container" style={{ display: "flex", alignItems: "center", gap: 16, height: 64 }}>
                    {/* Brand: go to Dashboard when authed, Landing otherwise */}
                    <Link to={authed ? "/dashboard" : "/"} style={{ fontWeight: 700 }}>ShareFit</Link>

                    {/* Top nav only when authed */}
                    {authed && (
                        <nav style={{ display: "flex", gap: 12 }}>
                            <Link to="/dashboard" className={pathname === "/dashboard" ? "active" : undefined}>Dashboard</Link>
                            <Link to="/search" className={pathname.startsWith("/search") ? "active" : undefined}>Search</Link>
                            <Link to="/create" className={pathname === "/create" ? "active" : undefined}>Create</Link>
                        </nav>
                    )}

                    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                        {/* When logged out, show Login/Register (don’t show the link for the current page) */}
                        {!authed && pathname !== "/login" && <Link to="/login" className="btn secondary">Login</Link>}
                        {!authed && pathname !== "/register" && <Link to="/register" className="btn">Register</Link>}

                        {/* When logged in, show Logout */}
                        {authed && <button className="btn secondary" onClick={onLogout}>Logout</button>}
                    </div>
                </div>
            </header>

            <main className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
                {children}
            </main>
        </>
    );
}
