const express = require('express');
const router = express.Router();
const medicalDossierController = require('../controllers/medicalDossier.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware.verifyToken);

// Get all medical dossiers (admin or doctor only)
router.get('/', authMiddleware.isResponsable, medicalDossierController.findAll);

// Get medical dossier by id (admin, doctor, or patient)
router.get('/:id', medicalDossierController.findOne);

// Get medical dossier by patient id (admin, doctor, or patient)
router.get('/patient/:patientId', medicalDossierController.findByPatient);

// Create a new medical dossier (admin or doctor only)
router.post('/', authMiddleware.isResponsable, medicalDossierController.create);

// Add medical history entry (doctor or admin only)
router.post('/:dossierId/history', authMiddleware.isResponsable, medicalDossierController.addHistoryEntry);

// Get medical history entry by id
router.get('/history/:entryId', medicalDossierController.findHistoryEntry);

// Update medical history entry (doctor or admin only)
router.put('/history/:entryId', authMiddleware.isResponsable, medicalDossierController.updateHistoryEntry);

// Get medical notes for appointment (doctor, admin, or patient)
router.get('/appointment/:appointmentId/notes', medicalDossierController.getMedicalNotesForAppointment);

// Get medical dossier by appointment id (doctor, admin, or patient)
router.get('/appointment/:appointmentId', medicalDossierController.getByAppointmentId);

module.exports = router;
