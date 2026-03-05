export const authorize = (roles = [], options = {}) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }

        const { role, school, department } = req.user;

        if (role === 'registrar') {
            return next();
        }

        if (roles.length && !roles.includes(role)) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Role not permitted' });
        }

        const { scopeSchool, scopeDepartment } = options;

        if (scopeSchool && school?.toString() !== req.params.schoolId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Access restricted to your school' });
        }

        if (scopeDepartment && department?.toString() !== req.params.departmentId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Access restricted to your department' });
        }

        next();
    };
};
