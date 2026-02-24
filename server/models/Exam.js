import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['Internal', 'Semester', 'Practical', 'Others'], default: 'Semester' },

    // Scoping
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

    batchYear: { type: String }, // redundant for display
    semester: { type: String },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    dateRange: { type: String },
    status: { type: String, enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'], default: 'Scheduled' },
    createdAt: { type: Date, default: Date.now }
});

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
