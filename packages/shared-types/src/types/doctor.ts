// Doctor-related type definitions shared between frontend and backend

import { Appointment, User } from "..";

/**
 * Doctor specialty interface - represents a medical specialty (renamed to avoid conflicts)
 */
export interface DoctorSpecialty {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Base doctor data interface - used for creating/updating doctors
 */
export interface DoctorData {
  userId?: number;
  specialtyId: number;
  bio?: string;
  experience?: string;
  yearsOfExperience?: number;
  languages?: string[];
  officeAddress?: string;
  officeHours?: string;
  acceptingNewPatients?: boolean;
  image?: string;
  rating?: number;
}

/**
 * Complete doctor interface - extends DoctorData with fields
 * that are set by the system
 */
export interface Doctor extends DoctorData {
  id: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  specialty?: DoctorSpecialty;
  doctorAvailabilities?: DoctorAvailability[];
  doctorAbsences?: DoctorAbsence[];
  appointments?: Appointment[];
  // medicalDossiers?: MedicalDossier[];
  // notifications?: Notification[];
  // templates?: Template[];

}

/**
 * Interface for doctor availability
 */
export interface DoctorAvailability {
  id: number;
  doctorId: number;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
}

/**
 * Interface for doctor absence
 */
export interface DoctorAbsence {
  id: number;
  doctorId: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  reason: string;
}

/**
 * Interface for doctor filters
 */
export interface DoctorFilters {
  specialtyId?: number;
  acceptingNewPatients?: boolean;
  searchTerm?: string;
  languages?: string[];
}

/**
 * Interface for doctor pagination options
 */
export interface DoctorPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'rating' | 'yearsOfExperience' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}
