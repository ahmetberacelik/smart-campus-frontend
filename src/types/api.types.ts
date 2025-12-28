/**
 * API Response Types
 * Backend ekibiyle paylaşılabilir - TypeScript interface'leri
 */

// Generic API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types (backend role'ları upper-case, front-end lower-case de desteklenir)
export type UserRole =
  | 'student'
  | 'faculty'
  | 'admin'
  | 'cafeteria_staff'
  | 'STUDENT'
  | 'FACULTY'
  | 'ADMIN';

export interface StudentInfo {
  studentNumber: string;
  departmentId: number | string;
  departmentName?: string;
  gpa?: number;
  cgpa?: number;
}

export interface FacultyInfo {
  employeeNumber: string;
  title?: string;
  departmentId: number | string;
  departmentName?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  // Backend alanları
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  isVerified?: boolean;
  studentInfo?: StudentInfo;
  facultyInfo?: FacultyInfo;
  // Frontend uyumluluğu için
  name?: string;
  profilePictureUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student extends User {
  role: 'student';
  studentNumber: string;
  departmentId: string;
  gpa?: number;
  cgpa?: number;
}

export interface Faculty extends User {
  role: 'faculty';
  employeeNumber: string;
  title: string;
  departmentId: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  user: User;
}

// Backend register payload'ı
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'STUDENT' | 'FACULTY';
  departmentId: number | string;
  studentNumber?: string;
  employeeNumber?: string;
  title?: string;
}

// Course Types
export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  ects: number;
  departmentId: string;
  prerequisites?: Course[];
}

export interface CourseSection {
  id: string;
  courseId: string;
  course: Course;
  sectionNumber: string;
  semester: string;
  year: number;
  instructorId: string;
  instructor: Faculty;
  // Backend'den gelen ek alanlar
  instructorName?: string;
  classroomName?: string;
  courseCode?: string;
  courseName?: string;
  capacity: number;
  enrolledCount: number;
  schedule: ScheduleSlot[];
}

export interface ScheduleSlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  classroomId: string;
}

// Enrollment Types
export interface Enrollment {
  id: string;
  studentId: string;
  sectionId: string;
  section: CourseSection;
  status: 'enrolled' | 'dropped' | 'completed';
  enrollmentDate: string;
  midtermGrade?: number;
  finalGrade?: number;
  letterGrade?: string;
  gradePoint?: number;
}

// Grade Types
export interface Grade {
  courseCode: string;
  courseName: string;
  midtermGrade?: number;
  finalGrade?: number;
  letterGrade?: string;
  gradePoint?: number;
  semester: string;
  year: number;
}

export interface Transcript {
  student: Student;
  grades: Grade[];
  gpa: number;
  cgpa: number;
}

// Attendance Types
export interface AttendanceSession {
  id: string;
  sectionId: string;
  section: CourseSection;
  instructorId: string;
  date: string;
  startTime: string;
  endTime: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number; // meters
  qrCode: string;
  status: 'active' | 'closed';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  session: AttendanceSession;
  studentId: string;
  checkInTime: string;
  latitude: number;
  longitude: number;
  distanceFromCenter: number;
  isFlagged: boolean;
  flagReason?: string;
}

export interface AttendanceStats {
  courseId: string;
  courseName: string;
  totalSessions: number;
  attendedSessions: number;
  excusedAbsences: number;
  attendancePercentage: number;
  status: 'ok' | 'warning' | 'critical';
}

export interface ExcuseRequest {
  id: string;
  studentId: string;
  sessionId: string;
  session: AttendanceSession;
  reason: string;
  documentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

// Meal Types
export interface MealMenu {
  id: string;
  cafeteriaId: string;
  date: string;
  mealType: 'lunch' | 'dinner';
  items: MealItem[];
  nutrition: NutritionInfo;
  isPublished: boolean;
}

export interface MealItem {
  name: string;
  description?: string;
  price?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface MealReservation {
  id: string;
  userId: string;
  menuId: string;
  menu: MealMenu;
  cafeteriaId: string;
  mealType: 'lunch' | 'dinner';
  date: string;
  amount: number;
  qrCode: string;
  status: 'reserved' | 'used' | 'cancelled';
  usedAt?: string;
}

// Wallet Types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  description: string;
  createdAt: string;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'conference' | 'workshop' | 'social' | 'sports';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  registeredCount: number;
  registrationDeadline: string;
  isPaid: boolean;
  price?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventRegistration {
  id: string;
  eventId: string;
  event: Event;
  userId: string;
  registrationDate: string;
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: string;
  customFields?: Record<string, any>;
}

// Notification Types
export type NotificationCategory =
  | 'academic'
  | 'attendance'
  | 'meal'
  | 'event'
  | 'payment'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface NotificationPreferences {
  email: Record<NotificationCategory, boolean>;
  push: Record<NotificationCategory, boolean>;
  sms: Partial<Record<NotificationCategory, boolean>>;
}

// Analytics Types
export interface DashboardStats {
  totalUsers: number;
  activeUsersToday: number;
  totalCourses: number;
  totalEnrollments: number;
  attendanceRate: number;
  mealReservationsToday: number;
  upcomingEvents: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

