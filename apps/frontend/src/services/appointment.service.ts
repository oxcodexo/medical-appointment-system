import { AxiosResponse, AxiosError } from 'axios';
import apiService from './api.service';

import type { 
  AppointmentData,
  Appointment,
  ApiError,
  AppointmentFilters,
} from '@medical-appointment-system/shared-types';

/**
 * Pagination response interface
 */
export interface PaginationResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}


/**
 * Appointment service for handling appointment-related operations
 */
class AppointmentService {
  private static instance: AppointmentService;

  private constructor() {}

  /**
   * Get the singleton instance of AppointmentService
   */
  public static getInstance(): AppointmentService {
    if (!AppointmentService.instance) {
      AppointmentService.instance = new AppointmentService();
    }
    return AppointmentService.instance;
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
   * Get all appointments
   * @param page Page number
   * @param limit Items per page
   * @param sortBy Field to sort by (default: 'date')
   * @param sortOrder Sort direction (default: 'DESC')
   * @param filters Optional filters
   * @returns Promise with appointments array and pagination data
   */
  public async getAllAppointments(
    page = 1, 
    limit = 10, 
    sortBy = 'date', 
    sortOrder = 'DESC',
    filters?: Partial<AppointmentFilters>
  ): Promise<{ appointments: Appointment[], pagination: PaginationResponse }> {
    try {
      const params = { page, limit, sortBy, sortOrder, ...filters };
      const response: AxiosResponse<{ appointments: Appointment[], pagination: PaginationResponse }> = 
        await apiService.get('/appointments', { params });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch appointments');
    }
  }

  /**
   * Get appointment by ID
   * @param id Appointment ID
   * @returns Promise with appointment data
   */
  public async getAppointmentById(id: number): Promise<Appointment> {
    try {
      const response: AxiosResponse<Appointment> = await apiService.get(`/appointments/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch appointment with ID ${id}`);
    }
  }

  /**
   * Create a new appointment
   * @param appointmentData Appointment data
   * @returns Promise with created appointment data
   */
  public async createAppointment(appointmentData: AppointmentData): Promise<Appointment> {
    try {
      // Validate required fields
      if (!appointmentData.doctorId || !appointmentData.date || !appointmentData.time || !appointmentData.reason) {
        throw new Error('Required fields missing: doctorId, date, time, and reason are required.');
      }

      // If it's a guest booking, validate guest fields
      if (appointmentData.isGuestBooking) {
        if (!appointmentData.patientName || !appointmentData.patientEmail || !appointmentData.patientPhone) {
          throw new Error('Guest bookings require patientName, patientEmail, and patientPhone.');
        }
      } else if (!appointmentData.userId) {
        // If not a guest booking and no userId, throw error
        throw new Error('Either userId or guest booking information must be provided.');
      }

      // Make API call to create appointment
      const response: AxiosResponse<{ message: string; appointment: Appointment }> = 
        await apiService.post('/appointments', appointmentData);
      
      return response.data.appointment;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to create appointment');
    }
  }

  /**
   * Update appointment data
   * @param id Appointment ID
   * @param appointmentData Appointment data to update
   * @returns Promise with updated appointment data
   */
  public async updateAppointment(id: number, appointmentData: AppointmentData): Promise<Appointment> {
    try {
      const response: AxiosResponse<Appointment> = await apiService.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to update appointment with ID ${id}`);
    }
  }

  /**
   * Delete appointment
   * @param id Appointment ID
   * @returns Promise with success status
   */
  public async deleteAppointment(id: number): Promise<boolean> {
    try {
      await apiService.delete(`/appointments/${id}`);
      return true;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to delete appointment with ID ${id}`);
    }
  }

