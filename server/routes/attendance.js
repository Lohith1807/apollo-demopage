import express from 'express';
import AttendanceSession from '../models/AttendanceSession.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// REPORT route — MUST be before /:userId to avoid being caught by the catch-all param
router.get('/report', protect, authorize(['admin', 'teacher', 'dean', 'registrar']), async (req, res) => {
    try {
        const { departmentId, batchId, subjectId, from, to } = req.query;
        let query = {};
        if (departmentId) query.department = departmentId;
        if (batchId) query.batch = batchId;
        if (subjectId) query.subject = subjectId;
        if (from || to) {
            query.date = {};
            if (from) query.date.$gte = new Date(from);
            if (to) query.date.$lte = new Date(to);
        }

        const sessions = await AttendanceSession.find(query)
            .populate('subject', 'name code')
            .populate('batch', 'year section')
            .sort({ date: -1 })
            .limit(100);

        res.json({ success: true, data: sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Report fetch error', error: error.message });
    }
});

// 1. GET ATTENDANCE (Personal) - Scoped by User ID
router.get('/:userId', protect, async (req, res) => {
    try {
        const userId = req.params.userId;
        // Ensure user is fetching their own data or is higher role
        if (req.user._id.toString() !== userId && req.user.role === 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const userFound = await User.findById(userId);
        if (!userFound) return res.status(404).json({ message: 'User not found' });

        const sessions = await AttendanceSession.find({
            "records.studentEmail": userFound.email // Fallback or use student ID
        }).populate('subject').sort({ date: -1 });

        const allLogs = sessions.map(session => {
            const studentRecord = session.records.find(r => r.studentEmail === userFound.email);
            return {
                _id: session._id,
                date: `${session.dateStr} ${session.time}`,
                status: studentRecord ? studentRecord.status : 'Not Marked',
                subject: session.subject?.name || 'Unknown',
                department: session.department,
                batch: session.batch
            };
        });

        res.json(allLogs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// 2. CREATE / UPDATE SESSION (Relational & Scoped)
router.post('/mark', protect, authorize(['teacher', 'dean', 'registrar']), async (req, res) => {
    const { departmentId, batchId, subjectId, dateStr, time, instructorId, records } = req.body;

    try {
        const dateObj = new Date(dateStr || new Date().toISOString().split('T')[0]);
        const reqTime = time || '09:00 AM';

        const session = await AttendanceSession.findOneAndUpdate(
            { department: departmentId, batch: batchId, subject: subjectId, dateStr, time: reqTime },
            {
                $set: {
                    date: dateObj,
                    instructor: instructorId,
                    records
                }
            },
            { new: true, upsert: true }
        );

        res.json({ message: 'Attendance marked successfully!', session });
    } catch (error) {
        res.status(500).json({ message: 'Marking failed', error: error.message });
    }
});

export default router;
