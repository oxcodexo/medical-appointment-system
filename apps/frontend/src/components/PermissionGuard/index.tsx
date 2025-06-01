import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  permissionName: string;
  resourceType?: string | null;
  resourceId?: number | null;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * A component that conditionally renders its children based on whether the user has the specified permission.
 * If the user doesn't have the permission, it renders the fallback component (or nothing if no fallback is provided).
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissionName,
  resourceType = null,
  resourceId = null,
  fallback = null,
  children
}) => {
  const { hasPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return hasPermission(permissionName, resourceType, resourceId) ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
