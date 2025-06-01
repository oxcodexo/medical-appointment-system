import { AppointmentStatus } from "@medical-appointment-system/shared-types";

// Types for our application
export interface Doctor {
  id: number;
  name: string;
  specialtyId: number;
  specialty?: Specialty | null; // This is not in the model but populated by API
  image: string;
  bio: string;
  experience: string;
  rating: number;
  // Contact information
  email?: string;
  phone?: string;
  // Schedule information
  doctorAvailabilities?: DoctorAvailability[];
  doctorAbsences?: DoctorAbsence[]; 
  userId?: number; // Link to user account
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorAvailability {
  id: number;
  doctorId: number;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
}

export interface DoctorAbsence {
  id: number;
  doctorId: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  reason: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'patient' | 'responsable' | 'doctor' | 'admin';
  phone?: string;
  address?: string;
  doctorId?: number; // Only for responsables or doctors
  createdAt?: string;
  updatedAt?: string;
  // Relations that might be populated by API
  doctor?: Doctor;
  userProfile?: UserProfile; // Changed from profile to userProfile to match backend
  // We don't include password here for security reasons
}

export interface Appointment {
  id: number;
  doctorId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
  userId?: number; // Optional, only if booked by a registered user
  notes?: string; // Doctor's notes about appointment
  createdAt?: string;
  updatedAt?: string;
  // Relations that might be populated by API
  doctor?: Doctor;
  user?: User;
}

export interface Specialty {
  id: number;
  name: string;
}

export interface MedicalDossier {
  id: number;
  patientId: number; // User ID of patient
  patientName: string;
  createdAt?: string;
  updatedAt?: string;
  // Relations that might be populated by API
  history?: MedicalHistoryEntry[];
  patient?: User;
  exists?: boolean; // Used by the API to indicate if the dossier exists
}

export interface MedicalHistoryEntry {
  id: number;
  dossierId: number;
  appointmentId?: number; // Optional link to specific appointment
  date: string;
  doctorId: number;
  doctorName: string;
  notes: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string;
  createdAt?: string;
  updatedAt?: string;
  // Relations that might be populated by API
  doctor?: Doctor;
  appointment?: Appointment;
}

export interface UserProfile {
  id: number;
  userId: number;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  createdAt?: string;
  updatedAt?: string;
  user?: User;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  items: T[];
  metadata: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Filter types
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | number[] | null | undefined;
}

// Notification filter params
export interface NotificationFilterParams extends PaginationParams, FilterParams {
  isRead?: boolean;
  type?: string | string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent' | ('low' | 'normal' | 'high' | 'urgent')[];
  startDate?: string;
  endDate?: string;
  channel?: string | string[];
  deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'failed' | ('pending' | 'sent' | 'delivered' | 'failed')[];
}

// Notification template filter params
export interface NotificationTemplateFilterParams extends PaginationParams, FilterParams {
  name?: string;
  type?: string | string[];
  isActive?: boolean;
  channel?: string | string[];
}
