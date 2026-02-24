import axios from 'axios';

const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    return '/api'; // Relative path for Vercel/Production (handled by rewrites)
};

const API = axios.create({
    baseURL: getBaseUrl(),
});

// Add a request interceptor to attach JWT
API.interceptors.request.use((config) => {
    try {
        const saved = localStorage.getItem('user');
        const user = saved ? JSON.parse(saved) : null;
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
    } catch (err) {
        console.error("API Interceptor Error:", err);
    }
    return config;
});

// Auto-logout on invalid/expired tokens
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            const saved = localStorage.getItem('user');
            if (saved) {
                const user = JSON.parse(saved);
                // If using a mock token, force re-login
                if (user.token && user.token.startsWith('mock_')) {
                    console.warn('Mock token detected. Forcing re-login...');
                    localStorage.removeItem('user');
                    window.location.reload();
                }
            }
        }
        return Promise.reject(error);
    }
);

export const login = (credentials) => API.post('/auth/login', credentials);
export const signup = (userData) => API.post('/auth/signup', userData);
export const getDashboardData = (role) => API.get(`/dashboard/${role}`);
export const getAttendance = (userId) => API.get(`/attendance/${userId}`);
export const markAttendance = (data) => API.post('/attendance/mark', data);
export const getResults = (userId) => API.get(`/results/${userId}`);
export const syncMarks = (data) => API.post('/results/batch-update', data);
export const updateMarks = (data) => API.post('/results/batch-update', data);
export const publishResults = (data) => API.post('/results/publish', data);
export const getPublishStatus = () => API.get('/results/publish-status');
export const batchViewResults = (params) => API.post('/results/batch-view', params);
export const batchUpdateMarks = (data) => API.post('/results/batch-update', data);
export const getStudents = (params) => API.get('/admin/directory', { params: { ...params, role: 'student' } });

// Admin / Registrar Actions
export const getAdminStats = (params) => API.get('/admin/stats', { params });
export const getDirectory = (params) => API.get('/admin/directory', { params });
export const getPendingRegistrations = () => API.get('/admin/directory?status=pending');
export const approveRegistration = (data) => API.post('/admin/approve', data);
export const rejectRegistration = (id) => API.delete(`/admin/approve/${id}`);
export const getSubjects = (params) => API.get('/admin/subjects', { params });
export const updateSubjects = (data) => API.put('/admin/subjects', data);
export const getExams = (params) => API.get('/admin/exams', { params });
export const createExam = (data) => API.post('/admin/exams', data);
export const deleteExam = (id) => API.delete(`/admin/exams/${id}`);
export const getFaculty = () => API.get('/admin/directory?role=teacher');
export const updateStudent = (id, data) => API.put(`/admin/student/${id}`, data);
export const createFaculty = (data) => API.post('/admin/faculty', data);
export const updateFaculty = (data) => API.put('/admin/faculty', data);
export const getAttendanceReport = (params) => API.get('/attendance/report', { params });

// Institution / Multi-tenant Hierarchy
export const getHierarchy = () => API.get('/institution/hierarchy');
export const createUniversity = (data) => API.post('/institution/university', data);
export const createSchool = (data) => API.post('/institution/school', data);
export const createDepartment = (data) => API.post('/institution/department', data);
export const createBatch = (data) => API.post('/institution/batch', data);

// Posts / Feed
export const getPosts = (schoolId) => API.get(`/posts${schoolId ? `?schoolId=${schoolId}` : ''}`);
export const createPost = (data) => {
    // Check if data is already FormData (it should be for image upload)
    if (data instanceof FormData) {
        return API.post('/posts', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
    return API.post('/posts', data);
};
export const likePost = (id, email) => API.post(`/posts/${id}/like`, { email });
export const commentPost = (id, data) => API.post(`/posts/${id}/comment`, data);

export default API;
