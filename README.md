# Medical Appointment System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-v18+-green.svg)
![Turborepo](https://img.shields.io/badge/turborepo-v2.0+-blue.svg)

A comprehensive medical appointment scheduling and management system that connects patients with healthcare providers. This application streamlines the appointment booking process, manages doctor schedules, and improves the overall patient experience.

## Features

### Backend Features
- **RESTful API**: Comprehensive API endpoints for all system operations
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Database Integration**: MySQL database with Sequelize ORM for data persistence
- **Input Validation**: Request validation using Express Validator
- **Security**: Implemented with best practices including Helmet for HTTP headers

### Frontend Features
- **User Authentication**: Secure login for patients, doctors, and administrators
- **Appointment Scheduling**: Easy-to-use interface for booking, rescheduling, and canceling appointments
- **Doctor Management**: Profile management for healthcare providers including specialties and availability
- **Admin Dashboard**: Comprehensive admin tools for system management
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices

## Project Structure

This project is organized as a monorepo using [Turborepo](https://turbo.build/) for efficient build orchestration and dependency management. The monorepo structure enables code sharing, consistent tooling, and coordinated workflows across multiple applications.

```
medical-appointment-system/
├── apps/                      # Application code
│   ├── backend/              # Express.js API
│   │   ├── controllers/      # API controllers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Express middleware
│   │   ├── utils/            # Utility functions
│   │   ├── server.js         # Server entry point
│   │   └── ...               # Other backend files
│   │
│   └── frontend/             # React/Vite frontend
│       ├── public/           # Static assets
│       ├── src/
│       │   ├── components/   # Reusable UI components
│       │   ├── contexts/     # React contexts
│       │   ├── hooks/        # Custom React hooks
│       │   ├── lib/          # Utility functions
│       │   ├── pages/        # Page components
│       │   └── ...           # Other frontend files
│       └── ...               # Configuration files
│
├── packages/                 # Shared packages
│   ├── shared-types/         # Shared TypeScript interfaces
│   └── eslint-config-custom/ # Shared ESLint config
│
├── package.json             # Root package.json
├── turbo.json               # Turborepo configuration
└── ...                      # Other configuration files
```

### Monorepo Architecture Benefits

- **Code Sharing**: Common code and types are shared between applications
- **Consistent Tooling**: Same ESLint, TypeScript, and other configurations across all packages
- **Coordinated Workflows**: Run, build, and test all applications with a single command
- **Optimized Builds**: Turborepo's caching speeds up development and CI/CD pipelines

## API Endpoints

The backend provides a comprehensive RESTful API for all system operations. Here are the main endpoint categories:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (protected)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by id
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by id
- `POST /api/doctors` - Create a new doctor (admin only)
- `PUT /api/doctors/:id` - Update a doctor
- `GET /api/doctors/specialty/:specialtyId` - Get doctors by specialty
- `GET /api/doctors/:doctorId/availability` - Get doctor availability

### Appointments
- `GET /api/appointments` - Get all appointments (admin only)
- `GET /api/appointments/:id` - Get appointment by id
- `POST /api/appointments` - Create a new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `PUT /api/appointments/:id/status` - Update appointment status
- `GET /api/appointments/doctor/:doctorId` - Get appointments for doctor
- `GET /api/appointments/user/:userId` - Get appointments for user

## Setup Instructions

### Prerequisites

- Node.js (v18 or newer)
- NPM v10+
- MySQL (v5.7 or higher)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/oxcodexo/medical-appointment-system.git
   cd medical-appointment-system
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a MySQL database
   ```sql
   CREATE DATABASE medical_appointment_db;
   ```

4. Configure environment variables
   - Copy `.env.example` to `.env` in the backend directory
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```
   - Update the values in `.env` with your database credentials

5. Initialize the database
   ```bash
   cd apps/backend
   node setup-db.js
   cd ../..
   ```

### Development

To develop all apps and packages simultaneously:

```bash
npm run dev
```

This will start both the backend and frontend in development mode with:
- Backend running at http://localhost:5000
- Frontend running at http://localhost:5173

To run only the backend:

```bash
npm run dev --workspace=@medical-appointment-system/backend
```

To run only the frontend:

```bash
npm run dev --workspace=@medical-appointment-system/frontend
```

### Build

To build all apps and packages for production:

```bash
npm run build
```

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for building the API
- **MySQL**: Relational database
- **Sequelize**: ORM for database interactions
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Express Validator**: Input validation
- **Helmet**: Security middleware
- **Morgan**: HTTP request logger

### Frontend
- **React**: UI library
- **Vite**: Build tool and development server
- **TypeScript**: Static typing
- **React Router**: Client-side routing
- **React Query**: Data fetching and state management
- **Shadcn UI**: Component library based on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Zod**: Schema validation

### Shared Infrastructure
- **Turborepo**: Monorepo build system
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **npm workspaces**: Package management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All the amazing open-source projects that made this possible

## Useful Links

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Sequelize Documentation](https://sequelize.org/)