  /**
   * Update appointment status
   * @param id Appointment ID
   * @param status New status
   * @param notes Optional notes
   * @returns Promise with updated appointment data
   */
  public async updateAppointmentStatus(id: number, status: string, notes?: string): Promise<Appointment> {
    try {
      const response: AxiosResponse<Appointment> = await apiService.put(`/appointments/${id}/status`, { status, notes });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to update status for appointment with ID ${id}`);
    }
  }

  /**
   * Restore canceled appointment
   * @param id Appointment ID
   * @returns Promise with updated appointment data
   */
  public async restoreAppointment(id: number): Promise<Appointment> {
    try {
      const response: AxiosResponse<Appointment> = await apiService.put(`/appointments/${id}/restore`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to restore appointment with ID ${id}`);
    }
  }

  /**
   * Get appointments by doctor
   * @param doctorId Doctor ID
   * @returns Promise with appointments array
   */
  public async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    try {
      const response: AxiosResponse<Appointment[]> = await apiService.get(`/appointments/doctor/${doctorId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch appointments for doctor with ID ${doctorId}`);
    }
  }

  /**
   * Get appointments by user
   * @param userId User ID
   * @returns Promise with appointments array
   */
  public async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    try {
      const response: AxiosResponse<Appointment[]> = await apiService.get(`/appointments/user/${userId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch appointments for user with ID ${userId}`);
    }
  }

  /**
   * Get appointments by date range
   * @param startDate Start date
   * @param endDate End date
   * @returns Promise with appointments array
   */
  public async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    try {
      const response: AxiosResponse<Appointment[]> = await apiService.get(
        `/appointments/date-range?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch appointments between ${startDate} and ${endDate}`);
    }
  }

  /**
   * Get upcoming appointments for a user
   * @param userId User ID
   * @returns Promise with appointments array
   */
  public async getUpcomingAppointmentsForUser(userId: number): Promise<Appointment[]> {
    try {
      const response: AxiosResponse<Appointment[]> = await apiService.get(`/appointments/user/${userId}/upcoming`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch upcoming appointments for user with ID ${userId}`);
    }
  }

  /**
   * Get past appointments for a user
   * @param userId User ID
   * @returns Promise with appointments array
   */
  public async getPastAppointmentsForUser(userId: number): Promise<Appointment[]> {
    try {
      const response: AxiosResponse<Appointment[]> = await apiService.get(`/appointments/user/${userId}/past`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch past appointments for user with ID ${userId}`);
    }
  }

  /**
   * Create a follow-up appointment
   * @param originalAppointmentId Original appointment ID
   * @param appointmentData New appointment data
   * @returns Promise with created appointment data
   */
  public async createFollowUpAppointment(
    originalAppointmentId: number, 
    appointmentData: AppointmentData
  ): Promise<Appointment> {
    try {
      const response: AxiosResponse<Appointment> = await apiService.post(
        `/appointments/${originalAppointmentId}/follow-up`, 
        appointmentData
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to create follow-up appointment for appointment with ID ${originalAppointmentId}`);
    }
  }

  /**
   * Cancel an appointment
   * @param id Appointment ID
   * @param reason Cancellation reason
   * @returns Promise with updated appointment data
   */
  public async cancelAppointment(id: number, reason: string): Promise<Appointment> {
    try {
      const response: AxiosResponse<Appointment> = await apiService.put(
        `/appointments/${id}/cancel`, 
        { reason }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to cancel appointment with ID ${id}`);
    }
  }

  /**
   * Reschedule an appointment
   * @param id Appointment ID
   * @param newDate New date
   * @param newTime New time
   * @param reason Reschedule reason
   * @returns Promise with updated appointment data
   */
  public async rescheduleAppointment(
    id: number, 
    newDate: string, 
    newTime: string, 
    reason: string
  ): Promise<Appointment> {
    try {
      const response: AxiosResponse<Appointment> = await apiService.put(
        `/appointments/${id}/reschedule`, 
        { newDate, newTime, reason }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to reschedule appointment with ID ${id}`);
    }
  }
}

// Export a singleton instance
export const appointmentService = AppointmentService.getInstance();
export default appointmentService;
