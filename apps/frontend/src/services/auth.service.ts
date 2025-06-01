import { AxiosResponse, AxiosError } from 'axios';
import apiService from './api.service';
import { User, UserProfile, Doctor } from '@/lib/types';

// Define permission types
export interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
  source: 'role' | 'user';
  resourceType?: string | null;
  resourceId?: number | null;
  expiresAt?: string | null;
  grantedBy?: number | null;
  grantedAt?: string | null;
  reason?: string | null;
}

export interface PermissionSet {
  all: Permission[];
  byCategory: Record<string, Permission[]>;
  hasPermission: (permissionName: string, resourceType?: string | null, resourceId?: number | null) => boolean;
}

// Define response types
export interface LoginResponse {
  user: User;
  permissions: PermissionSet;
  token: string;
}

export interface RegisterResponse {
  user: User;
  permissions: PermissionSet;
  token: string;
}

export interface AuthError {
  message: string;
  status?: number;
  remainingAttempts?: number;
  suspendedUntil?: string;
}

/**
 * Authentication service for handling user login, registration, and profile management
 */
class AuthService {
  private static instance: AuthService;

  private constructor() {}

  /**
   * Get the singleton instance of AuthService
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login a user with email and password
   * @param email User email
   * @param password User password
   * @returns Promise with login response or error
   */
  public async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await apiService.post('/auth/login', { email, password });
      
      // Store auth data in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('medical_auth_token', response.data.token);
        localStorage.setItem('medical_auth_user', JSON.stringify(response.data.user));
        localStorage.setItem('medical_auth_permissions', JSON.stringify(response.data.permissions));
      }
      
      return response.data;
    } catch (error: unknown) {
      // Transform error to a consistent format
      let errorMessage = 'Login failed. Please try again.';
      let errorStatus: number | undefined = undefined;
      let remainingAttempts: number | undefined = undefined;
      let suspendedUntil: string | undefined = undefined;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      if (error instanceof AxiosError && error.response) {
        const responseData = error.response.data;
        errorMessage = responseData?.message as string || errorMessage;
        errorStatus = error.response.status;
        
        // Handle specific authentication errors
        if (responseData?.remainingAttempts !== undefined) {
          remainingAttempts = responseData.remainingAttempts;
        }
        
        if (responseData?.suspendedUntil) {
          suspendedUntil = responseData.suspendedUntil;
        }
      }
      
      const authError: AuthError = {
        message: errorMessage,
        status: errorStatus,
        remainingAttempts,
        suspendedUntil
      };
      
      throw authError;
    }
  }

  /**
   * Register a new user
   * @param name User name
   * @param email User email
   * @param password User password
   * @param role User role (default: 'patient')
   * @param profile User profile (optional)
   * @returns Promise with register response or error
   */
  public async register(
    name: string, 
    email: string, 
    password: string, 
    role: string = 'patient',
    profile?: Partial<UserProfile>
  ): Promise<RegisterResponse> {
    try {
      const response: AxiosResponse<RegisterResponse> = await apiService.post('/auth/register', {
        name,
        email,
        password,
        role,
        profile
      });
      
      // Store auth data in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('medical_auth_token', response.data.token);
        localStorage.setItem('medical_auth_user', JSON.stringify(response.data.user));
        localStorage.setItem('medical_auth_permissions', JSON.stringify(response.data.permissions));
      }
      
      return response.data;
    } catch (error: unknown) {
      // Transform error to a consistent format
      let errorMessage = 'Registration failed. Please try again.';
      let errorStatus: number | undefined = undefined;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data?.message as string || errorMessage;
        errorStatus = error.response.status;
        
        // Handle validation errors
        if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
          const validationErrors = error.response.data.errors;
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.map(err => err.message || err).join(', ');
          }
        }
      }
      
      const authError: AuthError = {
        message: errorMessage,
        status: errorStatus
      };
      
      throw authError;
    }
  }

  /**
   * Get the current user's profile
   * @returns Promise with user profile or error
   */
  public async getProfile(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiService.get('/auth/profile');
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch user profile.';
      let errorStatus: number | undefined = undefined;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data?.message as string || errorMessage;
        errorStatus = error.response.status;
      }
      
      const authError: AuthError = {  
        message: errorMessage,
        status: errorStatus
      };
      
      throw authError;
    }
  }

  /**
   * Logout the current user
   */
  public logout(): void {
    localStorage.removeItem('medical_auth_token');
    localStorage.removeItem('medical_auth_user');
  }

  /**
   * Check if user is authenticated
   * @returns boolean indicating if user is authenticated
   */
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('medical_auth_token');
    return !!token;
  }

  /**
   * Get the current user from localStorage
   * @returns User object or null
   */
  public getCurrentUser(): User | null {
    const userJson = localStorage.getItem('medical_auth_user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Get the current auth token
   * @returns Auth token or null
   */
  public getToken(): string | null {
    return localStorage.getItem('medical_auth_token');
  }
}

// Export a singleton instance
export const authService = AuthService.getInstance();
export default authService;
