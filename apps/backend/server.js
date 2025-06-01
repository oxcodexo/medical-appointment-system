const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const db = require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const specialtyRoutes = require('./routes/specialty.routes');
const medicalDossierRoutes = require('./routes/medicalDossier.routes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Import security and notification routes
const permissionRoutes = require('./routes/permission.routes');
const rolePermissionRoutes = require('./routes/rolePermission.routes');
const userPermissionRoutes = require('./routes/userPermission.routes');
const notificationRoutes = require('./routes/notification.routes');
const notificationTemplateRoutes = require('./routes/notificationTemplate.routes');

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Configure Helmet but disable contentSecurityPolicy for development
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/medical-dossiers', medicalDossierRoutes);

// Security and notification routes
app.use('/api/permissions', permissionRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/user-permissions', userPermissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notification-templates', notificationTemplateRoutes);

// Chatbot routes
app.use('/api/chatbot', chatbotRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Medical Appointment System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Sync database and start server
db.sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synchronized successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
  });
