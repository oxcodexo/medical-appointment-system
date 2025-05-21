const db = require('../models');
const MedicalDossier = db.medicalDossier;
const MedicalHistoryEntry = db.medicalHistoryEntry;
const User = db.user;

// Get all medical dossiers
exports.findAll = async (req, res) => {
  try {
    const dossiers = await MedicalDossier.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    res.status(200).json(dossiers);
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while retrieving medical dossiers.'
    });
  }
};

// Get medical dossier by id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const dossier = await MedicalDossier.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: MedicalHistoryEntry,
          as: 'history'
        }
      ]
    });
    
    if (!dossier) {
      return res.status(404).json({
        message: `Medical dossier with id=${id} was not found.`
      });
    }
    
    res.status(200).json(dossier);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving Medical dossier with id=${id}`
    });
  }
};

// Get medical dossier by patient id
exports.findByPatient = async (req, res) => {
  const patientId = req.params.patientId;

  try {
    const dossier = await MedicalDossier.findOne({
      where: { patientId: patientId },
      include: [
        {
          model: MedicalHistoryEntry,
          as: 'history'
        }
      ]
    });
    
    if (!dossier) {
      return res.status(404).json({
        message: `Medical dossier for patient with id=${patientId} was not found.`
      });
    }
    
    res.status(200).json(dossier);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving Medical dossier for patient with id=${patientId}`
    });
  }
};

// Create a new medical dossier
exports.create = async (req, res) => {
  try {
    // Check if patient exists
    const patient = await User.findByPk(req.body.patientId);
    
    if (!patient) {
      return res.status(404).json({
        message: `Patient with id=${req.body.patientId} was not found.`
      });
    }
    
    // Check if dossier already exists for this patient
    const existingDossier = await MedicalDossier.findOne({
      where: { patientId: req.body.patientId }
    });
    
    if (existingDossier) {
      return res.status(400).json({
        message: `Medical dossier already exists for patient with id=${req.body.patientId}.`
      });
    }
    
    // Create dossier
    const dossier = await MedicalDossier.create({
      patientId: req.body.patientId,
      patientName: patient.name
    });
    
    res.status(201).json(dossier);
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while creating the Medical dossier.'
    });
  }
};

// Add medical history entry
exports.addHistoryEntry = async (req, res) => {
  const dossierId = req.params.dossierId;

  try {
    // Check if dossier exists
    const dossier = await MedicalDossier.findByPk(dossierId);
    
    if (!dossier) {
      return res.status(404).json({
        message: `Medical dossier with id=${dossierId} was not found.`
      });
    }
    
    // Create entry
    const entry = await MedicalHistoryEntry.create({
      ...req.body,
      dossierId: dossierId
    });
    
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while adding the Medical history entry.'
    });
  }
};

// Get medical history entry by id
exports.findHistoryEntry = async (req, res) => {
  const entryId = req.params.entryId;

  try {
    const entry = await MedicalHistoryEntry.findByPk(entryId);
    
    if (!entry) {
      return res.status(404).json({
        message: `Medical history entry with id=${entryId} was not found.`
      });
    }
    
    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving Medical history entry with id=${entryId}`
    });
  }
};

// Update medical history entry
exports.updateHistoryEntry = async (req, res) => {
  const entryId = req.params.entryId;

  try {
    const num = await MedicalHistoryEntry.update(req.body, {
      where: { id: entryId }
    });
    
    if (num == 1) {
      res.status(200).json({
        message: 'Medical history entry was updated successfully.'
      });
    } else {
      res.status(404).json({
        message: `Cannot update Medical history entry with id=${entryId}. Maybe entry was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error updating Medical history entry with id=${entryId}`
    });
  }
};

// Get medical notes for appointment
exports.getMedicalNotesForAppointment = async (req, res) => {
  const appointmentId = req.params.appointmentId;

  try {
    const entry = await MedicalHistoryEntry.findOne({
      where: { appointmentId: appointmentId }
    });
    
    if (!entry) {
      return res.status(404).json({
        message: `Medical notes for appointment with id=${appointmentId} were not found.`
      });
    }
    
    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving Medical notes for appointment with id=${appointmentId}`
    });
  }
};

// Get medical dossier by appointment id
exports.getByAppointmentId = async (req, res) => {
  const appointmentId = req.params.appointmentId;

  try {
    // First find the medical history entry for this appointment
    const entry = await MedicalHistoryEntry.findOne({
      where: { appointmentId: appointmentId }
    });
    
    // If there's no entry yet, return an empty object
    // This is not an error, it just means no medical notes have been added yet
    if (!entry) {
      return res.status(200).json({
        message: `No medical history entry exists yet for appointment with id=${appointmentId}`,
        exists: false
      });
    }
    
    // If we have an entry, get the full dossier with this entry
    const dossier = await MedicalDossier.findByPk(entry.dossierId, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: MedicalHistoryEntry,
          as: 'history',
          where: { appointmentId: appointmentId }
        }
      ]
    });
    
    if (!dossier) {
      return res.status(404).json({
        message: `Medical dossier for appointment with id=${appointmentId} was not found.`,
        exists: false
      });
    }
    
    res.status(200).json({
      ...dossier.toJSON(),
      exists: true
    });
  } catch (err) {
    console.error(`Error retrieving medical dossier for appointment with id=${appointmentId}:`, err);
    res.status(500).json({
      message: err.message || `Error retrieving Medical dossier for appointment with id=${appointmentId}`
    });
  }
};
