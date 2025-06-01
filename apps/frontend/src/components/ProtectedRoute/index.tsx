import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  permissionName?: string;
  resourceType?: string | null;
  resourceId?: number | null;
  redirectPath?: string;
  children: React.ReactNode;
}

/**
 * A component that protects routes based on authentication and permissions.
 * If the user is not authenticated or doesn't have the required permission, they are redirected.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  permissionName,
  resourceType = null,
  resourceId = null,
  redirectPath = '/login',
  children
}) => {
  const { isAuthenticated, hasPermission, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If permission check is required and user doesn't have permission, redirect to unauthorized page
  if (permissionName && !hasPermission(permissionName, resourceType, resourceId)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and has permission (or no permission required), render the children
  return <>{children}</>;
};

export default ProtectedRoute;
