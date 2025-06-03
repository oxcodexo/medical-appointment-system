const bcrypt = require('bcryptjs');
const db = require('../models');
const { USER, NOTIFICATION, DOCTOR, APPOINTMENT, SPECIALTY, MEDICAL_DOSSIER, PERMISSION, TEMPLATE } = require('@medical-appointment-system/shared-types');
const fs = require('fs');
const path = require('path');

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

// Helper functions to generate random data
const moroccanFirstNames = [
  'Mohammed', 'Ahmed', 'Youssef', 'Amine', 'Omar', 'Hamza', 'Mehdi', 'Karim', 'Samir', 'Rachid',
  'Fatima', 'Aisha', 'Meryem', 'Nadia', 'Samira', 'Leila', 'Amina', 'Khadija', 'Zineb', 'Salma',
  'Younes', 'Bilal', 'Ismail', 'Khalid', 'Tarik', 'Jamal', 'Adil', 'Hicham', 'Mustapha', 'Yassine',
  'Houda', 'Sanaa', 'Naima', 'Laila', 'Souad', 'Hanane', 'Najat', 'Malika', 'Hayat', 'Saida'
];

const moroccanLastNames = [
  'Alaoui', 'Benani', 'Tazi', 'Fassi', 'Idrissi', 'Benjelloun', 'Benmoussa', 'Bennani', 'Berrada', 'Chaoui',
  'El Mansouri', 'Lahlou', 'Chraibi', 'Tahiri', 'Amrani', 'Haddaoui', 'Belkadi', 'Ouazzani', 'Sebti', 'Filali',
  'Ziani', 'Bouzoubaa', 'Benkirane', 'Cherkaoui', 'Lamrani', 'Zouaoui', 'Drissi', 'Saidi', 'Alami', 'Kadiri'
];

const moroccanCities = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan'];

const moroccanStreets = [
  'Avenue Mohammed V', 'Boulevard Hassan II', 'Rue Allal Ben Abdellah', 'Avenue des FAR', 'Boulevard Zerktouni',
  'Rue Ibn Sina', 'Avenue Moulay Ismail', 'Boulevard Anfa', 'Rue Ibnou Nafis', 'Avenue Mohammed VI'
];

const frenchChronicConditions = [
  'Hypertension', 'Diabète', 'Asthme', 'Arthrite', 'Maladie cardiaque', 'Cholestérol élevé',
  'Dépression', 'Anxiété', 'Migraine', 'Allergie saisonnière'
];

const frenchAllergies = [
  'Pénicilline', 'Arachides', 'Lactose', 'Gluten', 'Fruits de mer', 'Pollen',
  'Poussière', 'Piqûres d\'insectes', 'Œufs', 'Soja'
];

const frenchBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const frenchAppointmentReasons = [
  'Contrôle annuel', 'Douleur abdominale', 'Fièvre persistante', 'Problèmes respiratoires',
  'Consultation de suivi', 'Douleur articulaire', 'Éruption cutanée', 'Maux de tête fréquents',
  'Problèmes digestifs', 'Consultation prénatale', 'Vaccination', 'Bilan de santé',
  'Douleur au dos', 'Infection urinaire', 'Problèmes de sommeil'
];

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const generateMoroccanPhone = () => {
  const prefixes = ['+212 6', '+212 7'];
  const prefix = getRandomElement(prefixes);
  const randomDigits = Math.floor(Math.random() * 90000000) + 10000000;
  return `${prefix}${randomDigits.toString().substring(0, 2)}-${randomDigits.toString().substring(2)}`;  
};

const generateMoroccanEmail = (firstName, lastName) => {
  const domains = ['gmail.com', 'yahoo.fr', 'hotmail.com', 'outlook.com'];
  const normalizedFirstName = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const normalizedLastName = lastName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return `${normalizedFirstName}.${normalizedLastName}@${getRandomElement(domains)}`;  
};

