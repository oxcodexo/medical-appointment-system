const express = require('express');
const router = express.Router();
const medicalDossierController = require('../controllers/medicalDossier.controller');
const { authJwt, loadPermissions } = require('../middleware');
const permissionHelpers = require('../utils/permission-helpers');
const logger = require('../utils/logger');
const { MEDICAL_DOSSIER } = require('@medical-appointment-system/shared-types');

// Apply authentication and permissions middleware to all routes
router.use(authJwt.verifyToken);

// Get all medical dossiers (admin or doctor only)
router.get('/', permissionHelpers.checkMedicalDossierManagementAccess(), medicalDossierController.findAll);

// Get medical dossier by id (admin, doctor, or patient)
router.get('/:id', permissionHelpers.checkMedicalDossierAccess(), medicalDossierController.findOne);

// Get medical dossier by patient id (admin, doctor, or patient)
router.get('/patient/:patientId', permissionHelpers.checkMedicalDossierAccess(), medicalDossierController.findByPatient);

// Create a new medical dossier (admin or doctor only)
router.post('/', permissionHelpers.checkMedicalDossierManagementAccess(), medicalDossierController.create);

// Add medical history entry (doctor or admin only)
router.post('/:dossierId/history', permissionHelpers.checkMedicalDossierManagementAccess(), medicalDossierController.addHistoryEntry);

// Get medical history entry by id
router.get('/history/:entryId', permissionHelpers.checkMedicalDossierAccess(), medicalDossierController.findHistoryEntry);

// Update medical history entry (doctor or admin only)
router.put('/history/:entryId', permissionHelpers.checkMedicalDossierManagementAccess(), medicalDossierController.updateHistoryEntry);

// Get medical notes for appointment (doctor, admin, or patient)
router.get('/appointment/:appointmentId/notes', permissionHelpers.checkMedicalDossierAccess(), medicalDossierController.getMedicalNotesForAppointment);

// Get medical dossier by appointment id (doctor, admin, or patient)
router.get('/appointment/:appointmentId', permissionHelpers.checkMedicalDossierAccess(), medicalDossierController.getByAppointmentId);

module.exports = router;
