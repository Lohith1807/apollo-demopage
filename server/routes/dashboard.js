import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import AttendanceSession from '../models/AttendanceSession.js';

const router = express.Router();

// Everyone
router.get('/:role', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let stats = { welcome: `Welcome, ${user.name}` };

        if (user.role === 'student') {
            const sessions = await AttendanceSession.find({ "records.studentEmail": user.email });
            let total = 0, present = 0;
            sessions.forEach(s => {
                const rec = s.records.find(r => r.studentEmail === user.email);
                if (rec) {
                    total++;
                    if (rec.status === 'Present') present++;
                }
            });
            stats.attendance = total > 0 ? `${Math.round((present / total) * 100)}%` : '0%';
            stats.gpa = 8.85; // Placeholder
        } else if (['teacher', 'dean', 'registrar', 'admin'].includes(user.role)) {
            const query = {};
            if (user.role === 'dean') query.school = user.school;
            if (user.role === 'registrar') query.university = user.university;

            stats.totalStudents = await User.countDocuments({ ...query, role: 'student', status: 'approved' });
            stats.activeCourses = 12; // Placeholder
        }

        res.json({ success: true, data: stats });
    } catch {
        res.status(500).json({ status: false, message: 'Dashboard error' });
    }
});

export default router;
