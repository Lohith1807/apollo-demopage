import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    year: { type: String, required: true }, // e.g. 2024
    section: { type: String }, // e.g. A, B
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    academicYears: { type: String }, // e.g. 2024-2028
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
