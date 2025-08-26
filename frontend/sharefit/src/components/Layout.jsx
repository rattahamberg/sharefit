import {Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
    const { pathname } = useLocation();
    const authed = false;
    return (
        <>
            <header style={{borderBottom: "1px solid var(--border)"}}>
                <div className="container" style={{ display: "flex", alignItems: "center", gap: 16, height: 64}}>
                    <Link to="/" style={{ fontWeight: 700 }}>ShareFit</Link>
                    {authed && (
                        <nav style={{ display: "flex", gap: 12 }}>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/search">Search</Link>
                            <Link to="/create">Create</Link>
                        </nav>
                    )}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                        {!authed && pathname !== "/login" && <Link to="/login" className="btn secondary">Login</Link>}
                        {!authed && pathname !== "/register" && <Link to="/register" className="btn">Register</Link>}
                    </div>
                </div>
            </header>
            <main className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>{children}</main>
        </>
    )
}