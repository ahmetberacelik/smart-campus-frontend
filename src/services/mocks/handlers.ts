/**
 * MSW Request Handlers
 * Backend hazır olduğunda bu dosyayı kullanmayacaksınız
 * API_CONFIG.USE_MOCK_API = false yapmanız yeterli
 */

import { http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '@/config/api.config';
import { mockData } from './data';
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  User,
  LoginResponse,
} from '@/types/api.types';

const API_BASE = '/api/v1';

export const handlers = [
  // ==================== AUTH ENDPOINTS ====================
  
  // Register
  http.post(`${API_BASE}${API_ENDPOINTS.AUTH.REGISTER}`, async ({ request }) => {
    const body = await request.json() as RegisterRequest;
    
    // Email validation
    if (!body.email || !body.email.includes('@')) {
      return HttpResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Geçersiz email adresi',
        },
      }, { status: 400 });
    }

    // Password strength check
    if (!body.password || body.password.length < 8) {
      return HttpResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Şifre en az 8 karakter olmalıdır',
        },
      }, { status: 400 });
    }

    // Mock user oluştur
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: body.email,
      name: `${body.firstName} ${body.lastName}`.trim(),
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mock response - Email verification gerekli
    return HttpResponse.json<ApiResponse<User>>({
      success: true,
      data: newUser,
    }, { status: 201 });
  }),

  // Login
  http.post(`${API_BASE}${API_ENDPOINTS.AUTH.LOGIN}`, async ({ request }) => {
    const body = await request.json() as LoginRequest;
    
    // Mock user bul
    const user = mockData.users.find(u => u.email === body.email);
    
    if (!user || body.password !== 'password123') {
      return HttpResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email veya şifre hatalı',
        },
      }, { status: 401 });
    }

    // Mock tokens
    const accessToken = `mock_access_token_${Date.now()}`;
    const refreshToken = `mock_refresh_token_${Date.now()}`;

    const response: LoginResponse = {
      accessToken,
      refreshToken,
      user,
    };

    return HttpResponse.json<ApiResponse<LoginResponse>>({
      success: true,
      data: response,
    });
  }),

  // Logout
  http.post(`${API_BASE}${API_ENDPOINTS.AUTH.LOGOUT}`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Refresh Token
  http.post(`${API_BASE}${API_ENDPOINTS.AUTH.REFRESH}`, async ({ request }) => {
    const body = await request.json() as { refreshToken: string };
    
    if (!body.refreshToken || !body.refreshToken.startsWith('mock_refresh_token')) {
      return HttpResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Geçersiz refresh token',
        },
      }, { status: 401 });
    }

    const newAccessToken = `mock_access_token_${Date.now()}`;
    
    return HttpResponse.json<ApiResponse<{ accessToken: string }>>({
      success: true,
      data: { accessToken: newAccessToken },
    });
  }),

  // Verify Email
  http.post(`${API_BASE}${API_ENDPOINTS.AUTH.VERIFY_EMAIL}`, async ({ request }) => {
    const body = await request.json() as { token: string };
    
    if (!body.token) {
      return HttpResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Geçersiz doğrulama token\'ı',
        },
      }, { status: 400 });
    }

    return HttpResponse.json<ApiResponse<void>>({
      success: true,
    });
  }),

  // Forgot Password
  http.post(`${API_BASE}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, async () => {
    // Her zaman başarılı dön (güvenlik için)
    return HttpResponse.json<ApiResponse<void>>({
      success: true,
    });
  }),

  // Reset Password
  http.post(`${API_BASE}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, async ({ request }) => {
    const body = await request.json() as { token: string; newPassword: string };
    
    if (!body.token || !body.newPassword) {
      return HttpResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Token ve yeni şifre gereklidir',
        },
      }, { status: 400 });
    }

    return HttpResponse.json<ApiResponse<void>>({
      success: true,
    });
  }),

  // ==================== USER ENDPOINTS ====================
  
  // Get Me
  http.get(`${API_BASE}${API_ENDPOINTS.USERS.ME}`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return HttpResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication gerekli',
        },
      }, { status: 401 });
    }

    // Mock: İlk kullanıcıyı döndür
    const user = mockData.users[0];
    
    return HttpResponse.json<ApiResponse<User>>({
      success: true,
      data: user,
    });
  }),

  // Update Me
  http.put(`${API_BASE}${API_ENDPOINTS.USERS.UPDATE_ME}`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return HttpResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication gerekli',
        },
      }, { status: 401 });
    }

    const body = await request.json() as Partial<User>;
    const user = { ...mockData.users[0], ...body };
    
    return HttpResponse.json<ApiResponse<User>>({
      success: true,
      data: user,
    });
  }),

  // Upload Profile Picture
  http.post(`${API_BASE}${API_ENDPOINTS.USERS.PROFILE_PICTURE}`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return HttpResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication gerekli',
        },
      }, { status: 401 });
    }

    // Mock: Rastgele URL döndür
    const mockUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    
    return HttpResponse.json<ApiResponse<{ url: string }>>({
      success: true,
      data: { url: mockUrl },
    });
  }),

  // Get Users List (Admin)
  http.get(`${API_BASE}${API_ENDPOINTS.USERS.LIST}`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return HttpResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication gerekli',
        },
      }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = mockData.users.slice(start, end);
    
    return HttpResponse.json<ApiResponse<{
      data: User[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>>({
      success: true,
      data: {
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total: mockData.users.length,
          totalPages: Math.ceil(mockData.users.length / limit),
        },
      },
    });
  }),

  // Diğer endpoint'ler için placeholder'lar eklenebilir
  // Part 2, 3, 4 için mock'lar ayrı dosyalarda olacak
];

