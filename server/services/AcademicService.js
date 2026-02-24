import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Course from '../models/Course.js';
import ExamResult from '../models/ExamResult.js';

class AcademicService {
    /**
     * Promotes a student to the next semester and auto-assigns subjects
     * Only works if isEligibleForNextSemester is true
     */
    async promoteStudent(studentId) {
        const student = await User.findById(studentId);

        if (!student.isEligibleForNextSemester) {
            throw new Error('Student is not eligible for promotion. Please clear pending dues.');
        }

        const nextSemester = student.currentSemester + 1;

        // 1. Identify Backlogs from previous semester
        const recentResults = await ExamResult.find({
            student: studentId,
            semester: student.currentSemester,
            grade: 'F'
        });
        const newBacklogs = recentResults.map(r => r.course); // Assuming course ref maps to subject/subject data

        // 2. Map Next Semester Subjects
        const nextSubjects = await Subject.find({
            department: student.department,
            semester: nextSemester
        });

        // 3. Update Student State
        student.currentSemester = nextSemester;
        student.isEligibleForNextSemester = false; // Reset for the new semester
        if (newBacklogs.length > 0) {
            student.backlogs = [...new Set([...student.backlogs, ...newBacklogs])];
        }

        // 4. Auto-enroll in Courses (Mocking Course enrollment)
        // In a real system, we'd create Course enrollment records here.

        await student.save();
        return {
            student,
            assignedSubjects: nextSubjects.map(s => s.name),
            backlogs: student.backlogs.length
        };
    }

    /**
     * Checks failure cases and updates backlog status
     */
    async processResults(studentId, semester) {
        const results = await ExamResult.find({ student: studentId, semester });
        const failed = results.filter(r => r.grade === 'F');

        if (failed.length > 0) {
            const student = await User.findById(studentId);
            const failIds = failed.map(f => f.course);
            student.backlogs = [...new Set([...student.backlogs, ...failIds])];
            await student.save();
        }
    }
}

export default new AcademicService();
