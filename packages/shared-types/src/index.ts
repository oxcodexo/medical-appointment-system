// Common types shared between frontend and backend

// Export permission constants
export * from './constants/permissions';

// Export appointment types
export * from './types/appointment';

// Export doctor types
export * from './types/doctor';

// User types
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  status?: UserStatus;
  lastLogin?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  image?: string;
}

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  RESPONSABLE = 'responsable'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// API error types
export interface ApiError {
  message: string;
  status?: number;
}
