import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['registrar', 'dean', 'admin', 'coe', 'teacher', 'student', 'pending', 'finance', 'hr'],
        default: 'student'
    },
    // Academic progression
    currentSemester: { type: Number, default: 1 },
    academicStatus: { type: String, enum: ['Active', 'On Break', 'Probation', 'Completed'], default: 'Active' },

    // Scoping
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },

    rollNo: { type: String },
    employeeId: { type: String },
    section: { type: String },

    // Next semester eligibility (controlled by finance)
    isEligibleForNextSemester: { type: Boolean, default: false },
    backlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],

    // Profile fields
    phone: { type: String },
    dob: { type: String },
    gender: { type: String },
    address: { type: String },

    // Faculty specific
    assignedBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    assignedSubjects: [{
        subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }
    }],

    // Lifecycle
    status: { type: String, enum: ['approved', 'pending'], default: 'approved' },
    submittedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
