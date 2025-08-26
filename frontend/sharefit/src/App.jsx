import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TwoFASetup from "./pages/TwoFASetup";
import TwoFAVerify from "./pages/TwoFAVerify";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import OutfitView from "./pages/OutfitView";
import CreateOutfit from "./pages/CreateOutfit";
import Layout from "./components/Layout";

const isAuthed = false;

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/2fa/setup" element={<TwoFASetup />} />
                <Route path="/2fa/verify" element={<TwoFAVerify />} />

                {/* Protected Routes */}

                <Route
                    path="/dashboard"
                    element={isAuthed ? <Dashboard /> : <Navigate to="/login" replace/>}
                />
                <Route
                    path="/search"
                    element={isAuthed ? <Search /> : <Navigate to="/login" replace/>}
                />
                <Route
                    path="/outfits/:id"
                    element={isAuthed ? <OutfitView /> : <Navigate to="/login" replace/>}
                />
                <Route
                    path="/create"
                    element={isAuthed ? <CreateOutfit /> : <Navigate to="/login" replace/>}
                />

                <Route path="*" element={<Navigate to="/" replace/>} />
            </Routes>
        </Layout>
    )
}