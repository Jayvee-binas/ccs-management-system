import axios from "axios";

const BACKEND_URL = "https://ccs-management-backend.vercel.app";

const API_URL = `${BACKEND_URL}/api`;

// Request interceptor for adding auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  studentLogin: (studentId, password) =>
    axios.post(`${API_URL}/auth/student/login`, { studentId, password }),
  teacherLogin: (email, password) =>
    axios.post(`${API_URL}/auth/teacher/login`, { email, password }),
  adminLogin: (username, password) =>
    axios.post(`${API_URL}/auth/admin/login`, { username, password }),
  getMe: () => axios.get(`${API_URL}/auth/me`),
  logout: () => axios.post(`${API_URL}/auth/logout`),
  changePassword: (currentPassword, newPassword) =>
    axios.put(`${API_URL}/auth/change-password`, {
      currentPassword,
      newPassword,
    }),
};

// Students API
export const studentsAPI = {
  getAll: (params) => axios.get(`${API_URL}/students`, { params }),
  getById: (id) => axios.get(`${API_URL}/students/${id}`),
  getByUserId: (userId) => axios.get(`${API_URL}/students/user/${userId}`),
  create: (data) => axios.post(`${API_URL}/students`, data),
  update: (id, data) => axios.put(`${API_URL}/students/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/students/${id}`),
  updateProfilePicture: (id, formData) =>
    axios.put(`${API_URL}/students/${id}/profile-picture`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  resetPassword: (id, newPassword) =>
    axios.post(`${API_URL}/students/${id}/reset-password`, { newPassword }),
  getBySection: (section) =>
    axios.get(`${API_URL}/students/section/${section}`),
  getSkills: () => axios.get(`${API_URL}/students/skills/list`),
};

// Teachers API
export const teachersAPI = {
  getAll: (params) => axios.get(`${API_URL}/teachers`, { params }),
  getById: (id) => axios.get(`${API_URL}/teachers/${id}`),
  getByUserId: (userId) => axios.get(`${API_URL}/teachers/user/${userId}`),
  create: (data) => axios.post(`${API_URL}/teachers`, data),
  update: (id, data) => axios.put(`${API_URL}/teachers/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/teachers/${id}`),
  updateProfilePicture: (id, formData) =>
    axios.put(`${API_URL}/teachers/${id}/profile-picture`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  resetPassword: (id, newPassword) =>
    axios.post(`${API_URL}/teachers/${id}/reset-password`, { newPassword }),
  toggleCapstoneAvailability: (id, available, schedule) =>
    axios.put(`${API_URL}/teachers/${id}/capstone-availability`, {
      available,
      schedule,
    }),
  getCapstoneRequests: (id) =>
    axios.get(`${API_URL}/teachers/${id}/capstone-requests`),
  updateCapstoneRequest: (groupId, status) =>
    axios.put(`${API_URL}/teachers/capstone-requests/${groupId}`, { status }),
  getAvailableAdvisers: () =>
    axios.get(`${API_URL}/teachers/capstone-advisers/available`),
};

// Admin API
export const adminAPI = {
  getStatistics: () => axios.get(`${API_URL}/admin/statistics`),
  getUsers: (params) => axios.get(`${API_URL}/admin/users`, { params }),
  updateUserStatus: (id, status) =>
    axios.put(`${API_URL}/admin/users/${id}/status`, { status }),
  unlockUser: (id) => axios.post(`${API_URL}/admin/users/${id}/unlock`),
  getAuditLogs: (params) =>
    axios.get(`${API_URL}/admin/audit-logs`, { params }),
  getSections: () => axios.get(`${API_URL}/admin/sections`),
  assignSection: (studentIds, section) =>
    axios.post(`${API_URL}/admin/assign-section`, { studentIds, section }),
  getViolationTypes: () => axios.get(`${API_URL}/admin/violations/types`),
  createAdmin: (data) => axios.post(`${API_URL}/admin/create-admin`, data),
  importStudents: (students) =>
    axios.post(`${API_URL}/admin/import-students`, { students }),
};

// Violations API
export const violationsAPI = {
  getAll: (params) => axios.get(`${API_URL}/violations`, { params }),
  getById: (id) => axios.get(`${API_URL}/violations/${id}`),
  create: (data) => axios.post(`${API_URL}/violations`, data),
  update: (id, data) => axios.put(`${API_URL}/violations/${id}`, data),
  resolve: (id, remarks) =>
    axios.put(`${API_URL}/violations/${id}/resolve`, { remarks }),
  delete: (id) => axios.delete(`${API_URL}/violations/${id}`),
  getByStudent: (studentId) =>
    axios.get(`${API_URL}/violations/student/${studentId}`),
  getByUserId: (userId) => axios.get(`${API_URL}/violations/user/${userId}`),
  getStats: () => axios.get(`${API_URL}/violations/stats/summary`),
};

// Certificates API
export const certificatesAPI = {
  getByStudent: (studentId) =>
    axios.get(`${API_URL}/certificates/student/${studentId}`),
  getByUserId: (userId) => axios.get(`${API_URL}/certificates/user/${userId}`),
  upload: (formData) =>
    axios.post(`${API_URL}/certificates/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => axios.delete(`${API_URL}/certificates/${id}`),
  getById: (id) => axios.get(`${API_URL}/certificates/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => axios.get(`${API_URL}/dashboard/stats`),
  getStudentsPerYear: () =>
    axios.get(`${API_URL}/dashboard/charts/students-per-year`),
  getViolationsSummary: () =>
    axios.get(`${API_URL}/dashboard/charts/violations-summary`),
  getFacultyEmployment: () =>
    axios.get(`${API_URL}/dashboard/charts/faculty-employment`),
  getViolationsBySection: () =>
    axios.get(`${API_URL}/dashboard/charts/violations-by-section`),
};

export default {
  auth: authAPI,
  students: studentsAPI,
  teachers: teachersAPI,
  admin: adminAPI,
  violations: violationsAPI,
  certificates: certificatesAPI,
  dashboard: dashboardAPI,
};
