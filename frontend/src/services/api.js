import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn any failed request into a readable message
export const errorMessage = (err) =>
  err.response?.data?.message || (err.request ? 'Cannot reach the server. Is the backend running?' : err.message);

export const authService = {
  register: (data) => api.post('/register', data).then((r) => r.data),
  login: (data) => api.post('/login', data).then((r) => r.data),
  me: () => api.get('/me').then((r) => r.data),
};

export const courseService = {
  list: (params) => api.get('/courses', { params }).then((r) => r.data),
  get: (id) => api.get(`/courses/${id}`).then((r) => r.data),
  mine: () => api.get('/courses/mine').then((r) => r.data),
  create: (data) => api.post('/courses', data).then((r) => r.data),
  update: (id, data) => api.put(`/courses/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/courses/${id}`).then((r) => r.data),
  addLesson: (id, data) => api.post(`/courses/${id}/lessons`, data).then((r) => r.data),
  removeLesson: (id, lessonId) => api.delete(`/courses/${id}/lessons/${lessonId}`).then((r) => r.data),
};

export const enrollmentService = {
  enroll: (courseId) => api.post('/enroll', { courseId }).then((r) => r.data),
  myCourses: () => api.get('/my-courses').then((r) => r.data),
  toggleLesson: (enrollmentId, lessonId) =>
    api.put(`/enrollments/${enrollmentId}/progress`, { lessonId }).then((r) => r.data),
};

export const adminService = {
  analytics: () => api.get('/admin/analytics').then((r) => r.data),
  users: () => api.get('/admin/users').then((r) => r.data),
  setRole: (id, role) => api.put(`/admin/users/${id}`, { role }).then((r) => r.data),
  removeUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
};

export default api;
