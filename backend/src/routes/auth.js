import express from 'express';
import bcrypt from 'bcrypt';
import { registerSchema, loginSchema } from '../validators/auth.js';
import User from '../models/User.js';
import { signAuthToken } from '../middleware/auth.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

const router = express.Router();

// Register: create user, no 2FA yet
router.post('/register', async (req, res) => {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const { username, password, profilePictureUrl = ''} = parse.data;
    const exists = await User.findOne({username});
    if (exists) return res.status(409).json({ error: 'Username already taken' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, passwordHash, profilePictureUrl });
    res.status(201).json({ ok: true, user: { username: user.username, profilePictureUrl: user.profilePictureUrl } });
});

// generate TOTP secret + QR
router.post('/totp/setup', async(req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'username required' });

    const user = await User.findOne({username});
    if (!user) return res.status(404).json({ error: 'user not found' });

    const secret = speakeasy.generateSecret({ name: `ShareFit: (${username})`});
    // dont enable yet; user must verify with code
    const otpauth = secret.otpauth_url;
    const qr = await qrcode.toDataURL(otpauth);
    // temporarily return secret; client will POST code to verify
    res.json({ qr, base32: secret.base32 });
});

// verify code and store secret
router.post('totp/verify', async (req, res) => {
    const { username, base32, code } = req.body;
    if (!username || !base32 || !code) return res.status(400).json({ error: 'username, base32, and code required' });

    const user = await User.findOne({username});
    if (!user) return res.status(404).json({ error: 'user not found' });

    const ok = speakeasy.totp.verify({ secret: base32, encoding: 'base32', token: code, window: 1 });
    if (!ok) return res.status(401).json({ error: 'invalid code' });

    user.totp = { secret: base32, enabled: true };
    await user.save();
    res.json({ ok: true });
});

//login: username + password (+TOTP if enabled)
router.post('/login', async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const { username, password, code } = parse.data;
    const user = await User.findOne({username});
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'invalid credentials' });

    if (user.totp.enabled) {
        if (!code) return res.status(400).json({ error: 'TOTP code required'});
        const ok = (code && speakeasy.totp.verify({
            secret: user.totp.secret, encoding: 'base32', token: code, window: 1
        }));
        if (!ok) return res.status(401).json({ error: 'invalid TOTP code' });
    }

    const token = signAuthToken(user);
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    });
    res.json({ ok: true, user: { username: user.username, profilePictureUrl: user.profilePictureUrl}});
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ ok: true });
});

export default router;