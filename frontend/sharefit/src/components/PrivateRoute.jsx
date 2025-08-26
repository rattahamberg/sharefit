import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ element }) {
    const { user, ready } = useAuth();
    const location = useLocation();

    if (!ready) return null;
    return user
        ? element
        : <Navigate to="/login" replace state={{ from: location }} />;
}
