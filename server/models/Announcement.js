import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Scoping
    scope: { type: String, enum: ['global', 'university', 'school', 'department'], default: 'global' },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

    targetRoles: [{ type: String, enum: ['all', 'registrar', 'dean', 'teacher', 'student'] }],
    createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
