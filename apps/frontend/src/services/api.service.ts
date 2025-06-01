import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API base configuration
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Base API service with common configuration and interceptors
 */
class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000, // 15 seconds timeout
      maxContentLength: 5 * 1024 * 1024, // 5MB max content length
      maxBodyLength: 5 * 1024 * 1024, // 5MB max body length
      maxRedirects: 5 // Maximum number of redirects to follow
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        try {
          const token = localStorage.getItem('medical_auth_token');
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
          return config;
        } catch (error) {
          console.error('Error in request interceptor:', error);
          return config; // Continue with the request even if there's an error with the token
        }
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle specific error cases
        if (error.response) {
          // Server responded with a status code outside of 2xx range
          const status = error.response.status;
          
          if (status === 401) {
            // Unauthorized - token expired or invalid
            localStorage.removeItem('medical_auth_token');
            localStorage.removeItem('medical_auth_user');
            // Dispatch an event for unauthorized access
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            console.error('Authentication error: Your session has expired or is invalid');
          } else if (status === 403) {
            console.error('Permission error: You do not have access to this resource');
          } else if (status === 429) {
            console.error('Rate limit exceeded: Too many requests, please try again later');
          } else if (status === 431) {
            console.error('Request header fields too large: Try logging out and back in');
            // Force logout on 431 errors as the token might be corrupted
            localStorage.removeItem('medical_auth_token');
            localStorage.removeItem('medical_auth_user');
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          } else {
            console.error(`API error: ${error.response.statusText || 'Unknown error'}`);
          }
        } else if (error.request) {
          // Request was made but no response received
          console.error('Network error: No response received. Check your internet connection.');
        } else {
          // Error in setting up the request
          console.error('Request configuration error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the singleton instance of ApiService
   */
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Get the axios instance for direct use
   */
  public getAxiosInstance(): AxiosInstance {
    return this.api;
  }

  /**
   * Perform a GET request
   */
  public get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  /**
   * Perform a POST request
   */
  public post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  /**
   * Perform a PUT request
   */
  public put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  /**
   * Perform a DELETE request
   */
  public delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

  /**
   * Perform a PATCH request
   */
  public patch<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }
}

// Export a singleton instance
export const apiService = ApiService.getInstance();
export default apiService;
