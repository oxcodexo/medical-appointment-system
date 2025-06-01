import axios from 'axios';
import { User, Doctor, Appointment, Specialty, MedicalDossier, MedicalHistoryEntry } from './types';

// Define interfaces for API data
interface UserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

interface UserProfileData {
  address?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
}

interface DoctorData {
  userId?: number;
  specialtyId?: number;
  name?: string;
  bio?: string;
  experience?: string;
  email?: string;
  phone?: string;
  image?: string;
  rating?: number;
}

interface AppointmentData {
  doctorId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  userId?: number | null;
  notes?: string | null;
}

interface SpecialtyData {
  name?: string;
  description?: string;
}

interface MedicalDossierData {
  patientId?: number;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
}

interface MedicalHistoryEntryData {
  date?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  prescriptions?: string;
  doctorId?: number;
  appointmentId?: number;
}

// Create axios instance with base URL
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medical_auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (name: string, email: string, password: string, role: string = 'patient') => {
    return api.post('/auth/register', { name, email, password, role });
  },
  login: (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },
  getProfile: () => {
    return api.get('/auth/profile');
  }
};

// User API
export const userApi = {
  getAll: () => {
    return api.get('/users');
  },
  getById: (id: number) => {
    return api.get(`/users/${id}`);
  },
  update: (id: number, userData: UserData) => {
    return api.put(`/users/${id}`, userData);
  },
  delete: (id: number) => {
    return api.delete(`/users/${id}`);
  },
  getUserProfile: (userId: number) => {
    return api.get(`/users/${userId}/profile`);
  },
  updateUserProfile: (userId: number, profileData: UserProfileData) => {
    return api.put(`/users/${userId}/profile`, profileData);
  }
};

// Doctor API
export const doctorApi = {
  getAll: () => {
    return api.get('/doctors');
  },
  getById: (id: number) => {
    return api.get(`/doctors/${id}`);
  },
  create: (doctorData: DoctorData) => {
    return api.post('/doctors', doctorData);
  },
  update: (id: number, doctorData: DoctorData) => {
    return api.put(`/doctors/${id}`, doctorData);
  },
  delete: (id: number) => {
    return api.delete(`/doctors/${id}`);
  },
  getBySpecialty: (specialtyId: number) => {
    return api.get(`/doctors/specialty/${specialtyId}`);
  },
  getByUserId: (userId: number) => {
    return api.get(`/doctors/user/${userId}`);
  },
  getManagedByUser: (managerId: number) => {
    return api.get(`/doctors/managed-by/${managerId}`);
  },
  getAvailability: (doctorId: number) => {
    return api.get(`/doctors/${doctorId}/availability`);
  },
  getAbsences: (doctorId: number) => {
    return api.get(`/doctors/${doctorId}/absences`);
  },
  setAvailability: (doctorId: number, dayOfWeek: string, startTime: string, endTime: string) => {
    return api.post(`/doctors/${doctorId}/availability`, { dayOfWeek, startTime, endTime });
  },
  removeAvailability: (doctorId: number, dayOfWeek: string) => {
    return api.delete(`/doctors/${doctorId}/availability/${dayOfWeek}`);
  },
  addAbsence: (doctorId: number, startDate: string, endDate: string, reason: string) => {
    return api.post(`/doctors/${doctorId}/absence`, { startDate, endDate, reason });
  },
  removeAbsence: (doctorId: number, absenceId: number) => {
    return api.delete(`/doctors/${doctorId}/absence/${absenceId}`);
  },
  getAvailableTimeSlots: (doctorId: number, date: string) => {
    return api.get(`/doctors/${doctorId}/available-slots/${date}`);
  }
};

// Appointment API
export const appointmentApi = {
  getAll: () => {
    return api.get('/appointments');
  },
  getById: (id: number) => {
    return api.get(`/appointments/${id}`);
  },
  create: (appointmentData: AppointmentData) => {
    return api.post('/appointments', appointmentData);
  },
  update: (id: number, appointmentData: AppointmentData) => {
    return api.put(`/appointments/${id}`, appointmentData);
  },
  delete: (id: number) => {
    return api.delete(`/appointments/${id}`);
  },
  updateStatus: (id: number, status: string, notes?: string) => {
    return api.put(`/appointments/${id}/status`, { status, notes });
  },
  getByDoctor: (doctorId: number) => {
    return api.get(`/appointments/doctor/${doctorId}`);
  },
  getByUser: (userId: number) => {
    return api.get(`/appointments/user/${userId}`);
  },
  cancel: (id: number) => {
    return api.put(`/appointments/${id}/cancel`);
  }
};

// Specialty API
export const specialtyApi = {
  getAll: () => {
    return api.get('/specialties');
  },
  getById: (id: number) => {
    return api.get(`/specialties/${id}`);
  },
  create: (specialtyData: SpecialtyData) => {
    return api.post('/specialties', specialtyData);
  },
  update: (id: number, specialtyData: SpecialtyData) => {
    return api.put(`/specialties/${id}`, specialtyData);
  },
  delete: (id: number) => {
    return api.delete(`/specialties/${id}`);
  }
};

// Medical Dossier API
export const medicalDossierApi = {
  getAll: () => {
    return api.get('/medical-dossiers');
  },
  getById: (id: number) => {
    return api.get(`/medical-dossiers/${id}`);
  },
  getByPatient: (patientId: number) => {
    return api.get(`/medical-dossiers/patient/${patientId}`);
  },
  create: (dossierData: MedicalDossierData) => {
    return api.post('/medical-dossiers', dossierData);
  },
  addHistoryEntry: (dossierId: number, entryData: MedicalHistoryEntryData) => {
    return api.post(`/medical-dossiers/${dossierId}/history`, entryData);
  },
  getHistoryEntry: (entryId: number) => {
    return api.get(`/medical-dossiers/history/${entryId}`);
  },
  updateHistoryEntry: (entryId: number, entryData: MedicalHistoryEntryData) => {
    return api.put(`/medical-dossiers/history/${entryId}`, entryData);
  },
  getMedicalNotesForAppointment: (appointmentId: number) => {
    return api.get(`/medical-dossiers/appointment/${appointmentId}/notes`);
  },
  getByAppointmentId: (appointmentId: number) => {
    return api.get(`/medical-dossiers/appointment/${appointmentId}`);
  }
};

// Export all APIs
export default {
  auth: authApi,
  users: userApi,
  doctors: doctorApi,
  appointments: appointmentApi,
  specialties: specialtyApi,
  medicalDossiers: medicalDossierApi
};
