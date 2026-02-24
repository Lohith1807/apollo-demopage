import express from 'express';
import AcademicService from '../services/AcademicService.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

/**
 * 1. GET Current Semester Subjects
 */
router.get('/subjects', async (req, res) => {
    try {
        const student = await User.findById(req.user.id);
        const subjects = await Subject.find({
            department: student.department,
            semester: student.currentSemester
        });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * 2. PROMOTE (Self-service if eligible)
 */
router.post('/promote', async (req, res) => {
    try {
        const result = await AcademicService.promoteStudent(req.user.id);
        res.json({ message: 'Promoted to next semester successfully!', ...result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
