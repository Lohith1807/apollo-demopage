import mongoose from 'mongoose';

const examConfigSchema = new mongoose.Schema({
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    semester: { type: String, required: true },
    published: { type: Boolean, default: false }
});

examConfigSchema.index({ department: 1, batch: 1, semester: 1 }, { unique: true });

const ExamConfig = mongoose.model('ExamConfig', examConfigSchema);
export default ExamConfig;
