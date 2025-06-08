import { useState, useEffect, ReactNode } from 'react';
import { User, UserProfile } from '@/lib/types';
import { authService, AuthError, PermissionSet } from '@/services/auth.service';
import { AuthContext } from './context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in using authService
    const currentUser = authService.getCurrentUser();
    const currentToken = authService.getToken();
    const storedPermissions = localStorage.getItem('medical_auth_permissions');

    if (currentUser && currentToken) {
      setUser(currentUser);
      setToken(currentToken);

      if (storedPermissions) {
        try {
          const parsedPermissions = JSON.parse(storedPermissions);
          // Recreate the hasPermission function since it doesn't serialize
          if (parsedPermissions && parsedPermissions.all) {
            const permSet: PermissionSet = {
              all: parsedPermissions.all,
              byCategory: parsedPermissions.byCategory,
              hasPermission: (permissionName, resourceType = null, resourceId = null) => {
                return parsedPermissions.all.some((p: { name: string; resourceType?: string | null; resourceId?: number | null }) => {
                  if (p.name !== permissionName) return false;

                  // Global permission check
                  if (!resourceType && !resourceId) {
                    return !p.resourceType && !p.resourceId;
                  }

                  // Resource-specific permission check
                  if (resourceType && !resourceId) {
                    return p.resourceType === resourceType;
                  }

                  // Specific resource instance permission check
                  return p.resourceType === resourceType && p.resourceId === resourceId;
                });
              }
            };
            setPermissions(permSet);
          }
        } catch (e) {
          console.error('Error parsing permissions:', e);
        }
      }
    }

    setIsLoading(false);

    // Listen for unauthorized events (token expired, etc.)
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setPermissions(null);
      localStorage.removeItem('medical_auth_permissions');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);

      setUser(response.user);
      setToken(response.token);
      setPermissions(response.permissions);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string = 'patient',
    profile?: Partial<UserProfile>
  ) => {
    try {
      const response = await authService.register(name, email, password, role, profile);

      setUser(response.user);
      setToken(response.token);
      setPermissions(response.permissions);

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setPermissions(null);
    localStorage.removeItem('medical_auth_permissions');
  };

  // Helper function to check permissions
  const hasPermission = (permissionName: string, resourceType?: string | null, resourceId?: number | null) => {
    if (!permissions) return false;
    return permissions.hasPermission(permissionName, resourceType, resourceId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        isLoading,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
