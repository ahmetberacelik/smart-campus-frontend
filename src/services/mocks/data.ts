/**
 * Mock Data
 * Backend hazır olduğunda bu dosyayı kullanmayacaksınız
 */

import type { User, Student, Faculty } from '@/types/api.types';

export const mockData = {
  users: [
    {
      id: '1',
      email: 'student@example.com',
      name: 'Ahmet Yılmaz',
      role: 'student' as const,
      studentNumber: '2021001',
      departmentId: '1',
      gpa: 3.5,
      cgpa: 3.4,
      phone: '+90 555 123 4567',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: '2',
      email: 'faculty@example.com',
      name: 'Dr. Mehmet Sevri',
      role: 'faculty' as const,
      employeeNumber: 'EMP001',
      title: 'Doçent',
      departmentId: '1',
      phone: '+90 555 987 6543',
      createdAt: '2023-09-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: '3',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin' as const,
      phone: '+90 555 111 2233',
      createdAt: '2023-01-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: '4',
      email: 'student2@example.com',
      name: 'Ayşe Demir',
      role: 'student' as const,
      studentNumber: '2021002',
      departmentId: '2',
      gpa: 3.8,
      cgpa: 3.7,
      phone: '+90 555 234 5678',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
    {
      id: '5',
      email: 'student3@example.com',
      name: 'Mehmet Kaya',
      role: 'student' as const,
      studentNumber: '2021003',
      departmentId: '1',
      gpa: 3.2,
      cgpa: 3.1,
      phone: '+90 555 345 6789',
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
    },
  ] as User[],

  // Part 2 için mock data'lar eklenecek
  courses: [],
  enrollments: [],
  attendanceSessions: [],
  
  // Part 3 için mock data'lar eklenecek
  mealMenus: [],
  mealReservations: [],
  events: [],
  
  // Part 4 için mock data'lar eklenecek
  notifications: [],
};

