import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Outfit from '../models/Outfit.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
    const { _id, username, profilePictureUrl, savedOutfitIds } = req.user;
    res.json({ id: _id, username, profilePictureUrl, savedOutfitIds});
});

// saved outfits

router.get('/me/saved', requireAuth, async (req, res) => {
   const user = await User.findById(req.user._id).lean();
   const ids = user?.savedOutfitIds ?? [];
   if (!ids.length) return res.json({ outfits: [] });
   const outfits = await Outfit.find({_id: { $in: ids }})
       .sort({ createdAt: -1 })
       .lean();
   res.json({ outfits });
});

export default router;
