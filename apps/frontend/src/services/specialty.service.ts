import { AxiosResponse, AxiosError } from 'axios';
import apiService from './api.service';
import { Specialty } from '@/lib/types';

// Define interfaces for specialty-related data
export interface SpecialtyData {
  name?: string;
  description?: string;
}

export interface SpecialtyError {
  message: string;
  status?: number;
}

/**
 * Specialty service for handling specialty-related operations
 */
class SpecialtyService {
  private static instance: SpecialtyService;

  private constructor() {}

  /**
   * Get the singleton instance of SpecialtyService
   */
  public static getInstance(): SpecialtyService {
    if (!SpecialtyService.instance) {
      SpecialtyService.instance = new SpecialtyService();
    }
    return SpecialtyService.instance;
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: unknown, defaultMessage: string): SpecialtyError {
    let errorMessage = defaultMessage;
    let errorStatus: number | undefined = undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data?.message as string || errorMessage;
      errorStatus = error.response.status;
    }
    
    return {
      message: errorMessage,
      status: errorStatus
    };
  }

  /**
   * Get all specialties
   * @returns Promise with specialties array
   */
  public async getAllSpecialties(): Promise<Specialty[]> {
    try {
      const response: AxiosResponse<Specialty[]> = await apiService.get('/specialties');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch specialties');
    }
  }

  /**
   * Get specialty by ID
   * @param id Specialty ID
   * @returns Promise with specialty data
   */
  public async getSpecialtyById(id: number): Promise<Specialty> {
    try {
      const response: AxiosResponse<Specialty> = await apiService.get(`/specialties/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch specialty with ID ${id}`);
    }
  }

  /**
   * Create a new specialty
   * @param specialtyData Specialty data
   * @returns Promise with created specialty data
   */
  public async createSpecialty(specialtyData: SpecialtyData): Promise<Specialty> {
    try {
      const response: AxiosResponse<Specialty> = await apiService.post('/specialties', specialtyData);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to create specialty');
    }
  }

  /**
   * Update specialty data
   * @param id Specialty ID
   * @param specialtyData Specialty data to update
   * @returns Promise with updated specialty data
   */
  public async updateSpecialty(id: number, specialtyData: SpecialtyData): Promise<Specialty> {
    try {
      const response: AxiosResponse<Specialty> = await apiService.put(`/specialties/${id}`, specialtyData);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to update specialty with ID ${id}`);
    }
  }

  /**
   * Delete specialty
   * @param id Specialty ID
   * @returns Promise with success status
   */
  public async deleteSpecialty(id: number): Promise<boolean> {
    try {
      await apiService.delete(`/specialties/${id}`);
      return true;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to delete specialty with ID ${id}`);
    }
  }
}

// Export a singleton instance
export const specialtyService = SpecialtyService.getInstance();
export default specialtyService;
