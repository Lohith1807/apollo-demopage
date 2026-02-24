import express from 'express';
import ExamResult from '../models/ExamResult.js';
import ExamConfig from '../models/ExamConfig.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// GET PUBLISH STATUS — must be before /:userId catch-all
router.get('/publish-status', protect, authorize(['coe', 'dean', 'registrar']), async (req, res) => {
    try {
        const configs = await ExamConfig.find({});
        // Build a nested object: { batch: { semester: { published } } }
        const result = {};
        for (const config of configs) {
            const batchKey = config.batch?.toString() || 'unknown';
            const semKey = config.semester || 'Sem 1';
            if (!result[batchKey]) result[batchKey] = {};
            result[batchKey][semKey] = { published: config.published || false };
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch publish status', error: err.message });
    }
});

// BATCH VIEW RESULTS — must be before /:userId catch-all
router.post('/batch-view', protect, authorize(['teacher', 'coe', 'dean', 'registrar']), async (req, res) => {
    try {
        const { students, subject } = req.body;
        // students: array of email addresses; subject: subject name or ID
        const users = await User.find({ email: { $in: students } }, '_id email');
        const userMap = {};
        users.forEach(u => { userMap[u.email] = u._id; });

        const studentIds = Object.values(userMap);
        const results = await ExamResult.find({
            student: { $in: studentIds },
            course: subject
        });

        // Map results back to emails
        const reverseMap = {};
        users.forEach(u => { reverseMap[u._id.toString()] = u.email; });

        const output = {};
        results.forEach(r => {
            const email = reverseMap[r.student.toString()];
            if (email) {
                output[email] = {
                    internal: r.internal || 0,
                    external: r.external || 0,
                    total: r.total || 0,
                    grade: r.grade || 'F',
                    code: r.code || ''
                };
            }
        });

        res.json(output);
    } catch (err) {
        res.status(500).json({ message: 'Batch view failed', error: err.message });
    }
});

// 1. GET RESULTS (Student view)
router.get('/:userId', protect, async (req, res) => {
    try {
        const userId = req.params.userId;
        // Ensure user is fetching their own data or is higher role
        if (req.user._id.toString() !== userId && req.user.role === 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const userFound = await User.findById(userId);
        if (!userFound) return res.status(404).json({ message: 'User not found' });

        let results = await ExamResult.find({ student: userId }).populate('course');

        if (userFound.role === 'student') {
            const config = await ExamConfig.findOne({
                department: userFound.department,
                batch: userFound.batch
            });

            results = results.map(r => {
                const isPub = config?.published || false;
                if (!isPub) {
                    return {
                        _id: r._id,
                        course: r.course,
                        internal: r.internal,
                        external: 'N/A',
                        total: 'N/A',
                        grade: 'Pending',
                        status: 'Unpublished'
                    };
                }
                return r;
            });
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching results', error: err.message });
    }
});

// 2. BATCH UPDATE (Teacher/Registrar)
router.post('/batch-update', protect, authorize(['teacher', 'dean', 'registrar']), async (req, res) => {
    try {
        const { records, subjectId } = req.body;
        // records: [{ studentId, internal, external, ... }]

        const ops = records.map(rec => ({
            updateOne: {
                filter: { student: rec.studentId, course: subjectId },
                update: { $set: { ...rec, updatedAt: new Date() } },
                upsert: true
            }
        }));

        await ExamResult.bulkWrite(ops);
        res.json({ message: 'Marks successfully synchronized' });
    } catch (err) {
        res.status(500).json({ message: 'Update failed', error: err.message });
    }
});

// 3. PUBLISH CONFIG
router.post('/publish', protect, authorize(['dean', 'registrar']), async (req, res) => {
    try {
        const { deptId, batchId, semester, status } = req.body;
        await ExamConfig.findOneAndUpdate(
            { department: deptId, batch: batchId, semester },
            { published: status },
            { upsert: true }
        );
        res.json({ message: 'Publish status updated' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to publish', error: err.message });
    }
});

export default router;
