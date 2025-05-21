const bcrypt = require('bcryptjs');
const db = require('../models');

// Models
const User = db.user;
const Doctor = db.doctor;
const Specialty = db.specialty;
const DoctorAvailability = db.doctorAvailability;
const DoctorAbsence = db.doctorAbsence;
const Appointment = db.appointment;
const MedicalDossier = db.medicalDossier;
const MedicalHistoryEntry = db.medicalHistoryEntry;
const UserProfile = db.userProfile;

// Seed the database with initial data
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Seed specialties
    const specialties = [
      { name: 'Cardiology' },
      { name: 'Dermatology' },
      { name: 'Neurology' },
      { name: 'Orthopedics' },
      { name: 'Pediatrics' },
      { name: 'Psychiatry' },
      { name: 'Family Medicine' },
      { name: 'Internal Medicine' },
      { name: 'Ophthalmology' },
      { name: 'Gynecology' },
    ];

    const createdSpecialties = await Specialty.bulkCreate(specialties);
    console.log(`Created ${createdSpecialties.length} specialties`);

    // Seed users
    const users = [
      {
        email: 'admin@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'patient@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'John Doe',
        role: 'patient',
        phone: '+1 (555) 987-6543'
      },
      {
        email: 'responsable1@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Jane Smith',
        role: 'responsable'
      },
      {
        email: 'dr.johnson@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Dr. Sarah Johnson',
        role: 'doctor',
        phone: '+1 (555) 123-4567'
      },
      {
        email: 'dr.chen@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Dr. Michael Chen',
        role: 'doctor',
        phone: '+1 (555) 234-5678'
      }
    ];

    const createdUsers = await User.bulkCreate(users);
    console.log(`Created ${createdUsers.length} users`);

    // Seed doctors
    const doctors = [
      {
        name: 'Dr. Sarah Johnson',
        specialtyId: 1, // Cardiology
        image: '/placeholder.svg',
        bio: 'Dr. Johnson is a board-certified cardiologist with over 15 years of experience in diagnosing and treating heart conditions.',
        experience: '15 years',
        rating: 4.9,
        userId: 4, // Link to user account
        email: 'dr.johnson@example.com',
        phone: '+1 (555) 123-4567'
      },
      {
        name: 'Dr. Michael Chen',
        specialtyId: 2, // Dermatology
        image: '/placeholder.svg',
        bio: 'Dr. Chen specializes in treating skin disorders and is known for his expertise in cosmetic dermatology.',
        experience: '10 years',
        rating: 4.7,
        userId: 5, // Link to user account
        email: 'dr.chen@example.com',
        phone: '+1 (555) 234-5678'
      },
      {
        name: 'Dr. Emily Rodriguez',
        specialtyId: 3, // Neurology
        image: '/placeholder.svg',
        bio: 'Dr. Rodriguez is a neurologist specialized in treating disorders of the brain, spinal cord, and nerves.',
        experience: '12 years',
        rating: 4.8
      },
      {
        name: 'Dr. James Wilson',
        specialtyId: 4, // Orthopedics
        image: '/placeholder.svg',
        bio: 'Dr. Wilson specializes in treating conditions related to the musculoskeletal system, including bones, joints, and muscles.',
        experience: '20 years',
        rating: 4.6
      },
      {
        name: 'Dr. Lisa Patel',
        specialtyId: 5, // Pediatrics
        image: '/placeholder.svg',
        bio: 'Dr. Patel is a pediatrician dedicated to the health and well-being of children from birth through adolescence.',
        experience: '8 years',
        rating: 4.9
      }
    ];

    const createdDoctors = await Doctor.bulkCreate(doctors);
    console.log(`Created ${createdDoctors.length} doctors`);

    // Update user records with doctorId
    await User.update({ doctorId: 1 }, { where: { id: 4 } });
    await User.update({ doctorId: 2 }, { where: { id: 5 } });

    // Seed doctor availabilities
    const doctorAvailabilities = [
      { 
        doctorId: 1, 
        dayOfWeek: 'monday', 
        startTime: '09:00', 
        endTime: '17:00' 
      },
      { 
        doctorId: 1, 
        dayOfWeek: 'tuesday', 
        startTime: '10:00', 
        endTime: '18:00' 
      },
      { 
        doctorId: 1, 
        dayOfWeek: 'wednesday', 
        startTime: '09:00', 
        endTime: '17:00' 
      },
      { 
        doctorId: 1, 
        dayOfWeek: 'thursday', 
        startTime: '09:00', 
        endTime: '17:00' 
      },
      { 
        doctorId: 1, 
        dayOfWeek: 'friday', 
        startTime: '09:00', 
        endTime: '16:00' 
      },
      { 
        doctorId: 2, 
        dayOfWeek: 'monday', 
        startTime: '10:00', 
        endTime: '18:00' 
      },
      { 
        doctorId: 2, 
        dayOfWeek: 'wednesday', 
        startTime: '10:00', 
        endTime: '18:00' 
      },
      { 
        doctorId: 2, 
        dayOfWeek: 'friday', 
        startTime: '09:00', 
        endTime: '15:00' 
      }
    ];

    const createdAvailabilities = await DoctorAvailability.bulkCreate(doctorAvailabilities);
    console.log(`Created ${createdAvailabilities.length} doctor availabilities`);

    // Seed doctor absences
    const doctorAbsences = [
      {
        doctorId: 1,
        startDate: '2025-06-15',
        endDate: '2025-06-22',
        reason: 'Annual leave'
      },
      {
        doctorId: 2,
        startDate: '2025-07-01',
        endDate: '2025-07-10',
        reason: 'Medical conference'
      }
    ];

    const createdAbsences = await DoctorAbsence.bulkCreate(doctorAbsences);
    console.log(`Created ${createdAbsences.length} doctor absences`);

    // Seed appointments
    const appointments = [
      {
        doctorId: 1,
        patientName: 'John Doe',
        patientEmail: 'john.doe@example.com',
        patientPhone: '(123) 456-7890',
        date: '2025-06-01',
        time: '09:00',
        status: 'confirmed',
        reason: 'Annual checkup',
        userId: 2,
        createdAt: new Date('2025-05-15T10:30:00Z')
      },
      {
        doctorId: 2,
        patientName: 'Jane Smith',
        patientEmail: 'jane.smith@example.com',
        patientPhone: '(234) 567-8901',
        date: '2025-06-02',
        time: '14:00',
        status: 'confirmed',
        reason: 'Skin rash',
        createdAt: new Date('2025-05-16T09:15:00Z')
      },
      {
        doctorId: 1,
        patientName: 'Michael Wilson',
        patientEmail: 'michael.wilson@example.com',
        patientPhone: '(567) 890-1234',
        date: '2025-06-04',
        time: '15:30',
        status: 'pending',
        reason: 'Knee pain',
        createdAt: new Date('2025-05-17T11:50:00Z')
      }
    ];

    const createdAppointments = await Appointment.bulkCreate(appointments);
    console.log(`Created ${createdAppointments.length} appointments`);

    // Seed medical dossiers
    const medicalDossiers = [
      {
        patientId: 2,
        patientName: 'John Doe'
      }
    ];

    const createdDossiers = await MedicalDossier.bulkCreate(medicalDossiers);
    console.log(`Created ${createdDossiers.length} medical dossiers`);

    // Seed medical history entries
    const medicalHistoryEntries = [
      {
        dossierId: 1,
        appointmentId: 1,
        date: '2025-06-01',
        doctorId: 1,
        doctorName: 'Dr. Sarah Johnson',
        notes: 'Patient came in for annual checkup. All vitals normal.',
        diagnosis: 'Healthy',
        treatment: 'None needed',
        prescriptions: 'Vitamin D supplement'
      }
    ];

    const createdEntries = await MedicalHistoryEntry.bulkCreate(medicalHistoryEntries);
    console.log(`Created ${createdEntries.length} medical history entries`);

    // Seed user profiles
    const userProfiles = [
      {
        userId: 2,
        phoneNumber: '+1 (555) 987-6543',
        address: '123 Main St, Anytown, USA',
        dateOfBirth: '1985-05-15',
        gender: 'male',
        emergencyContact: 'Jane Doe, +1 (555) 123-4567',
        bloodType: 'O+',
        allergies: JSON.stringify(['Penicillin']),
        chronicConditions: JSON.stringify(['Hypertension'])
      }
    ];

    const createdProfiles = await UserProfile.bulkCreate(userProfiles);
    console.log(`Created ${createdProfiles.length} user profiles`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
