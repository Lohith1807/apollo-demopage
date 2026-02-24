import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema({
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // Optional: Can be school-level
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }, // Optional: Can vary by batch
    semesterNumber: { type: Number, required: true },

    baseAmount: { type: Number, required: true },
    components: [{
        label: { type: String, required: true },
        amount: { type: Number, required: true },
        isOptional: { type: Boolean, default: false }
    }],

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Unique structure per scope and semester
feeStructureSchema.index({ university: 1, school: 1, department: 1, batch: 1, semesterNumber: 1 }, { unique: true });

export default mongoose.model('FeeStructure', feeStructureSchema);
