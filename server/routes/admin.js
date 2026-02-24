import express from 'express';
import User from '../models/User.js';
import AttendanceSession from '../models/AttendanceSession.js';
import Subject from '../models/Subject.js';
import Exam from '../models/Exam.js';
import University from '../models/University.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// Apply protection to all admin routes
router.use(protect);
router.use(authorize(['admin', 'dean', 'registrar']));

// 1. GET Scoped Stats
router.get('/stats', async (req, res) => {
    try {
        const { universityId, schoolId } = req.query;
        let query = {};

        if (universityId) query.university = universityId;
        if (schoolId) query.school = schoolId;

        const studentCount = await User.countDocuments({ ...query, role: 'student', status: 'approved' });
        const facultyCount = await User.countDocuments({ ...query, role: 'teacher' });
        const pendingApplications = await User.countDocuments({ ...query, status: 'pending' });

        res.json({
            totalStudents: studentCount,
            totalFaculty: facultyCount,
            pendingApplications: pendingApplications,
            systemHealth: "Optimal"
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// 2. GET SUBJECTS (Scoped)
router.get('/subjects', async (req, res) => {
    try {
        const { departmentId } = req.query;
        const query = departmentId ? { department: departmentId } : {};
        const subjects = await Subject.find(query).populate('department');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// 3. APPROVAL LOGIC (Multi-tenant)
router.post('/approve', async (req, res) => {
    const { userId, universityId, schoolId, departmentId, batchId } = req.body;
    try {
        const student = await User.findById(userId);
        if (!student) return res.status(404).json({ message: 'User not found' });

        // Robust Roll Number Generation logic
        // Using a combination of dynamic code or random sequence
        const rand = Math.floor(1000 + Math.random() * 9000);
        const rollNo = `TAU${new Date().getFullYear()}${rand}`;

        student.status = 'approved';
        student.role = 'student';
        student.rollNo = rollNo;
        // Assign to provided hierarchy or keep current
        if (universityId) student.university = universityId;
        if (schoolId) student.school = schoolId;
        if (departmentId) student.department = departmentId;
        if (batchId) student.batch = batchId;

        await student.save();
        res.json({ message: 'Student successfully onboarded', rollNo });
    } catch (error) {
        res.status(500).json({ message: 'Onboarding failed', error: error.message });
    }
});

// 4. DIRECTORY (Scoped)
router.get('/directory', async (req, res) => {
    try {
        const { role, universityId, schoolId, departmentId } = req.query;
        let query = { status: 'approved' };
        if (role) query.role = role;
        if (universityId) query.university = universityId;
        if (schoolId) query.school = schoolId;
        if (departmentId) query.department = departmentId;

        const users = await User.find(query)
            .populate('university', 'name')
            .populate('school', 'name')
            .populate('department', 'name')
            .populate('batch', 'year');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Directory fetch failed', error: error.message });
    }
});

// 5. EXAM MANAGEMENT
router.get('/exams', async (req, res) => {
    try {
        const { schoolId } = req.query;
        const query = schoolId ? { school: schoolId } : {};
        const exams = await Exam.find(query).populate('subjects').sort({ createdAt: -1 });
        res.json(exams);
    } catch {
        res.status(500).json({ message: 'Exam fetch error' });
    }
});

router.post('/exams', async (req, res) => {
    try {
        const exam = new Exam(req.body);
        await exam.save();
        res.json({ success: true, data: exam });
    } catch (error) {
        res.status(500).json({ message: 'Exam creation failed', error: error.message });
    }
});

router.delete('/exams/:id', async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Exam deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Exam deletion failed', error: error.message });
    }
});

// 6. STUDENT UPDATE
router.put('/student/:id', async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Student not found' });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Student update failed', error: error.message });
    }
});

// 7. FACULTY MANAGEMENT
router.post('/faculty', async (req, res) => {
    try {
        const faculty = new User({ ...req.body, role: 'teacher', status: 'approved' });
        await faculty.save();
        res.json({ success: true, data: faculty });
    } catch (error) {
        res.status(500).json({ message: 'Faculty creation failed', error: error.message });
    }
});

router.put('/faculty', async (req, res) => {
    try {
        const { userId, ...updates } = req.body;
        const updated = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!updated) return res.status(404).json({ message: 'Faculty not found' });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Faculty update failed', error: error.message });
    }
});

// 8. SUBJECT MANAGEMENT
router.put('/subjects', async (req, res) => {
    try {
        const { subjects } = req.body;
        const ops = subjects.map(sub => ({
            updateOne: {
                filter: { _id: sub._id },
                update: { $set: sub },
                upsert: true
            }
        }));
        await Subject.bulkWrite(ops);
        res.json({ success: true, message: 'Subjects updated' });
    } catch (error) {
        res.status(500).json({ message: 'Subject update failed', error: error.message });
    }
});

// 9. REJECT REGISTRATION
router.delete('/approve/:id', async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, message: 'Registration rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: 'Rejection failed', error: error.message });
    }
});

export default router;
