const bcrypt = require('bcryptjs');
const db = require('../models');
const { USER, NOTIFICATION, DOCTOR, APPOINTMENT, SPECIALTY, MEDICAL_DOSSIER, PERMISSION, TEMPLATE } = require('@medical-appointment-system/shared-types');

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
const Notification = db.notification;
const NotificationTemplate = db.notificationTemplate;
const Permission = db.permission;
const UserPermission = db.userPermission;

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

    // Seed permissions using the shared constants from shared-types package
    const permissions = [
      // User permissions
      { name: USER.CREATE, description: 'Create new users' },
      { name: USER.VIEW_ALL, description: 'View all users' },
      { name: USER.VIEW_OWN, description: 'View own user details' },
      { name: USER.UPDATE_ALL, description: 'Update any user' },
      { name: USER.UPDATE_OWN, description: 'Update own user details' },
      { name: USER.DELETE, description: 'Delete users' },
      
      // Doctor permissions
      { name: DOCTOR.CREATE, description: 'Create doctor profiles' },
      { name: DOCTOR.VIEW_ALL, description: 'View all doctors' },
      { name: DOCTOR.VIEW_OWN, description: 'View own doctor profile' },
      { name: DOCTOR.UPDATE_ALL, description: 'Update any doctor profile' },
      { name: DOCTOR.UPDATE_OWN, description: 'Update own doctor profile' },
      { name: DOCTOR.DELETE, description: 'Delete doctor profiles' },
      { name: DOCTOR.MANAGE, description: 'Manage doctors (for responsables)' },
      { name: DOCTOR.VIEW_AVAILABILITY, description: 'View doctor availability' },
      { name: DOCTOR.MANAGE_AVAILABILITY, description: 'Manage doctor availability' },
      { name: DOCTOR.VIEW_ABSENCES, description: 'View doctor absences' },
      { name: DOCTOR.MANAGE_ABSENCES, description: 'Manage doctor absences' },
      { name: DOCTOR.APPROVE_ABSENCES, description: 'Approve or reject doctor absences' },
      { name: DOCTOR.VIEW_STATISTICS, description: 'View doctor statistics' },
      
      // Appointment permissions
      { name: APPOINTMENT.CREATE, description: 'Create appointments' },
      { name: APPOINTMENT.VIEW_ALL, description: 'View all appointments' },
      { name: APPOINTMENT.VIEW_OWN, description: 'View own appointments' },
      { name: APPOINTMENT.UPDATE_ALL, description: 'Update any appointment' },
      { name: APPOINTMENT.UPDATE_OWN, description: 'Update own appointments' },
      { name: APPOINTMENT.UPDATE_STATUS, description: 'Update appointment status' },
      { name: APPOINTMENT.DELETE, description: 'Delete appointments' },
      
      // Notification permissions
      { name: NOTIFICATION.CREATE, description: 'Create notifications' },
      { name: NOTIFICATION.VIEW_ALL, description: 'View all notifications' },
      { name: NOTIFICATION.VIEW_OWN, description: 'View own notifications' },
      { name: NOTIFICATION.UPDATE_ALL, description: 'Update any notification' },
      { name: NOTIFICATION.UPDATE_OWN, description: 'Update own notifications' },
      { name: NOTIFICATION.MANAGE_ALL, description: 'Manage all notifications' },
      { name: NOTIFICATION.DELETE, description: 'Delete notifications' },
      
      // Template permissions
      { name: TEMPLATE.CREATE, description: 'Create notification templates' },
      { name: TEMPLATE.VIEW, description: 'View notification templates' },
      { name: TEMPLATE.UPDATE, description: 'Update notification templates' },
      { name: TEMPLATE.DELETE, description: 'Delete notification templates' },
      
      // Specialty permissions
      { name: SPECIALTY.VIEW_ALL, description: 'View all specialties' },
      { name: SPECIALTY.CREATE, description: 'Create specialties' },
      { name: SPECIALTY.UPDATE_ALL, description: 'Update any specialties' },
      { name: SPECIALTY.UPDATE_OWN, description: 'Update own specialties' },
      { name: SPECIALTY.DELETE, description: 'Delete specialties' },
      
      // Medical Dossier permissions
      { name: MEDICAL_DOSSIER.VIEW_ALL, description: 'View all medical dossiers' },
      { name: MEDICAL_DOSSIER.MANAGE, description: 'Manage medical dossiers' },
      
      // Permission management permissions
      { name: PERMISSION.VIEW_ALL, description: 'View all permissions' },
      { name: PERMISSION.MANAGE, description: 'Manage permissions' }
    ];

    const createdPermissions = await Permission.bulkCreate(permissions);
    console.log(`Created ${createdPermissions.length} permissions`);

    // Seed notification templates
    const notificationTemplates = [
      {
        name: 'appointment_reminder',
        description: 'Reminder for upcoming appointments',
        titleTemplate: 'Appointment Reminder: {{date}}',
        contentTemplate: 'Hello {{name}}, this is a reminder that you have an appointment with {{doctorName}} on {{date}} at {{time}}.',
        type: 'reminder',
        requiredVariables: 'name,doctorName,date,time',
        availableChannels: 'in-app,email',
        isActive: true,
        defaultPriority: 'normal',
        category: 'appointment'
      },
      {
        name: 'appointment_confirmation',
        description: 'Confirmation for booked appointments',
        titleTemplate: 'Appointment Confirmation: {{date}}',
        contentTemplate: 'Hello {{name}}, your appointment with {{doctorName}} on {{date}} at {{time}} has been confirmed.',
        type: 'confirmation',
        requiredVariables: 'name,doctorName,date,time',
        availableChannels: 'in-app,email',
        isActive: true,
        defaultPriority: 'normal',
        category: 'appointment'
      },
      {
        name: 'appointment_cancellation',
        description: 'Notification for cancelled appointments',
        titleTemplate: 'Appointment Cancellation: {{date}}',
        contentTemplate: 'Hello {{name}}, your appointment with {{doctorName}} on {{date}} at {{time}} has been cancelled. {{reason}}',
        type: 'cancellation',
        requiredVariables: 'name,doctorName,date,time,reason',
        availableChannels: 'in-app,email',
        isActive: true,
        defaultPriority: 'high',
        category: 'appointment'
      },
      {
        name: 'user_welcome',
        description: 'Welcome message for new users',
        titleTemplate: 'Welcome to Medical Appointment System',
        contentTemplate: 'Welcome {{name}}! Thank you for joining our medical appointment system. We are excited to have you on board.',
        type: 'welcome',
        requiredVariables: 'name',
        availableChannels: 'in-app,email',
        isActive: true,
        defaultPriority: 'normal',
        category: 'user'
      },
      {
        name: 'password_reset',
        description: 'Password reset notification',
        titleTemplate: 'Password Reset Request',
        contentTemplate: 'Hello {{name}}, we received a request to reset your password. Please use the following link to reset your password: {{resetLink}}',
        type: 'security',
        requiredVariables: 'name,resetLink',
        availableChannels: 'email,in-app',
        isActive: true,
        defaultPriority: 'urgent',
        category: 'security'
      }
    ];

    const createdTemplates = await NotificationTemplate.bulkCreate(notificationTemplates);
    console.log(`Created ${createdTemplates.length} notification templates`);

    // Seed users
    const users = [
      {
        email: 'admin@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        lastLogin: new Date()
      },
      {
        email: 'patient@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'John Doe',
        role: 'patient',
        phone: '+1 (555) 987-6543',
        status: 'active',
        emailVerified: true,
        lastLogin: new Date()
      },
      {
        email: 'responsable1@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Jane Smith',
        role: 'responsable',
        status: 'active',
        emailVerified: true
      },
      {
        email: 'dr.johnson@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Dr. Sarah Johnson',
        role: 'doctor',
        phone: '+1 (555) 123-4567',
        status: 'active',
        emailVerified: true,
        lastLogin: new Date()
      },
      {
        email: 'dr.chen@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Dr. Michael Chen',
        role: 'doctor',
        phone: '+1 (555) 234-5678',
        status: 'active',
        emailVerified: true,
        lastLogin: new Date()
      }
    ];

    const createdUsers = await User.bulkCreate(users);
    console.log(`Created ${createdUsers.length} users`);

    // Seed user profiles
    const userProfiles = [
      {
        userId: 1, // Admin
        phoneNumber: null,
        address: null,
        dateOfBirth: null,
        gender: null
      },
      {
        userId: 2, // Patient
        phoneNumber: '+1 (555) 987-6543',
        address: '123 Main St, Anytown, USA',
        dateOfBirth: '1985-05-15',
        gender: 'male',
        emergencyContact: 'Jane Doe, +1 (555) 987-1234',
        bloodType: 'O+',
        allergies: JSON.stringify(['Penicillin', 'Peanuts']),
        chronicConditions: JSON.stringify(['Hypertension'])
      },
      {
        userId: 3, // Responsable
        phoneNumber: null,
        address: '456 Oak Ave, Anytown, USA',
        dateOfBirth: '1980-10-20',
        gender: 'female'
      },
      {
        userId: 4, // Doctor Johnson
        phoneNumber: '+1 (555) 123-4567',
        address: '789 Pine St, Anytown, USA',
        dateOfBirth: '1975-03-12',
        gender: 'female'
      },
      {
        userId: 5, // Doctor Chen
        phoneNumber: '+1 (555) 234-5678',
        address: '101 Maple Dr, Anytown, USA',
        dateOfBirth: '1982-07-28',
        gender: 'male'
      }
    ];

    const createdProfiles = await UserProfile.bulkCreate(userProfiles);
    console.log(`Created ${createdProfiles.length} user profiles`);

    // Seed user permissions for all user roles
    // Instead of using fixed permissionIds, we'll look up the permissions by name to ensure correctness
    // This approach is more resilient to changes in the permission order
    const findPermissionId = async (name) => {
      const permission = await Permission.findOne({ where: { name } });
      if (!permission) {
        console.error(`Permission '${name}' not found`);
        return null;
      }
      return permission.id;
    };

    // Create a map of permission names to IDs
    const permissionMap = {};
    for (const permission of createdPermissions) {
      permissionMap[permission.name] = permission.id;
    }

    // Define the permissions for each role
    const userPermissions = [];

    // Admin user permissions - has all permissions
    for (const permission of createdPermissions) {
      userPermissions.push({
        userId: 1, // admin@example.com
        permissionId: permission.id,
        isGranted: true
      });
    }

    // Patient user permissions (userId 2 is patient@example.com)
    const patientPermissions = [
      USER.VIEW_OWN,
      USER.UPDATE_OWN,
      APPOINTMENT.CREATE,
      APPOINTMENT.VIEW_OWN,
      APPOINTMENT.UPDATE_OWN,
      APPOINTMENT.UPDATE_STATUS, // Needed to cancel their own appointments
      NOTIFICATION.VIEW_OWN,
      NOTIFICATION.UPDATE_OWN
    ];

    for (const permName of patientPermissions) {
      if (permissionMap[permName]) {
        userPermissions.push({
          userId: 2,
          permissionId: permissionMap[permName],
          isGranted: true
        });
      }
    }

    // Responsable user permissions (userId 3 is Jane Smith with role 'responsable')
    const responsablePermissions = [
      USER.VIEW_OWN,
      USER.UPDATE_OWN,
      DOCTOR.VIEW_ALL,
      DOCTOR.MANAGE,
      DOCTOR.VIEW_AVAILABILITY,
      DOCTOR.MANAGE_AVAILABILITY,
      DOCTOR.VIEW_ABSENCES,
      DOCTOR.MANAGE_ABSENCES,
      APPOINTMENT.CREATE,
      APPOINTMENT.VIEW_ALL,
      APPOINTMENT.UPDATE_ALL,
      APPOINTMENT.UPDATE_OWN,
      APPOINTMENT.UPDATE_STATUS,
      APPOINTMENT.VIEW_OWN,
      NOTIFICATION.VIEW_OWN,
      NOTIFICATION.UPDATE_OWN
    ];

    for (const permName of responsablePermissions) {
      if (permissionMap[permName]) {
        userPermissions.push({
          userId: 3,
          permissionId: permissionMap[permName],
          isGranted: true
        });
      }
    }

    // Doctor permissions (userId 4 is Dr. Sarah Johnson with role 'doctor')
    // Doctor permissions (userId 5 is Dr. Michael Chen with role 'doctor')
    const doctorPermissions = [
      USER.VIEW_OWN,
      USER.UPDATE_OWN,
      DOCTOR.VIEW_OWN,
      DOCTOR.UPDATE_OWN,
      DOCTOR.VIEW_AVAILABILITY,
      DOCTOR.MANAGE_AVAILABILITY,
      DOCTOR.VIEW_ABSENCES,
      DOCTOR.MANAGE_ABSENCES,
      APPOINTMENT.CREATE,
      APPOINTMENT.VIEW_OWN,
      APPOINTMENT.UPDATE_ALL,
      APPOINTMENT.UPDATE_STATUS,
      APPOINTMENT.UPDATE_OWN,
      NOTIFICATION.VIEW_OWN,
      NOTIFICATION.UPDATE_OWN,
      MEDICAL_DOSSIER.VIEW_ALL,
      MEDICAL_DOSSIER.MANAGE
    ];

    // Apply doctor permissions to both doctors
    for (const doctorId of [4, 5]) {
      for (const permName of doctorPermissions) {
        if (permissionMap[permName]) {
          userPermissions.push({
            userId: doctorId,
            permissionId: permissionMap[permName],
            isGranted: true
          });
        }
      }
    }

    const createdUserPermissions = await UserPermission.bulkCreate(userPermissions);
    console.log(`Created ${createdUserPermissions.length} user permissions`);

    // Seed doctors
    const doctors = [
      {
        specialtyId: 1, // Cardiology
        image: '/placeholder.svg',
        bio: 'Dr. Johnson is a board-certified cardiologist with over 15 years of experience in diagnosing and treating heart conditions.',
        experience: '15 years',
        yearsOfExperience: 15,
        rating: 4.9,
        reviewCount: 120,
        officeAddress: '123 Medical Center Blvd, Anytown, USA',
        officeHours: 'Mon-Fri 9:00-17:00',
        acceptingNewPatients: true,
        languages: ['English', 'Spanish'],
        userId: 4 // Link to user account
      },
      {
        specialtyId: 2, // Dermatology
        image: '/placeholder.svg',
        bio: 'Dr. Chen specializes in treating skin disorders and is known for his expertise in cosmetic dermatology.',
        experience: '10 years',
        yearsOfExperience: 10,
        rating: 4.7,
        reviewCount: 85,
        officeAddress: '456 Health Parkway, Anytown, USA',
        officeHours: 'Mon-Thu 8:00-16:00, Fri 8:00-12:00',
        acceptingNewPatients: true,
        languages: ['English', 'Mandarin'],
        userId: 5 // Link to user account
      }
    ];

    const createdDoctors = await Doctor.bulkCreate(doctors);
    console.log(`Created ${createdDoctors.length} doctors`);

    // Update user records with doctorId
    await User.update({ doctorId: 1 }, { where: { id: 4 } });
    await User.update({ doctorId: 2 }, { where: { id: 5 } });

    // Seed sample notifications
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const notifications = [
      {
        userId: 2, // Patient
        type: 'reminder',
        title: 'Appointment Reminder',
        content: 'Hello John Doe, this is a reminder that you have an appointment with Dr. Sarah Johnson on tomorrow at 10:00 AM.',
        isRead: false,
        readAt: null,
        priority: 'normal',
        channel: 'in-app',
        deliveryStatus: 'delivered',
        templateId: 1, // appointment_reminder template
        variables: JSON.stringify({
          name: 'John Doe',
          doctorName: 'Dr. Sarah Johnson',
          date: 'tomorrow',
          time: '10:00 AM'
        }),
        createdAt: yesterday
      },
      {
        userId: 2, // Patient
        type: 'confirmation',
        title: 'Appointment Confirmation',
        content: 'Hello John Doe, your appointment with Dr. Michael Chen on next week at 2:30 PM has been confirmed.',
        isRead: true,
        readAt: yesterday,
        priority: 'normal',
        channel: 'in-app',
        deliveryStatus: 'delivered',
        templateId: 2, // appointment_confirmation template
        variables: JSON.stringify({
          name: 'John Doe',
          doctorName: 'Dr. Michael Chen',
          date: 'next week',
          time: '2:30 PM'
        }),
        createdAt: twoDaysAgo
      },
      {
        userId: 4, // Doctor Johnson
        type: 'system',
        title: 'New Patient Appointment',
        content: 'A new patient has booked an appointment with you for tomorrow at 10:00 AM.',
        isRead: false,
        readAt: null,
        priority: 'normal',
        channel: 'in-app',
        deliveryStatus: 'delivered',
        createdAt: yesterday
      },
      {
        userId: 1, // Admin
        type: 'system',
        title: 'System Update',
        content: 'The system will undergo maintenance tonight from 2:00 AM to 4:00 AM.',
        isRead: true,
        readAt: yesterday,
        priority: 'high',
        channel: 'in-app',
        deliveryStatus: 'delivered',
        createdAt: twoDaysAgo
      }
    ];
    
    const createdNotifications = await Notification.bulkCreate(notifications);
    console.log(`Created ${createdNotifications.length} sample notifications`);
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

    // Seed doctor manager relationships
    const doctorManagers = [
      {
        doctorId: 1, // Dr. Sarah Johnson
        managerId: 3, // Jane Smith (responsable1@example.com)
        isPrimary: true,
        canEditSchedule: true,
        canManageAppointments: true,
        notes: 'Primary manager for Dr. Johnson'
      },
      {
        doctorId: 2, // Dr. Michael Chen
        managerId: 3, // Jane Smith (responsable1@example.com)
        isPrimary: true,
        canEditSchedule: true,
        canManageAppointments: true,
        notes: 'Primary manager for Dr. Chen'
      }
    ];
    
    const createdDoctorManagers = await db.doctorManager.bulkCreate(doctorManagers);
    console.log(`Created ${createdDoctorManagers.length} doctor manager relationships`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
