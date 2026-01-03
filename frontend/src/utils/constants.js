export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'NEC GATE Portal';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export const USER_ROLES = {
  ADMIN: 'Admin',
  DEPT_HEAD: 'Dept Head',
  STAFF: 'Staff',
  STUDENT: 'Student'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/change-password',
  
  // Subjects
  SUBJECTS: '/subjects',
  SUBJECT_DETAILS: '/subjects/:subjectId',
  
  // Topics
  TOPICS: '/subjects/:subjectId/topics',
  TOPIC_DETAILS: '/subjects/:subjectId/topics/:topicId',
  
  // Practice
  PRACTICE: '/subjects/:subjectId/topics/:topicId/practice',
  
  // Admin
  ADMIN_PARTICIPANTS: '/admin/participants',
  ADMIN_DEPARTMENTS: '/admin/departments',
  
  // Tutor
  TUTOR_STUDENTS: '/tutor/students',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500
};

export const STORAGE_KEYS = {
  TOKEN: 'nec_gate_token',
  USER: 'nec_gate_user',
  THEME: 'nec_gate_theme'
};

export const PASSWORD_MIN_LENGTH = 6;
export const OTP_LENGTH = 6;
export const OTP_RESEND_COOLDOWN = 120; // seconds