const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video'] },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, expires: 24 * 3600 }
}, { timestamps: true })


const Story = mongoose.model('Story', storySchema)
module.exports = Story;