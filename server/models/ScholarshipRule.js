import mongoose from 'mongoose';

const scholarshipRuleSchema = new mongoose.Schema({
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }, // Optional: School specific rule
    name: { type: String, required: true },
    minPercentage: { type: Number, required: true },
    maxPercentage: { type: Number, required: true },
    discountPercentage: { type: Number, required: true }, // e.g., 50 for 50%
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Ensure no overlapping brackets per university/school could be complex, 
// for now unique name per scope
scholarshipRuleSchema.index({ university: 1, school: 1, minPercentage: 1 }, { unique: true });

export default mongoose.model('ScholarshipRule', scholarshipRuleSchema);
