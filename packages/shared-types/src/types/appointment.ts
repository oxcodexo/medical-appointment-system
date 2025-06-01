// Appointment-related type definitions shared between frontend and backend

import { User, Doctor } from "..";

/**
 * Appointment status options
 */
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  COMPLETED = 'completed',
  NO_SHOW = 'no-show',
  REJECTED = 'rejected'
}

/**
 * Base appointment data interface - used for creating appointments
 */
export interface AppointmentData {
  // Required fields
  doctorId: number;
  date: string;  // Format: YYYY-MM-DD
  time: string;  // Format: HH:MM (24-hour)
  reason: string;
  
  // User identification (either userId for registered users or guest info)
  userId?: number | null;
  
  // Guest booking fields
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  isGuestBooking?: boolean;
  
  // Optional fields
  status?: AppointmentStatus;
  notes?: string | null;
  duration?: number;  // in minutes, default: 30
  isFollowUp?: boolean;
  previousAppointmentId?: number | null;
  reminderSent?: boolean;
  reminderType?: string;
  insuranceInfo?: string;
}

/**
 * Complete appointment interface - extends AppointmentData with fields
 * that are set by the system
 */
export interface Appointment extends AppointmentData {
  id: number;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  cancelReason?: string | null;
  canceledBy?: 'patient' | 'doctor' | 'system' | null;
  followUpNeeded?: boolean;
  followUpDate?: string | null;
  user?: User;
  doctor?: Doctor;
}

/**
 * Interface for appointment filters
 */
export interface AppointmentFilters {
  doctorId?: number;
  userId?: number;
  status?: AppointmentStatus | AppointmentStatus[];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

/**
 * Interface for appointment pagination options
 */
export interface AppointmentPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'time' | 'createdAt' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}
