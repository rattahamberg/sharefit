import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    link: {type: String, required: true},
    imageUrl: {type: String, default: ''}
}, {_id: false});

const commentSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    username: {type: String, required: true}, // denormalized for quick display
    profilePictureUrl: {type: String, default: ''},
    text: {type: String, required: true},
    parentId: {type: mongoose.Schema.Types.ObjectId, default: null}, // null = top-level
    deleted: {type: Boolean, default: false}
}, {timestamps: true});

const outfitSchema = new mongoose.Schema({
    title: {type: String, required: true, index: 'text'},
    description: {type: String, default: ''},
    items: {type: [itemSchema], default: []},
    pictures: {type: [String], default: []},
    tags: {type: [String], default: [], index: true},

    posterId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    posterUsername: {type: String, required: true},
    posterAvatar: {type: String, default: ''},

    // votes: Map<userId, +1 | -1>
    votes: {type: Map, of: Number, default: {}},
    rating: {type: Number, default: 0},

    comments: {type: [commentSchema], default: []}
}, {timestamps: true});

outfitSchema.index({posterUsername: 1});

export default mongoose.model('Outfit', outfitSchema);
