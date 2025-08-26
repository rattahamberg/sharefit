import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
    const { username, profilePictureUrl, savedOutfitIds } = req.user;
    res.json({ username, profilePictureUrl, savedOutfitIds });
});

export default router;
