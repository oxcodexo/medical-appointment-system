/**
 * Permission constants for the application
 * This file serves as a single source of truth for all permission strings
 * used throughout the application.
 */

// User permissions
const USER = {
  VIEW_ALL: 'user:view_all',
  VIEW_OWN: 'user:view_own',
  CREATE: 'user:create',
  UPDATE_ALL: 'user:update_all',
  UPDATE_OWN: 'user:update_own',
  DELETE: 'user:delete'
};

// Notification permissions
const NOTIFICATION = {
  VIEW_ALL: 'notification:view_all',
  VIEW_OWN: 'notification:view_own',
  CREATE: 'notification:create',
  MANAGE_ALL: 'notification:manage_all'
};

// Doctor permissions
const DOCTOR = {
  VIEW_ALL: 'doctor:view_all',
  VIEW_OWN: 'doctor:view_own',
  CREATE: 'doctor:create',
  UPDATE_ALL: 'doctor:update_all',
  UPDATE_OWN: 'doctor:update_own',
  DELETE: 'doctor:delete',
  MANAGE: 'doctor:manage'
};

// Appointment permissions
const APPOINTMENT = {
  VIEW_ALL: 'appointment:view_all',
  VIEW_OWN: 'appointment:view_own',
  CREATE: 'appointment:create',
  UPDATE_ALL: 'appointment:update_all',
  UPDATE_OWN: 'appointment:update_own',
  DELETE: 'appointment:delete'
};

// Specialty permissions
const SPECIALTY = {
  VIEW: 'specialty:view',
  CREATE: 'specialty:create',
  UPDATE: 'specialty:update',
  DELETE: 'specialty:delete'
};

// Medical Dossier permissions
const MEDICAL_DOSSIER = {
  VIEW_ALL: 'medicalDossier:view_all',
  MANAGE: 'medicalDossier:manage'
};

// Permission management permissions
const PERMISSION = {
  VIEW_ALL: 'permission:view_all',
  MANAGE: 'permission:manage'
};

module.exports = {
  USER,
  NOTIFICATION,
  DOCTOR,
  APPOINTMENT,
  SPECIALTY,
  MEDICAL_DOSSIER,
  PERMISSION
};
