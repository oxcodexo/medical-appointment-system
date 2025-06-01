import { AxiosResponse, AxiosError } from 'axios';
import apiService from './api.service';
import { Doctor, DoctorData, DoctorAvailability, DoctorAbsence, ApiError } from '@medical-appointment-system/shared-types';

/**
 * Doctor service for handling doctor-related operations
 */
class DoctorService {
  private static instance: DoctorService;

  private constructor() {}

  /**
   * Get the singleton instance of DoctorService
   */
  public static getInstance(): DoctorService {
    if (!DoctorService.instance) {
      DoctorService.instance = new DoctorService();
    }
    return DoctorService.instance;
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: unknown, defaultMessage: string): ApiError {
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
   * Get all doctors
   * @returns Promise with doctors array
   */
  public async getAllDoctors(): Promise<Doctor[]> {
    try {
      const response: AxiosResponse<Doctor[]> = await apiService.get('/doctors');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch doctors');
    }
  }

  /**
   * Get doctor by ID
   * @param id Doctor ID
   * @returns Promise with doctor data
   */
  public async getDoctorById(id: number): Promise<Doctor> {
    try {
      const response: AxiosResponse<Doctor> = await apiService.get(`/doctors/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch doctor with ID ${id}`);
    }
  }

  /**
   * Create a new doctor
   * @param doctorData Doctor data
   * @returns Promise with created doctor data
   */
  public async createDoctor(doctorData: DoctorData): Promise<Doctor> {
    try {
      const response: AxiosResponse<Doctor> = await apiService.post('/doctors', doctorData);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to create doctor');
    }
  }

  /**
   * Update doctor data
   * @param id Doctor ID
   * @param doctorData Doctor data to update
   * @returns Promise with updated doctor data
   */
  public async updateDoctor(id: number, doctorData: Partial<Doctor>): Promise<Doctor> {
    try {
      const response: AxiosResponse<Doctor> = await apiService.put(`/doctors/${id}`, doctorData);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to update doctor with ID ${id}`);
    }
  }

  /**
   * Delete doctor
   * @param id Doctor ID
   * @returns Promise with success status
   */
  public async deleteDoctor(id: number): Promise<boolean> {
    try {
      await apiService.delete(`/doctors/${id}`);
      return true;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to delete doctor with ID ${id}`);
    }
  }

  /**
   * Get doctors by specialty
   * @param specialtyId Specialty ID
   * @returns Promise with doctors array
   */
  public async getDoctorsBySpecialty(specialtyId: number): Promise<Doctor[]> {
    try {
      const response: AxiosResponse<Doctor[]> = await apiService.get(`/doctors/specialty/${specialtyId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch doctors with specialty ID ${specialtyId}`);
    }
  }

  /**
   * Get doctor by user ID
   * @param userId User ID
   * @returns Promise with doctor data
   */
  public async getDoctorByUserId(userId: number): Promise<Doctor> {
    try {
      const response: AxiosResponse<Doctor> = await apiService.get(`/doctors/user/${userId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch doctor with user ID ${userId}`);
    }
  }

  /**
   * Get doctors managed by a user
   * @param managerId Manager user ID
   * @returns Promise with doctors array
   */
  public async getDoctorsManagedByUser(managerId: number): Promise<Doctor[]> {
    try {
      const response: AxiosResponse<Doctor[]> = await apiService.get(`/doctors/managed-by/${managerId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch doctors managed by user ID ${managerId}`);
    }
  }

  /**
   * Get doctor availability
   * @param doctorId Doctor ID
   * @returns Promise with availability data
   */
  public async getDoctorAvailability(doctorId: number): Promise<DoctorAvailability[]> {
    try {
      const response: AxiosResponse<DoctorAvailability[]> = await apiService.get(`/doctors/${doctorId}/availability`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch availability for doctor ID ${doctorId}`);
    }
  }

  /**
   * Get doctor absences
   * @param doctorId Doctor ID
   * @returns Promise with absence data
   */
  public async getDoctorAbsences(doctorId: number): Promise<DoctorAbsence[]> {
    try {
      const response: AxiosResponse<DoctorAbsence[]> = await apiService.get(`/doctors/${doctorId}/absences`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch absences for doctor ID ${doctorId}`);
    }
  }

  /**
   * Set doctor availability
   * @param doctorId Doctor ID
   * @param dayOfWeek Day of week
   * @param startTime Start time
   * @param endTime End time
   * @returns Promise with availability data
   */
  public async setDoctorAvailability(
    doctorId: number, 
    dayOfWeek: string, 
    startTime: string, 
    endTime: string
  ): Promise<DoctorAvailability> {
    try {
      const response: AxiosResponse<DoctorAvailability> = await apiService.post(
        `/doctors/${doctorId}/availability`, 
        { dayOfWeek, startTime, endTime }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to set availability for doctor ID ${doctorId}`);
    }
  }

  /**
   * Remove doctor availability
   * @param doctorId Doctor ID
   * @param dayOfWeek Day of week
   * @returns Promise with success status
   */
  public async removeDoctorAvailability(doctorId: number, dayOfWeek: string): Promise<boolean> {
    try {
      await apiService.delete(`/doctors/${doctorId}/availability/${dayOfWeek}`);
      return true;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to remove availability for doctor ID ${doctorId}`);
    }
  }

  /**
   * Add doctor absence
   * @param doctorId Doctor ID
   * @param startDate Start date
   * @param endDate End date
   * @param reason Reason for absence
   * @returns Promise with absence data
   */
  public async addDoctorAbsence(
    doctorId: number, 
    startDate: string, 
    endDate: string, 
    reason: string
  ): Promise<DoctorAbsence> {
    try {
      const response: AxiosResponse<DoctorAbsence> = await apiService.post(
        `/doctors/${doctorId}/absence`, 
        { startDate, endDate, reason }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to add absence for doctor ID ${doctorId}`);
    }
  }

  /**
   * Remove doctor absence
   * @param doctorId Doctor ID
   * @param absenceId Absence ID
   * @returns Promise with success status
   */
  public async removeDoctorAbsence(doctorId: number, absenceId: number): Promise<boolean> {
    try {
      await apiService.delete(`/doctors/${doctorId}/absence/${absenceId}`);
      return true;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to remove absence for doctor ID ${doctorId}`);
    }
  }

  /**
   * Get available time slots for a doctor on a specific date
   * @param doctorId Doctor ID
   * @param date Date
   * @returns Promise with available time slots
   */
  public async getAvailableTimeSlots(doctorId: number, date: string): Promise<string[]> {
    try {
      const response: AxiosResponse<string[]> = await apiService.get(`/doctors/${doctorId}/available-slots/${date}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch available time slots for doctor ID ${doctorId}`);
    }
  }
}

// Export a singleton instance
export const doctorService = DoctorService.getInstance();
export default doctorService;
