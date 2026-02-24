import StudentFeeRecord from '../models/StudentFeeRecord.js';
import ScholarshipRule from '../models/ScholarshipRule.js';
import ExamResult from '../models/ExamResult.js';
import FeeStructure from '../models/FeeStructure.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

class FinanceService {
    /**
     * Calculates scholarship percentage based on latest semester results
     */
    async calculateScholarship(studentId, semesterNumber) {
        const results = await ExamResult.find({ student: studentId, semester: semesterNumber });
        if (results.length === 0) return 0;

        const totalEarned = results.reduce((acc, curr) => acc + curr.total, 0);
        const totalMax = results.length * 100; // Assuming 100 is max per subject
        const percentage = (totalEarned / totalMax) * 100;

        const student = await User.findById(studentId);

        // Find matching rule (ordered by priority/minPercentage)
        const rule = await ScholarshipRule.findOne({
            university: student.university,
            minPercentage: { $lte: percentage },
            maxPercentage: { $gte: percentage },
            isActive: true
        }).sort({ minPercentage: -1 });

        return rule ? rule.discountPercentage : 0;
    }

    /**
     * HR releases the fee record for a student for the upcoming semester
     */
    async generateFeeRecord(studentId, targetSemester) {
        const student = await User.findById(studentId);

        const structure = await FeeStructure.findOne({
            school: student.school,
            semesterNumber: targetSemester,
            isActive: true
        });

        if (!structure) throw new Error(`No active fee structure found for Semester ${targetSemester}`);

        const scholarshipPercent = await this.calculateScholarship(studentId, targetSemester - 1);
        const scholarshipAmt = (structure.baseAmount * scholarshipPercent) / 100;
        const netPayable = structure.baseAmount - scholarshipAmt;

        const feeRecord = await StudentFeeRecord.findOneAndUpdate(
            { student: studentId, semesterNumber: targetSemester },
            {
                feeStructure: structure._id,
                totalBaseAmount: structure.baseAmount,
                scholarshipPercentage: scholarshipPercent,
                scholarshipAmount: scholarshipAmt,
                netPayable: netPayable,
                dueAmount: netPayable,
                status: 'Pending',
                releasedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return feeRecord;
    }

    /**
     * Processes a payment and updates student eligibility atomically
     */
    async processPayment(feeRecordId, amount, method, transactionId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const record = await StudentFeeRecord.findById(feeRecordId).session(session);
            if (!record) throw new Error('Fee record not found');

            // 1. Create Transaction
            const transaction = await PaymentTransaction.create([{
                feeRecord: feeRecordId,
                student: record.student,
                amount: amount,
                method: method,
                transactionId: transactionId,
                status: 'Success'
            }], { session });

            // 2. Update Record
            record.paidAmount += amount;
            record.dueAmount -= amount;
            if (record.dueAmount <= 0) {
                record.status = 'Paid';
                record.dueAmount = 0;
            } else {
                record.status = 'Partially Paid';
            }
            await record.save({ session });

            // 3. Update Student Eligibility if fully paid
            if (record.status === 'Paid') {
                await User.findByIdAndUpdate(record.student, { isEligibleForNextSemester: true }, { session });
            }

            await session.commitTransaction();
            return { record, transaction: transaction[0] };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

export default new FinanceService();
