import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    location: { type: String },
    establishedYear: { type: Number },
    registrar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

universitySchema.virtual('schools', {
    ref: 'School',
    localField: '_id',
    foreignField: 'university'
});

const University = mongoose.model('University', universitySchema);
export default University;
