import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema({
    feeRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentFeeRecord', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },

    method: { type: String, enum: ['Card', 'UPI', 'Net Banking', 'Cash'], required: true },
    transactionId: { type: String, required: true, unique: true },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed },

    status: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Pending' },
    paidAt: { type: Date, default: Date.now },

    // Audit Trail
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }
});

export default mongoose.model('PaymentTransaction', paymentTransactionSchema);
