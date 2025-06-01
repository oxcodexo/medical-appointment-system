/**
 * Permission constants for the application
 * This file serves as a single source of truth for all permission strings
 * used throughout the application.
 */

// User permissions
export const USER = {
  VIEW_ALL: 'user:view_all',
  VIEW_OWN: 'user:view_own',
  CREATE: 'user:create',
  UPDATE_ALL: 'user:update_all',
  UPDATE_OWN: 'user:update_own',
  DELETE: 'user:delete'
} as const;

// Notification permissions
export const NOTIFICATION = {
  VIEW_ALL: 'notification:view_all',
  VIEW_OWN: 'notification:view_own',
  CREATE: 'notification:create',
  UPDATE_ALL: 'notification:update_all',
  UPDATE_OWN: 'notification:update_own',
  MANAGE_ALL: 'notification:manage_all',
  DELETE: 'notification:delete'
} as const;

// Doctor permissions
export const DOCTOR = {
  VIEW_ALL: 'doctor:view_all',
  VIEW_OWN: 'doctor:view_own',
  CREATE: 'doctor:create',
  UPDATE_ALL: 'doctor:update_all',
  UPDATE_OWN: 'doctor:update_own',
  DELETE: 'doctor:delete',
  MANAGE: 'doctor:manage',
  VIEW_AVAILABILITY: 'doctor:view_availability',
  MANAGE_AVAILABILITY: 'doctor:manage_availability',
  VIEW_ABSENCES: 'doctor:view_absences',
  MANAGE_ABSENCES: 'doctor:manage_absences',
  APPROVE_ABSENCES: 'doctor:approve_absences',
  VIEW_STATISTICS: 'doctor:view_statistics'
} as const;

// Appointment permissions
export const APPOINTMENT = {
  VIEW_ALL: 'appointment:view_all',
  VIEW_OWN: 'appointment:view_own',
  CREATE: 'appointment:create',
  UPDATE_ALL: 'appointment:update_all',
  UPDATE_OWN: 'appointment:update_own',
  UPDATE_STATUS: 'appointment:update_status',
  DELETE: 'appointment:delete'
} as const;

// Specialty permissions
export const SPECIALTY = {
  VIEW_ALL: 'specialty:view_all',
  VIEW_OWN: 'specialty:view_own',
  CREATE: 'specialty:create',
  UPDATE_ALL: 'specialty:update_all',
  UPDATE_OWN: 'specialty:update_own',
  DELETE: 'specialty:delete'
} as const;

// Medical Dossier permissions
export const MEDICAL_DOSSIER = {
  VIEW_ALL: 'medicalDossier:view_all',
  MANAGE: 'medicalDossier:manage'
} as const;

// Notification Template permissions
export const TEMPLATE = {
  VIEW: 'template:view',
  CREATE: 'template:create',
  UPDATE: 'template:update',
  DELETE: 'template:delete'
} as const;

// Permission management permissions
export const PERMISSION = {
  VIEW_ALL: 'permission:view_all',
  MANAGE: 'permission:manage'
} as const;

// Create a type that includes all permission values
export type PermissionValue = 
  | typeof USER[keyof typeof USER]
  | typeof NOTIFICATION[keyof typeof NOTIFICATION]
  | typeof DOCTOR[keyof typeof DOCTOR]
  | typeof APPOINTMENT[keyof typeof APPOINTMENT]
  | typeof SPECIALTY[keyof typeof SPECIALTY]
  | typeof MEDICAL_DOSSIER[keyof typeof MEDICAL_DOSSIER]
  | typeof TEMPLATE[keyof typeof TEMPLATE]
  | typeof PERMISSION[keyof typeof PERMISSION];

// Create a permissions object that includes all permission categories
export const PERMISSIONS = {
  USER,
  NOTIFICATION,
  DOCTOR,
  APPOINTMENT,
  SPECIALTY,
  MEDICAL_DOSSIER,
  TEMPLATE,
  PERMISSION
} as const;
