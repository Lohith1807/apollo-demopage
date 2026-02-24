import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/posts/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Get scoped posts
router.get('/', async (req, res) => {
    try {
        const { schoolId, universityId, deptId } = req.query;

        let query = { scope: 'global' };

        if (deptId) {
            query = { $or: [{ scope: 'global' }, { department: deptId }] };
        } else if (schoolId) {
            query = { $or: [{ scope: 'global' }, { school: schoolId }] };
        } else if (universityId) {
            query = { $or: [{ scope: 'global' }, { university: universityId }] };
        }

        const posts = await Post.find(query)
            .populate('author', 'name role')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create a post with hierarchy scoping
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, content, email, scope, schoolId, departmentId } = req.body;
        const user = await User.findOne({ email });

        if (!user || !['admin', 'teacher', 'dean', 'registrar'].includes(user.role)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const imagePath = req.file ? `/uploads/posts/${req.file.filename}` : null;

        const post = new Post({
            title,
            content,
            image: imagePath,
            author: user._id,
            authorName: user.name,
            scope: scope || 'global',
            university: user.university,
            school: schoolId || user.school,
            department: departmentId || user.department
        });

        await post.save();
        res.json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Like a post
router.post('/:id/like', async (req, res) => {
    try {
        const { email } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const index = post.likes.indexOf(email);
        if (index === -1) {
            post.likes.push(email);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Comment on a post (Raise doubts/questions)
router.post('/:id/comment', async (req, res) => {
    try {
        const { content, email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        post.comments.push({
            author: user.name,
            authorRole: user.role,
            content
        });

        await post.save();
        res.json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
