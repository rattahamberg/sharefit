import express from 'express';
import {requireAuth} from '../middleware/auth.js';
import User from '../models/User.js';
import Outfit from '../models/Outfit.js';
import {updateUserSchema} from '../validators/users.js';
import {signAuthToken} from '../middleware/auth.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
    const {_id, username, profilePictureUrl, savedOutfitIds} = req.user;
    res.json({id: _id, username, profilePictureUrl, savedOutfitIds});
});

// saved outfits

router.get('/me/saved', requireAuth, async (req, res) => {
    const user = await User.findById(req.user._id).lean();
    const ids = user?.savedOutfitIds ?? [];
    if (!ids.length) return res.json({outfits: []});
    const outfits = await Outfit.find({_id: {$in: ids}})
        .sort({createdAt: -1})
        .lean();
    res.json({outfits});
});

// Update my profile: username and/or profile picture URL
router.patch('/me', requireAuth, async (req, res) => {
    const parse = updateUserSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({error: parse.error.flatten()});
    const {username, profilePictureUrl} = parse.data;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({error: 'User not found'});
    // If changing username, ensure uniqueness
    if (username && username !== user.username) {
        const taken = await User.findOne({username});
        if (taken) return res.status(409).json({error: 'Username already taken'});
        user.username = username;
    }
    if (typeof profilePictureUrl !== 'undefined') {
        user.profilePictureUrl = profilePictureUrl || '';
    }
    await user.save();

    // Cascade to outfits and comments
    const newName = user.username;
    const newAvatar = user.profilePictureUrl || '';
    const uid = user._id;

    // Update posted outfits
    await Outfit.updateMany(
        {posterId: uid},
        {$set: {posterUsername: newName, posterAvatar: newAvatar}}
    );

    // Update comments by this user across all outfits
    await Outfit.updateMany(
        {"comments.userId": uid},
        {
            $set: {
                "comments.$[c].username": newName,
                "comments.$[c].profilePictureUrl": newAvatar
            }
        },
        {arrayFilters: [{"c.userId": uid}]}
    );

    // Re-issue JWT so token.username matches
    const token = signAuthToken(user);
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false // set true in prod over HTTPS
    });

    res.json({id: user._id, username: user.username, profilePictureUrl: user.profilePictureUrl});
});

export default router;
