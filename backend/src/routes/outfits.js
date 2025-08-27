import express from 'express';
import {requireAuth} from '../middleware/auth.js';
import Outfit from '../models/Outfit.js';
import User from '../models/User.js';
import {createOutfitSchema} from '../validators/outfits.js';

const router = express.Router();

// Create
router.post('/', requireAuth, async (req, res) => {
    const parse = createOutfitSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({error: parse.error.flatten()});

    const u = req.user;
    const data = parse.data;

    const outfit = await Outfit.create({
        ...data,
        posterId: u._id,
        posterUsername: u.username,
        posterAvatar: u.profilePictureUrl || ''
    });

    res.status(201).json({outfit});
});

// Read one
router.get('/:id', async (req, res) => {
    const outfit = await Outfit.findById(req.params.id).lean();
    if (!outfit) return res.status(404).json({error: 'Not found'});
    res.json({outfit});
});

// Read mine (dashboard posted)
router.get('/mine/list', requireAuth, async (req, res) => {
    const outfits = await Outfit.find({posterId: req.user._id})
        .sort({createdAt: -1}).limit(100).lean();
    res.json({outfits});
});

// Save / Unsave
router.post('/:id/save', requireAuth, async (req, res) => {
    const id = req.params.id;
    await User.updateOne({_id: req.user._id}, {$addToSet: {savedOutfitIds: id}});
    res.json({ok: true});
});

router.post('/:id/unsave', requireAuth, async (req, res) => {
    const id = req.params.id;
    await User.updateOne({_id: req.user._id}, {$pull: {savedOutfitIds: id}});
    res.json({ok: true});
});

// Rate: like (=+1) or dislike (=-1)
router.post('/:id/rate', requireAuth, async (req, res) => {
    const {value} = req.body; // expect 1 or -1 or 0 to clear
    if (![1, -1, 0].includes(value)) return res.status(400).json({error: 'value must be 1, -1, or 0'});

    const outfit = await Outfit.findById(req.params.id);
    if (!outfit) return res.status(404).json({error: 'Not found'});

    if (value === 0) {
        outfit.votes.delete(String(req.user._id));
    } else {
        outfit.votes.set(String(req.user._id), value);
    }

    // recompute rating
    let sum = 0;
    for (const v of outfit.votes.values()) sum += v;
    outfit.rating = sum;

    await outfit.save();
    res.json({rating: outfit.rating});
});

// Comment
router.post('/:id/comments', requireAuth, async (req, res) => {
    const {text, parentId} = req.body;
    if (!text || !text.trim()) return res.status(400).json({error: 'text required'});

    const outfit = await Outfit.findById(req.params.id);
    if (!outfit) return res.status(404).json({error: 'Not found'});

    // if replying, parent must exist in this outfit
    if (parentId) {
        const hasParent = outfit.comments.some(c => String(c._id) === String(parentId));
        if (!hasParent) return res.status(400).json({error: 'Parent comment not found'});
    }

    outfit.comments.push({
        userId: req.user._id,
        username: req.user.username,
        profilePictureUrl: req.user.profilePictureUrl || '',
        text: text.trim(),
        parentId: parentId ?? null
    });

    await outfit.save();
    const created = outfit.comments[outfit.comments.length - 1];
    res.status(201).json({comment: created});
});

// Delete my own comment (soft delete)
router.delete('/:id/comments/:commentId', requireAuth, async (req, res) => {
    const {id, commentId} = req.params;
    const outfit = await Outfit.findById(id);
    if (!outfit) return res.status(404).json({error: 'Not found'});

    const c = outfit.comments.id(commentId);
    if (!c) return res.status(404).json({error: 'Comment not found'});
    if (String(c.userId) !== String(req.user._id)) {
        return res.status(403).json({error: 'You can only delete your own comment'});
    }
    c.deleted = true;
    c.text = '[deleted]';
    c.username = '[deleted]';
    c.profilePictureUrl = '';
    await outfit.save();
    res.json({ok: true});
});

// Batched: get the current user's vote for many outfits
router.post('/votes', requireAuth, async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (!ids.length) return res.json({votes: {}});
    const docs = await Outfit.find(
        {_id: {$in: ids}},
        {_id: 1, votes: 1}
    ).lean();
    const uid = String(req.user._id);
    const out = {};
    for (const d of docs) {
        const map = d.votes || {};
        const val = (map instanceof Map) ? map.get(uid) : map[uid];
        out[String(d._id)] = typeof val === 'number' ? val : 0;
    }
    res.json({votes: out});
});

// Search: ?q=&tag=&poster=
router.get('/', async (req, res) => {
    const {q, tag, poster} = req.query;
    const filter = {};
    if (q) filter.$text = {$search: q};
    if (tag) filter.tags = tag;
    if (poster) filter.posterUsername = poster;

    // safe regex helper
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (poster) filter.posterUsername = {$regex: new RegExp(`^${esc(poster)}$`, 'i')};
    if (tag) filter.tags = {$elemMatch: {$regex: new RegExp(`^${esc(tag)}$`, 'i')}};

    const outfits = await Outfit.find(filter).sort({createdAt: -1}).limit(100).lean();
    res.json({outfits});
});

export default router;
