import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

    // Scoping for fast retrieval
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

    internal: { type: Number, default: 0 },
    external: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    grade: { type: String, default: 'F' },
    credits: { type: Number, default: 3 },
    semester: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
});

examResultSchema.index({ student: 1, course: 1 }, { unique: true });

const ExamResult = mongoose.model('ExamResult', examResultSchema);
export default ExamResult;
