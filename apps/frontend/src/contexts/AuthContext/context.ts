import { createContext } from 'react';
import { User, UserProfile } from '@/lib/types';
import { PermissionSet } from '@/services/auth.service';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: PermissionSet | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string, profile?: Partial<UserProfile>) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permissionName: string, resourceType?: string | null, resourceId?: number | null) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
