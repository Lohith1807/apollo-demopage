import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    headOfDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

departmentSchema.virtual('batches', {
    ref: 'Batch',
    localField: '_id',
    foreignField: 'department'
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