const generateMoroccanAddress = () => {
  const number = Math.floor(Math.random() * 200) + 1;
  const street = getRandomElement(moroccanStreets);
  const city = getRandomElement(moroccanCities);
  return `${number} ${street}, ${city}, Maroc`;
};

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateBirthDate = () => {
  // Generate a birth date for someone between 18 and 80 years old
  const now = new Date();
  const minDate = new Date(now);
  minDate.setFullYear(now.getFullYear() - 80);
  const maxDate = new Date(now);
  maxDate.setFullYear(now.getFullYear() - 18);
  
  const birthDate = generateRandomDate(minDate, maxDate);
  return birthDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Seed the database with initial data
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Seed specialties
    const specialties = [
      { name: 'Cardiologie' },
      { name: 'Dermatologie' },
      { name: 'Neurologie' },
      { name: 'Orthopédie' },
      { name: 'Pédiatrie' },
      { name: 'Psychiatrie' },
      { name: 'Médecine Familiale' },
      { name: 'Médecine Interne' },
      { name: 'Ophtalmologie' },
      { name: 'Gynécologie' },
      { name: 'Endocrinologie' },
      { name: 'Gastro-entérologie' },
      { name: 'Pneumologie' },
      { name: 'Rhumatologie' },
      { name: 'Urologie' },
      { name: 'Oncologie' },
      { name: 'Hématologie' },
      { name: 'Néphrologie' },
      { name: 'Allergologie' },
      { name: 'Chirurgie Générale' }
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
        description: 'Rappel pour les rendez-vous à venir',
        titleTemplate: 'Rappel de Rendez-vous: {{date}}',
        contentTemplate: 'Bonjour {{name}}, ceci est un rappel que vous avez un rendez-vous avec {{doctorName}} le {{date}} à {{time}}.',
        type: 'reminder',
        requiredVariables: 'name,doctorName,date,time',
        availableChannels: 'in-app,email',
        isActive: true,
        defaultPriority: 'normal',
        category: 'appointment'
      },
      {
        name: 'appointment_confirmation',
        description: 'Confirmation pour les rendez-vous réservés',
        titleTemplate: 'Confirmation de Rendez-vous: {{date}}',
        contentTemplate: 'Bonjour {{name}}, votre rendez-vous avec {{doctorName}} le {{date}} à {{time}} a été confirmé.',
        type: 'confirmation',
        requiredVariables: 'name,doctorName,date,time',
        availableChannels: 'in-app,email',
        isActive: true,
        defaultPriority: 'normal',
        category: 'appointment'
      },
      {
        name: 'appointment_cancellation',
        description: 'Notification pour les rendez-vous annulés',
        titleTemplate: 'Annulation de Rendez-vous: {{date}}',
        contentTemplate: 'Bonjour {{name}}, votre rendez-vous avec {{doctorName}} le {{date}} à {{time}} a été annulé. {{reason}}',
        type: 'cancellation',
        requiredVariables: 'name,doctorName,date,time,reason',
        availableChannels: 'in-app,email',
        isActive: true,
        defaultPriority: 'high',
        category: 'appointment'
      },
      {
        name: 'user_welcome',
        description: 'Message de bienvenue pour les nouveaux utilisateurs',
        titleTemplate: 'Bienvenue au Système de Rendez-vous Médicaux',
        contentTemplate: 'Bienvenue {{name}}! Merci de rejoindre notre système de rendez-vous médicaux. Nous sommes ravis de vous avoir parmi nous.',
        type: 'welcome',
        requiredVariables: 'name',
        availableChannels: 'in-app,email',
        isActive: true,
        defaultPriority: 'normal',
        category: 'user'
      },
      {
        name: 'password_reset',
        description: 'Notification de réinitialisation de mot de passe',
        titleTemplate: 'Demande de Réinitialisation de Mot de Passe',
        contentTemplate: 'Bonjour {{name}}, nous avons reçu une demande de réinitialisation de votre mot de passe. Veuillez utiliser le lien suivant pour réinitialiser votre mot de passe: {{resetLink}}',
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
        name: 'Administrateur Système',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        lastLogin: new Date()
      },
      {
        email: 'patient@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Ahmed Benali',
        role: 'patient',
        phone: '+212 661-234567',
        status: 'active',
        emailVerified: true,
        lastLogin: new Date()
      },
      {
        email: 'responsable1@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Fatima Zahra El Mansouri',
        role: 'responsable',
        phone: '+212 662-345678',
        status: 'active',
        emailVerified: true
      },
      {
        email: 'dr.benani@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Dr. Karim Benani',
        role: 'doctor',
        phone: '+212 663-456789',
        status: 'active',
        emailVerified: true,
        lastLogin: new Date()
      },
      {
        email: 'dr.lahlou@example.com',
        password: bcrypt.hashSync('password', 8),
        name: 'Dr. Nadia Lahlou',
        role: 'doctor',
        phone: '+212 664-567890',
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
        phoneNumber: '+212 660-123456',
        address: 'Quartier Administratif, Rabat, Maroc',
        dateOfBirth: '1982-03-10',
        gender: 'male'
      },
      {
        userId: 2, // Patient
        phoneNumber: '+212 661-234567',
        address: '15 Rue Mohammed V, Casablanca, Maroc',
        dateOfBirth: '1985-05-15',
        gender: 'male',
        emergencyContact: 'Yasmine Benali, +212 661-234568',
        bloodType: 'O+',
        allergies: JSON.stringify(['Pénicilline', 'Arachides']),
        chronicConditions: JSON.stringify(['Hypertension'])
      },
      {
        userId: 3, // Responsable
        phoneNumber: '+212 662-345678',
        address: '27 Avenue Hassan II, Rabat, Maroc',
        dateOfBirth: '1980-10-20',
        gender: 'female'
      },
      {
        userId: 4, // Dr. Benani
        phoneNumber: '+212 663-456789',
        address: '8 Boulevard Zerktouni, Casablanca, Maroc',
        dateOfBirth: '1975-03-12',
        gender: 'male'
      },
      {
        userId: 5, // Dr. Lahlou
        phoneNumber: '+212 664-567890',
        address: '42 Rue Allal Ben Abdellah, Rabat, Maroc',
        dateOfBirth: '1982-07-28',
        gender: 'female'
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
        specialtyId: 1, // Cardiologie
        image: '/images/doctors/doctor_male_1.jpg',
        bio: 'Dr. Benani est un cardiologue certifié avec plus de 15 ans d’expérience dans le diagnostic et le traitement des maladies cardiaques. Il est spécialisé dans la cardiologie interventionnelle.',
        experience: '15 ans',
        yearsOfExperience: 15,
        rating: 4.9,
        reviewCount: 120,
        officeAddress: 'Centre Médical Hassan II, Casablanca, Maroc',
        officeHours: 'Lun-Ven 9:00-17:00',
        acceptingNewPatients: true,
        languages: ['Français', 'Arabe', 'Anglais'],
        userId: 4 // Link to user account
      },
      {
        specialtyId: 2, // Dermatologie
        image: '/images/doctors/doctor_female_1.jpg',
        bio: 'Dr. Lahlou est spécialisée dans le traitement des troubles de la peau et est connue pour son expertise en dermatologie cosmétique et pédiatrique.',
        experience: '10 ans',
        yearsOfExperience: 10,
        rating: 4.7,
        reviewCount: 85,
        officeAddress: 'Clinique Dermatologique de Rabat, Rabat, Maroc',
        officeHours: 'Lun-Jeu 8:00-16:00, Ven 8:00-12:00',
        acceptingNewPatients: true,
        languages: ['Français', 'Arabe', 'Anglais'],
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
        title: 'Rappel de Rendez-vous',
        content: 'Bonjour Ahmed Benali, ceci est un rappel que vous avez un rendez-vous avec Dr. Karim Benani demain à 10:00.',
        isRead: false,
        readAt: null,
        priority: 'normal',
        channel: 'in-app',
        deliveryStatus: 'delivered',
        templateId: 1, // appointment_reminder template
        variables: JSON.stringify({
          name: 'Ahmed Benali',
          doctorName: 'Dr. Karim Benani',
          date: 'demain',
          time: '10:00'
        }),
        createdAt: yesterday
      },
      {
        userId: 2, // Patient
        type: 'confirmation',
        title: 'Confirmation de Rendez-vous',
        content: 'Bonjour Ahmed Benali, votre rendez-vous avec Dr. Nadia Lahlou la semaine prochaine à 14:30 a été confirmé.',
        isRead: true,
        readAt: yesterday,
        priority: 'normal',
        channel: 'in-app',
        deliveryStatus: 'delivered',
        templateId: 2, // appointment_confirmation template
        variables: JSON.stringify({
          name: 'Ahmed Benali',
          doctorName: 'Dr. Nadia Lahlou',
          date: 'la semaine prochaine',
          time: '14:30'
        }),
        createdAt: twoDaysAgo
      },
      {
        userId: 4, // Dr. Benani
        type: 'system',
        title: 'Nouveau Rendez-vous Patient',
        content: 'Un nouveau patient a réservé un rendez-vous avec vous pour demain à 10:00.',
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
        title: 'Mise à Jour du Système',
        content: 'Le système sera en maintenance ce soir de 2:00 à 4:00.',
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
        patientName: 'Ahmed Benali',
        patientEmail: 'ahmed.benali@example.com',
        patientPhone: '+212 661-234567',
        date: '2025-06-01',
        time: '09:00',
        status: 'confirmed',
        reason: 'Contrôle annuel',
        userId: 2,
        createdAt: new Date('2025-05-15T10:30:00Z')
      },
      {
        doctorId: 2,
        patientName: 'Yasmine Tazi',
        patientEmail: 'yasmine.tazi@example.com',
        patientPhone: '+212 665-789012',
        date: '2025-06-02',
        time: '14:00',
        status: 'confirmed',
        reason: 'Éruption cutanée',
        createdAt: new Date('2025-05-16T09:15:00Z')
      },
      {
        doctorId: 1,
        patientName: 'Mohamed Alaoui',
        patientEmail: 'mohamed.alaoui@example.com',
        patientPhone: '+212 667-890123',
        date: '2025-06-04',
        time: '15:30',
        status: 'pending',
        reason: 'Douleur au genou',
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

    // Generate additional patients (at least 20)
    console.log('Generating additional patients...');
    const additionalPatients = [];
    const additionalUserProfiles = [];
    const additionalMedicalDossiers = [];
    const additionalUserPermissions = [];

    // Use the existing patientPermissions array

    // Generate 20 additional patients
    for (let i = 0; i < 20; i++) {
      const firstName = getRandomElement(moroccanFirstNames);
      const lastName = getRandomElement(moroccanLastNames);
      const fullName = `${firstName} ${lastName}`;
      const email = generateMoroccanEmail(firstName, lastName);
      const phone = generateMoroccanPhone();
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      
      // Create patient user
      const patientUser = {
        email,
        password: bcrypt.hashSync('password', 8),
        name: fullName,
        role: 'patient',
        phone,
        status: 'active',
        emailVerified: true,
        lastLogin: new Date()
      };
      
      additionalPatients.push(patientUser);
    }

    const createdAdditionalPatients = await User.bulkCreate(additionalPatients);
    console.log(`Created ${createdAdditionalPatients.length} additional patients`);

    // Create profiles for additional patients
    for (let i = 0; i < createdAdditionalPatients.length; i++) {
      const patient = createdAdditionalPatients[i];
      const userId = patient.id;
      const gender = patient.name.split(' ')[0] === 'Fatima' || 
                    patient.name.split(' ')[0] === 'Aisha' || 
                    patient.name.split(' ')[0] === 'Meryem' || 
                    patient.name.split(' ')[0] === 'Nadia' || 
                    patient.name.split(' ')[0] === 'Samira' || 
                    patient.name.split(' ')[0] === 'Leila' || 
                    patient.name.split(' ')[0] === 'Amina' || 
                    patient.name.split(' ')[0] === 'Khadija' || 
                    patient.name.split(' ')[0] === 'Zineb' || 
                    patient.name.split(' ')[0] === 'Salma' || 
                    patient.name.split(' ')[0] === 'Houda' || 
                    patient.name.split(' ')[0] === 'Sanaa' || 
                    patient.name.split(' ')[0] === 'Naima' || 
                    patient.name.split(' ')[0] === 'Laila' || 
                    patient.name.split(' ')[0] === 'Souad' || 
                    patient.name.split(' ')[0] === 'Hanane' || 
                    patient.name.split(' ')[0] === 'Najat' || 
                    patient.name.split(' ')[0] === 'Malika' || 
                    patient.name.split(' ')[0] === 'Hayat' || 
                    patient.name.split(' ')[0] === 'Saida' ? 'female' : 'male';
      
      // Generate random allergies (0-3)
      const allergiesCount = Math.floor(Math.random() * 4);
      const allergies = [];
      for (let j = 0; j < allergiesCount; j++) {
        const allergy = getRandomElement(frenchAllergies);
        if (!allergies.includes(allergy)) {
          allergies.push(allergy);
        }
      }
      
      // Generate random chronic conditions (0-2)
      const conditionsCount = Math.floor(Math.random() * 3);
      const conditions = [];
      for (let j = 0; j < conditionsCount; j++) {
        const condition = getRandomElement(frenchChronicConditions);
        if (!conditions.includes(condition)) {
          conditions.push(condition);
        }
      }
      
      const userProfile = {
        userId,
        phoneNumber: patient.phone,
        address: generateMoroccanAddress(),
        dateOfBirth: generateBirthDate(),
        gender,
        emergencyContact: `${getRandomElement(moroccanFirstNames)} ${getRandomElement(moroccanLastNames)}, ${generateMoroccanPhone()}`,
        bloodType: getRandomElement(frenchBloodTypes),
        allergies: JSON.stringify(allergies),
        chronicConditions: JSON.stringify(conditions)
      };
      
      additionalUserProfiles.push(userProfile);
      
      // Create medical dossier for the patient
      additionalMedicalDossiers.push({
        patientId: userId,
        patientName: patient.name
      });
      
      // Add permissions for the patient
      for (const permName of patientPermissions) {
        if (permissionMap[permName]) {
          additionalUserPermissions.push({
            userId,
            permissionId: permissionMap[permName],
            isGranted: true
          });
        }
      }
    }
    
    const createdAdditionalProfiles = await UserProfile.bulkCreate(additionalUserProfiles);
    console.log(`Created ${createdAdditionalProfiles.length} additional user profiles`);
    
    const createdAdditionalDossiers = await MedicalDossier.bulkCreate(additionalMedicalDossiers);
    console.log(`Created ${createdAdditionalDossiers.length} additional medical dossiers`);
    
    const createdAdditionalPermissions = await UserPermission.bulkCreate(additionalUserPermissions);
    console.log(`Created ${createdAdditionalPermissions.length} additional user permissions`);

    // Generate additional doctors (at least 60)
    console.log('Generating additional doctors...');
    const additionalDoctors = [];
    const additionalDoctorUsers = [];
    const additionalDoctorProfiles = [];
    const additionalDoctorPermissions = [];
    const additionalDoctorAvailabilities = [];
    const additionalDoctorManagers = [];

    // Use the existing doctorPermissions array

    // Get all available doctor images
    const doctorImages = [
      '/images/doctors/doctor_male_1.jpg',
      '/images/doctors/doctor_male_2.jpg',
      '/images/doctors/doctor_female_1.jpg',
      '/images/doctors/doctor_female_2.jpg',
      '/images/doctors/doctor_female_3.jpg',
      '/images/doctors/doctor_female_4.jpg'
    ];

    // Generate 60 additional doctors
    for (let i = 0; i < 60; i++) {
      const firstName = getRandomElement(moroccanFirstNames);
      const lastName = getRandomElement(moroccanLastNames);
      const fullName = `Dr. ${firstName} ${lastName}`;
      const email = generateMoroccanEmail(`dr.${firstName.toLowerCase()}`, lastName);
      const phone = generateMoroccanPhone();
      const gender = firstName === 'Fatima' || 
                    firstName === 'Aisha' || 
                    firstName === 'Meryem' || 
                    firstName === 'Nadia' || 
                    firstName === 'Samira' || 
                    firstName === 'Leila' || 
                    firstName === 'Amina' || 
                    firstName === 'Khadija' || 
                    firstName === 'Zineb' || 
                    firstName === 'Salma' || 
                    firstName === 'Houda' || 
                    firstName === 'Sanaa' || 
                    firstName === 'Naima' || 
                    firstName === 'Laila' || 
                    firstName === 'Souad' || 
                    firstName === 'Hanane' || 
                    firstName === 'Najat' || 
                    firstName === 'Malika' || 
                    firstName === 'Hayat' || 
                    firstName === 'Saida' ? 'female' : 'male';
      
      // Create doctor user
      const doctorUser = {
        email,
        password: bcrypt.hashSync('password', 8),
        name: fullName,
        role: 'doctor',
        phone,
        status: 'active',
        emailVerified: true,
        lastLogin: new Date()
      };
      
      additionalDoctorUsers.push(doctorUser);
    }

    const createdAdditionalDoctorUsers = await User.bulkCreate(additionalDoctorUsers);
    console.log(`Created ${createdAdditionalDoctorUsers.length} additional doctor users`);

    // Create doctor records and profiles
    for (let i = 0; i < createdAdditionalDoctorUsers.length; i++) {
      const doctorUser = createdAdditionalDoctorUsers[i];
      const userId = doctorUser.id;
      const gender = doctorUser.name.includes('Fatima') || 
                    doctorUser.name.includes('Aisha') || 
                    doctorUser.name.includes('Meryem') || 
                    doctorUser.name.includes('Nadia') || 
                    doctorUser.name.includes('Samira') || 
                    doctorUser.name.includes('Leila') || 
                    doctorUser.name.includes('Amina') || 
                    doctorUser.name.includes('Khadija') || 
                    doctorUser.name.includes('Zineb') || 
                    doctorUser.name.includes('Salma') || 
                    doctorUser.name.includes('Houda') || 
                    doctorUser.name.includes('Sanaa') || 
                    doctorUser.name.includes('Naima') || 
                    doctorUser.name.includes('Laila') || 
                    doctorUser.name.includes('Souad') || 
                    doctorUser.name.includes('Hanane') || 
                    doctorUser.name.includes('Najat') || 
                    doctorUser.name.includes('Malika') || 
                    doctorUser.name.includes('Hayat') || 
                    doctorUser.name.includes('Saida') ? 'female' : 'male';
      
      // Assign a random specialty
      const specialtyId = Math.floor(Math.random() * createdSpecialties.length) + 1;
      const yearsOfExperience = Math.floor(Math.random() * 30) + 5; // 5-35 years
      
      // Select an image based on gender
      let image;
      if (gender === 'female') {
        const femaleImages = [
          '/images/doctors/doctor_female_1.jpg',
          '/images/doctors/doctor_female_2.jpg',
          '/images/doctors/doctor_female_3.jpg',
          '/images/doctors/doctor_female_4.jpg'
        ];
        image = getRandomElement(femaleImages);
      } else {
        const maleImages = [
          '/images/doctors/doctor_male_1.jpg',
          '/images/doctors/doctor_male_2.jpg'
        ];
        image = getRandomElement(maleImages);
      }
      
      // Create doctor record
      const specialty = createdSpecialties[specialtyId - 1];
      const doctor = {
        specialtyId,
        image,
        bio: `Dr. ${doctorUser.name.split(' ')[1]} ${doctorUser.name.split(' ')[2]} est un médecin spécialisé en ${specialty.name} avec ${yearsOfExperience} ans d'expérience. ${gender === 'male' ? 'Il' : 'Elle'} a obtenu son diplôme de la Faculté de Médecine de ${getRandomElement(['Rabat', 'Casablanca', 'Fès', 'Marrakech'])} et a complété sa résidence à l'Hôpital Universitaire de ${getRandomElement(['Paris', 'Montréal', 'Genève', 'Bruxelles'])}.`,
        experience: `${yearsOfExperience} ans`,
        yearsOfExperience,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0 rating
        reviewCount: Math.floor(Math.random() * 150) + 20, // 20-170 reviews
        officeAddress: generateMoroccanAddress(),
        officeHours: 'Lun-Ven 9:00-17:00',
        acceptingNewPatients: Math.random() > 0.2, // 80% chance of accepting new patients
        languages: ['Français', 'Arabe', ...(Math.random() > 0.5 ? ['Anglais'] : []), ...(Math.random() > 0.8 ? ['Espagnol'] : [])],
        userId
      };
      
      additionalDoctors.push(doctor);
      
      // Create doctor profile
      const doctorProfile = {
        userId,
        phoneNumber: doctorUser.phone,
        address: generateMoroccanAddress(),
        dateOfBirth: generateBirthDate(),
        gender
      };
      
      additionalDoctorProfiles.push(doctorProfile);
      
      // Add permissions for the doctor
      for (const permName of doctorPermissions) {
        if (permissionMap[permName]) {
          additionalDoctorPermissions.push({
            userId,
            permissionId: permissionMap[permName],
            isGranted: true
          });
        }
      }
    }
    
    const createdAdditionalDoctors = await Doctor.bulkCreate(additionalDoctors);
    console.log(`Created ${createdAdditionalDoctors.length} additional doctors`);
    
    // Update user records with doctorId
    for (let i = 0; i < createdAdditionalDoctorUsers.length; i++) {
      await User.update(
        { doctorId: createdAdditionalDoctors[i].id }, 
        { where: { id: createdAdditionalDoctorUsers[i].id } }
      );
    }
    
    const createdAdditionalDoctorProfiles = await UserProfile.bulkCreate(additionalDoctorProfiles);
    console.log(`Created ${createdAdditionalDoctorProfiles.length} additional doctor profiles`);
    
    const createdAdditionalDoctorPermissions = await UserPermission.bulkCreate(additionalDoctorPermissions);
    console.log(`Created ${createdAdditionalDoctorPermissions.length} additional doctor permissions`);
    
    // Create doctor availabilities
    for (let i = 0; i < createdAdditionalDoctors.length; i++) {
      const doctorId = createdAdditionalDoctors[i].id;
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      
      for (const day of daysOfWeek) {
        // 90% chance of working on each day
        if (Math.random() > 0.1) {
          // Generate random start and end times
          let startHour = Math.floor(Math.random() * 3) + 8; // 8-10 AM
          const endHour = Math.floor(Math.random() * 3) + 16; // 4-6 PM
          
          additionalDoctorAvailabilities.push({
            doctorId,
            dayOfWeek: day,
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${endHour.toString().padStart(2, '0')}:00`
          });
        }
      }
    }
    
    const createdAdditionalAvailabilities = await DoctorAvailability.bulkCreate(additionalDoctorAvailabilities);
    console.log(`Created ${createdAdditionalAvailabilities.length} additional doctor availabilities`);
    
    // Assign doctors to managers
    for (let i = 0; i < createdAdditionalDoctors.length; i++) {
      const doctorId = createdAdditionalDoctors[i].id;
      
      additionalDoctorManagers.push({
        doctorId,
        managerId: 3, // Assign to Fatima Zahra El Mansouri (responsable1@example.com)
        isPrimary: true,
        canEditSchedule: true,
        canManageAppointments: true,
        notes: `Gestionnaire principal pour Dr. ${createdAdditionalDoctorUsers[i].name.split(' ')[1]} ${createdAdditionalDoctorUsers[i].name.split(' ')[2]}`
      });
    }
    
    const createdAdditionalDoctorManagers = await db.doctorManager.bulkCreate(additionalDoctorManagers);
    console.log(`Created ${createdAdditionalDoctorManagers.length} additional doctor manager relationships`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
