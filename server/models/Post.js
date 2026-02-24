import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    author: { type: String, required: true },
    authorRole: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String }, // redundant for display performance

    // Scoping
    scope: { type: String, enum: ['global', 'school', 'department'], default: 'global' },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

    category: { type: String, default: 'University Update' },
    likes: { type: [String], default: [] },
    comments: [commentSchema],
    createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);
export default Post;
