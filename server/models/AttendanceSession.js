import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
    studentEmail: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late', 'Excused', 'Not Marked'], default: 'Present' },
    markedAt: { type: Date, default: Date.now }
}, { _id: false }); // No need for individual ObjectIds for each record

const attendanceSessionSchema = new mongoose.Schema({
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, required: true },
    dateStr: { type: String, required: true },
    time: { type: String, default: '09:00 AM' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    records: [attendanceRecordSchema]
}, { timestamps: true });

// Indexes for ultra-scalability
attendanceSessionSchema.index({ department: 1, batch: 1, subject: 1, date: -1 });
attendanceSessionSchema.index({ department: 1, batch: 1, subject: 1, dateStr: 1, time: 1 }, { unique: true });

export default mongoose.model('AttendanceSession', attendanceSessionSchema);
