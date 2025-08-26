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
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
    return (
        <AuthProvider>
            <Layout>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/2fa/setup" element={<TwoFASetup />} />
                    <Route path="/2fa/verify" element={<TwoFAVerify />} />

                    {/* Protected */}
                    <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
                    <Route path="/search" element={<PrivateRoute element={<Search />} />} />
                    <Route path="/outfits/:id" element={<PrivateRoute element={<OutfitView />} />} />
                    <Route path="/create" element={<PrivateRoute element={<CreateOutfit />} />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </AuthProvider>
    );
}
