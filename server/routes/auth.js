import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userFound = await User.findOne({ email })
            .populate('university')
            .populate('school')
            .populate('department')
            .populate('batch');

        if (!userFound) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await userFound.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (userFound.status === 'pending') {
            return res.status(403).json({ message: 'Account pending approval' });
        }

        res.json({
            _id: userFound._id,
            name: userFound.name,
            email: userFound.email,
            role: userFound.role,

            // Scalable Hierarchy
            university: userFound.university,
            school: userFound.school,
            department: userFound.department,
            batch: userFound.batch,

            // Legacy display compatibility
            semester: userFound.semester,
            section: userFound.section,
            rollNo: userFound.rollNo || userFound.employeeId || 'N/A',
            id: userFound.rollNo || userFound.employeeId || 'N/A',

            token: generateToken(userFound._id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Auth Fault', error: error.message });
    }
});

// Signup (Submit for approval)
router.post('/signup', async (req, res) => {
    const registrationData = req.body;

    try {
        const userExists = await User.findOne({ email: registrationData.email });
        if (userExists) {
            const msg = userExists.status === 'pending' ? 'Registration already pending approval' : 'User already exists in system';
            return res.status(400).json({ message: msg });
        }

        const newUser = new User({
            ...registrationData,
            role: 'pending',
            status: 'pending',
            submittedAt: new Date()
        });

        await newUser.save();
        res.status(201).json({ message: 'Registration submitted successfully. Pending Admin approval.' });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;
