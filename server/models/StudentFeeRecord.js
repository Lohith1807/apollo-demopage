import mongoose from 'mongoose';

const studentFeeRecordSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semesterNumber: { type: Number, required: true },
    feeStructure: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },

    // Financial Snapshots (immutable once released)
    totalBaseAmount: { type: Number, required: true },
    scholarshipPercentage: { type: Number, default: 0 },
    scholarshipAmount: { type: Number, default: 0 },
    lateFee: { type: Number, default: 0 },
    netPayable: { type: Number, required: true },

    // Tracking
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },

    status: {
        type: String,
        enum: ['Unreleased', 'Pending', 'Partially Paid', 'Paid'],
        default: 'Unreleased'
    },

    releasedAt: { type: Date },
    dueDate: { type: Date },
    lastPaymentAt: { type: Date },

    createdAt: { type: Date, default: Date.now }
});

// Avoid duplicate records for same student/semester
studentFeeRecordSchema.index({ student: 1, semesterNumber: 1 }, { unique: true });

export default mongoose.model('StudentFeeRecord', studentFeeRecordSchema);
