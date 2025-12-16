/**
 * API Configuration
 * Backend hazır olduğunda sadece bu dosyadaki değerleri güncellemeniz yeterli
 */

export const API_CONFIG = {
  // Backend URL - Production'da gerçek backend URL'i olacak
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  
  // Mock API kullanımı - Development'ta true, Production'da false
  USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === 'true' || false,
  
  // Timeout ayarları
  TIMEOUT: 30000, // 30 saniye
  
  // Retry ayarları
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;

// API endpoint'leri - Tek yerden yönetim için
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // User Management
  USERS: {
    ME: '/users/me',
    UPDATE_ME: '/users/me',
    PROFILE_PICTURE: '/users/me/profile-picture',
    LIST: '/users',
  },
  
  // Courses
  COURSES: {
    LIST: '/courses',
    DETAIL: (id: string) => `/courses/${id}`,
    CREATE: '/courses',
    UPDATE: (id: string) => `/courses/${id}`,
    DELETE: (id: string) => `/courses/${id}`,
  },
  
  // Sections
  SECTIONS: {
    LIST: '/sections',
    DETAIL: (id: string) => `/sections/${id}`,
    CREATE: '/sections',
    UPDATE: (id: string) => `/sections/${id}`,
    MY_SECTIONS: '/sections/my-sections',
  },
  
  // Enrollments
  ENROLLMENTS: {
    CREATE: '/enrollments',
    DROP: (sectionId: string) => `/enrollments/drop/${sectionId}`, // Backend endpoint: /drop/{sectionId}
    MY_COURSES: '/enrollments/my-enrollments', // Backend endpoint: /my-enrollments
    STUDENTS: (sectionId: string) => `/enrollments/section/${sectionId}`, // Backend endpoint: /section/{sectionId}
  },
  
  // Grades
  GRADES: {
    MY_GRADES: '/grades/my-grades',
    TRANSCRIPT: '/grades/transcript',
    TRANSCRIPT_PDF: '/grades/transcript/pdf',
    CREATE: '/grades',
  },
  
  // Attendance
  ATTENDANCE: {
    SESSIONS: {
      CREATE: '/attendance/sessions',
      DETAIL: (id: string) => `/attendance/sessions/${id}`,
      CLOSE: (id: string) => `/attendance/sessions/${id}/close`,
      MY_SESSIONS: '/attendance/sessions/my-sessions',
    },
    CHECKIN: (sessionId: string) => `/attendance/sessions/${sessionId}/checkin`,
    MY_ATTENDANCE: '/attendance/my-attendance',
    ACTIVE_SESSIONS: '/attendance/active-sessions', // Öğrenci için aktif oturumlar
    REPORT: (sectionId: string) => `/attendance/report/${sectionId}`,
    EXCUSE_REQUESTS: {
      CREATE: '/attendance/excuse-requests',
      LIST: '/attendance/excuse-requests',
      APPROVE: (id: string) => `/attendance/excuse-requests/${id}/approve`,
      REJECT: (id: string) => `/attendance/excuse-requests/${id}/reject`,
    },
  },
  
  // Meals
  MEALS: {
    MENUS: {
      LIST: '/meals/menus',
      DETAIL: (id: string) => `/meals/menus/${id}`,
      CREATE: '/meals/menus',
      UPDATE: (id: string) => `/meals/menus/${id}`,
      DELETE: (id: string) => `/meals/menus/${id}`,
    },
    RESERVATIONS: {
      CREATE: '/meals/reservations',
      DELETE: (id: string) => `/meals/reservations/${id}`,
      MY_RESERVATIONS: '/meals/reservations/my-reservations',
      USE: (id: string) => `/meals/reservations/${id}/use`,
    },
  },
  
  // Wallet
  WALLET: {
    BALANCE: '/wallet/balance',
    TOPUP: '/wallet/topup',
    TOPUP_WEBHOOK: '/wallet/topup/webhook',
    TRANSACTIONS: '/wallet/transactions',
  },
  
  // Events
  EVENTS: {
    LIST: '/events',
    DETAIL: (id: string) => `/events/${id}`,
    CREATE: '/events',
    UPDATE: (id: string) => `/events/${id}`,
    DELETE: (id: string) => `/events/${id}`,
    REGISTER: (id: string) => `/events/${id}/register`,
    REGISTRATIONS: (id: string) => `/events/${id}/registrations`,
    CHECKIN: (eventId: string, regId: string) => `/events/${eventId}/registrations/${regId}/checkin`,
    CANCEL_REGISTRATION: (eventId: string, regId: string) => `/events/${eventId}/registrations/${regId}`,
  },
  
  // Scheduling
  SCHEDULING: {
    GENERATE: '/scheduling/generate',
    DETAIL: (scheduleId: string) => `/scheduling/${scheduleId}`,
    MY_SCHEDULE: '/scheduling/my-schedule',
    MY_SCHEDULE_ICAL: '/scheduling/my-schedule/ical',
  },
  
  // Reservations (Classrooms)
  RESERVATIONS: {
    CREATE: '/reservations',
    LIST: '/reservations',
    APPROVE: (id: string) => `/reservations/${id}/approve`,
    REJECT: (id: string) => `/reservations/${id}/reject`,
  },
  
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    ACADEMIC_PERFORMANCE: '/analytics/academic-performance',
    ATTENDANCE: '/analytics/attendance',
    MEAL_USAGE: '/analytics/meal-usage',
    EVENTS: '/analytics/events',
    EXPORT: (type: string) => `/analytics/export/${type}`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
    PREFERENCES: '/notifications/preferences',
    UPDATE_PREFERENCES: '/notifications/preferences',
  },
  
  // IoT Sensors (Bonus)
  SENSORS: {
    LIST: '/sensors',
    DATA: (id: string) => `/sensors/${id}/data`,
    STREAM: (id: string) => `/sensors/${id}/stream`,
  },
  
  // Departments
  DEPARTMENTS: {
    LIST: '/departments',
    DETAIL: (id: string) => `/departments/${id}`,
    BY_CODE: (code: string) => `/departments/code/${code}`,
  },
} as const;

