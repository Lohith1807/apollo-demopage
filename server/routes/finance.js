import express from 'express';
import StudentFeeRecord from '../models/StudentFeeRecord.js';
import FinanceService from '../services/FinanceService.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);


router.get('/bill/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const bill = await StudentFeeRecord.findOne({ student: userId })
            .populate('feeStructure')
            .sort({ semesterNumber: -1 });

        if (!bill) return res.status(404).json({ message: 'No active bill found for this student.' });
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/release-batch', authorize(['finance', 'hr', 'registrar']), async (req, res) => {
    try {
        const { studentIds, targetSemester } = req.body;
        const results = [];
        for (const sid of studentIds) {
            try {
                await FinanceService.generateFeeRecord(sid, targetSemester);
                results.push({ studentId: sid, status: 'Success' });
            } catch (err) {
                results.push({ studentId: sid, status: 'Failed', error: err.message });
            }
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/pay', async (req, res) => {
    try {
        const { feeRecordId, amount, method } = req.body;
        const transactionId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

        const result = await FinanceService.processPayment(
            feeRecordId,
            amount,
            method,
            transactionId
        );

        res.json({ message: 'Payment successful', ...result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
