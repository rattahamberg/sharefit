import jwt from 'jsonwebtoken';
import { CONFIG } from '../config.js';
import User from '../models/User.js';

export function signAuthToken(user) {
    return jwt.sign({ uid: user._id, username: user.username }, CONFIG.JWT_SECRET, { expiresIn: '2h'});
}

export async function requireAuth(req, res, next) {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ error: "Not authenticated" });
        const payload = jwt.verify(token, CONFIG.JWT_SECRET);
        req.user = await User.findById(payload.uid).lean();
        if (!req.user) return res.status(401).json({ error: "Invalid user" });
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}