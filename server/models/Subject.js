import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, enum: ['Theory', 'Practical', 'Project'], default: 'Theory' },
    credits: { type: Number, default: 3 },

    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },

    // The semester this subject is normally offered in
    semester: { type: Number, required: true },

    updatedAt: { type: Date, default: Date.now }
});

// Unique code per university
subjectSchema.index({ university: 1, code: 1 }, { unique: true });
// Fast search by department and semester
subjectSchema.index({ department: 1, semester: 1 });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;

