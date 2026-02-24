import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import University from '../models/University.js';
import School from '../models/School.js';
import Department from '../models/Department.js';
import Batch from '../models/Batch.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import ExamResult from '../models/ExamResult.js';
import ScholarshipRule from '../models/ScholarshipRule.js';
import FeeStructure from '../models/FeeStructure.js';
import FinanceService from '../services/FinanceService.js';
import AcademicService from '../services/AcademicService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seed = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apollo_db');
        console.log('--- SYSTEM RE-EVALUATION SEED START ---');

        // 1. Core Hierarchy
        console.log('Setting up hierarchy...');
        const uni = await University.findOneAndUpdate(
            { name: 'The Apollo University' },
            { name: 'The Apollo University', code: 'TAU_GLOBAL' },
            { upsert: true, new: true }
        );

        const school = await School.findOneAndUpdate(
            { name: 'School of Technology' },
            { name: 'School of Technology', university: uni._id, code: 'TECH_01', type: 'Technology' },
            { upsert: true, new: true }
        );

        const dept = await Department.findOneAndUpdate(
            { name: 'Computer Science' },
            { name: 'Computer Science', school: school._id, code: 'CSE_01' },
            { upsert: true, new: true }
        );

        const batch = await Batch.findOneAndUpdate(
            { year: '2024-2028' },
            { year: '2024-2028', department: dept._id },
            { upsert: true, new: true }
        );
        console.log('Hierarchy OK.');

        // 2. Scholarship Rules
        console.log('Seeding scholarship rules...');
        await ScholarshipRule.deleteMany({ university: uni._id });
        await ScholarshipRule.create([
            { university: uni._id, name: 'Gold Medal', minPercentage: 90, maxPercentage: 100, discountPercentage: 50 },
            { university: uni._id, name: 'Silver Medal', minPercentage: 80, maxPercentage: 89, discountPercentage: 25 }
        ]);
        console.log('Scholarship Rules OK.');

        // 3. Fee Structure for NEXT Semester (Semester 2)
        console.log('Seeding fee structure...');
        await FeeStructure.deleteMany({ school: school._id, semesterNumber: 2 });
        await FeeStructure.create({
            university: uni._id,
            school: school._id,
            department: dept._id,
            semesterNumber: 2,
            baseAmount: 100000,
            components: [
                { label: 'Lab Fee', amount: 5000 },
                { label: 'Library', amount: 2000 }
            ]
        });
        console.log('Fee Structure OK.');

        // 4. Subjects for NEXT Semester
        console.log('Seeding subjects...');
        await Subject.deleteMany({ department: dept._id });
        await Subject.create([
            { name: 'Data Structures', code: 'CS201', semester: 2, university: uni._id, school: school._id, department: dept._id, type: 'Theory', credits: 4 },
            { name: 'Digital Logic', code: 'CS202', semester: 2, university: uni._id, school: school._id, department: dept._id, type: 'Theory', credits: 3 }
        ]);
        console.log('Subjects OK.');

        // 5. Create Student and Sem 1 Results
        console.log('Creating student...');
        await User.deleteOne({ email: 'john.progress@apollo.edu' });
        const student = new User({
            name: 'John Progress',
            email: 'john.progress@apollo.edu',
            password: 'Test@123',
            role: 'student',
            university: uni._id,
            school: school._id,
            department: dept._id,
            batch: batch._id,
            currentSemester: 1,
            status: 'approved'
        });
        await student.save();
        console.log('Student OK.');

        // Add 92% performance in Sem 1
        console.log('Adding exam results...');
        const mockCourseId = new mongoose.Types.ObjectId();
        await ExamResult.create([
            { student: student._id, semester: 1, total: 95, internal: 25, external: 70, university: uni._id, school: school._id, department: dept._id, course: mockCourseId, credits: 4, grade: 'A+' },
            { student: student._id, semester: 1, total: 89, internal: 20, external: 69, university: uni._id, school: school._id, department: dept._id, course: new mongoose.Types.ObjectId(), credits: 3, grade: 'A' }
        ]);
        console.log('Results OK.');

        console.log('--- Step 1: Results Published. HR Releasing Fee for Sem 2 ---');
        const bill = await FinanceService.generateFeeRecord(student._id, 2);
        console.log(`Bill Generated: Net Payable ${bill.netPayable} (Scholarship: ${bill.scholarshipPercentage}%)`);

        console.log('--- Step 2: Student making payment ---');
        await FinanceService.processPayment(bill._id, bill.netPayable, 'UPI', 'SEED_TRANS_001');
        console.log('Payment Successful. Checking Eligibility...');

        const updatedStudent = await User.findById(student._id);
        console.log(`Eligibility: ${updatedStudent.isEligibleForNextSemester}`);

        console.log('--- Step 3: Triggering Progression ---');
        const promotion = await AcademicService.promoteStudent(updatedStudent._id);
        console.log(`Promoted! New Semester: ${promotion.student.currentSemester}`);
        console.log(`Assigned Subjects: ${promotion.assignedSubjects.join(', ')}`);

        console.log('--- SEED FLOW COMPLETED 100% ---');
        process.exit(0);
    } catch (err) {
        console.error('SEED FAILED:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
};

seed();
