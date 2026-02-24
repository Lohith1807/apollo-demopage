import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    dean: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['Technology', 'Management', 'Health', 'Arts', 'Science', 'Others'], default: 'Technology' },
    createdAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

schoolSchema.virtual('departments', {
    ref: 'Department',
    localField: '_id',
    foreignField: 'school'
});

const School = mongoose.model('School', schoolSchema);
export default School;
