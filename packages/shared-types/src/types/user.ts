export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  status?: UserStatus;
  lastLogin?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  image?: string;
}

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  RESPONSABLE = 'responsable'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface UserData {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  password?: string;
  status?: UserStatus;
  image?: string;
}
