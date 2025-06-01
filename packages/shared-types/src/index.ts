// Common types shared between frontend and backend

// Export permission constants
export * from './constants/permissions';

// Export appointment types
export * from './types/appointment';

// Export user types
export * from './types/user';

// Export doctor types
export * from './types/doctor';

// Export specialty types
export * from './types/specialty';

// Export chatbot types
export * from './types/chatbot';

// API response types are defined here to avoid circular dependencies

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
