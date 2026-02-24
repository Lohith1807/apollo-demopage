import express from 'express';
import University from '../models/University.js';
import School from '../models/School.js';
import Department from '../models/Department.js';
import Batch from '../models/Batch.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// Get Full Hierarchy (Public/Onboarding)
router.get('/hierarchy', async (req, res) => {
    try {
        const hierarchy = await University.find().populate({
            path: 'schools',
            populate: {
                path: 'departments',
                populate: {
                    path: 'batches'
                }
            }
        });
        res.json({ success: true, data: hierarchy });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Registrar Level Access
router.post('/university', protect, authorize(['registrar']), async (req, res) => {
    try {
        const university = new University(req.body);
        await university.save();
        res.json({ success: true, data: university });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/school', protect, authorize(['registrar']), async (req, res) => {
    try {
        const school = new School(req.body);
        await school.save();
        res.json({ success: true, data: school });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Dean Level Access
router.post('/department', protect, authorize(['registrar', 'dean']), async (req, res) => {
    try {
        const dept = new Department(req.body);
        await dept.save();
        res.json({ success: true, data: dept });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/batch', protect, authorize(['registrar', 'dean']), async (req, res) => {
    try {
        const batch = new Batch(req.body);
        await batch.save();
        res.json({ success: true, data: batch });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
