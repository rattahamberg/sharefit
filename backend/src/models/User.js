import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, index:true, required: true, trim: true },
    passwordHash: { type: String, required: true },
    profilePictureUrl: {type: String, default: ''},

    totp: {
        secret: {type: String, default: ''},
        enabled: {type: Boolean, default: false}
    },

    savedOutfitIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Outfit'}] },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);
