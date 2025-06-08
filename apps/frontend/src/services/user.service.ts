import { AxiosResponse } from 'axios';
import apiService from './api.service';
import { User } from '@medical-appointment-system/shared-types';

// Define interface for user profile data
export interface UserProfileData {
  address?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
}

// Define interface for user data
export interface UserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

/**
 * User service for handling user-related operations
 */
class UserService {
  private static instance: UserService;

  private constructor() {}

  /**
   * Get the singleton instance of UserService
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Get all users
   * @returns Promise with users array
   */
  public async getAllUsers(): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> = await apiService.get('/users');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch users';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get user by ID
   * @param id User ID
   * @returns Promise with user data
   */
  public async getUserById(id: number): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiService.get(`/users/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to fetch user with ID ${id}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Update user data
   * @param id User ID
   * @param userData User data to update
   * @returns Promise with updated user data
   */
  public async updateUser(id: number, userData: UserData): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiService.put(`/users/${id}`, userData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to update user with ID ${id}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a new user
   * @param userData User data to create
   * @returns Promise with created user data
   */
  public async createUser(userData: UserData): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiService.post('/users', userData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create user';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete user
   * @param id User ID
   * @param force If true, performs a force (hard) deletion. If false or omitted, performs a soft deletion.
   * @returns Promise with success status
   */
  public async deleteUser(id: number, force?: boolean): Promise<boolean> {
    try {
      const url = force ? `/users/${id}?force=true` : `/users/${id}`;
      await apiService.delete(url);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error  
        ? error.message 
        : `Failed to delete user with ID ${id}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Get user profile
   * @param userId User ID
   * @returns Promise with user profile data
   */
  public async getUserProfile(userId: number): Promise<UserProfileData> {
    try {
      const response: AxiosResponse<UserProfileData> = await apiService.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to fetch profile for user with ID ${userId}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Update user profile
   * @param userId User ID
   * @param profileData Profile data to update
   * @returns Promise with updated profile data
   */
  public async updateUserProfile(userId: number, profileData: UserProfileData): Promise<UserProfileData> {
    try {
      const response: AxiosResponse<UserProfileData> = await apiService.put(`/users/${userId}/profile`, profileData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to update profile for user with ID ${userId}`;
      throw new Error(errorMessage);
    }
  }
}

// Export a singleton instance
export const userService = UserService.getInstance();
export default userService;
