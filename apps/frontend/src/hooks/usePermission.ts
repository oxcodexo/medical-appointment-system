import { useAuth } from '@/contexts/AuthContext';

/**
 * A custom hook for checking permissions in functional components.
 * @returns An object with methods for checking permissions
 */
export const usePermission = () => {
  const { hasPermission, permissions, isAuthenticated } = useAuth();

  /**
   * Check if the user has a specific permission
   * @param permissionName The name of the permission to check
   * @param resourceType Optional resource type for resource-specific permissions
   * @param resourceId Optional resource ID for specific resource instance permissions
   * @returns Boolean indicating if the user has the permission
   */
  const checkPermission = (
    permissionName: string, 
    resourceType?: string | null, 
    resourceId?: number | null
  ): boolean => {
    if (!isAuthenticated || !permissions) return false;
    return hasPermission(permissionName, resourceType, resourceId);
  };

  /**
   * Check if the user has any of the specified permissions
   * @param permissionNames Array of permission names to check
   * @param resourceType Optional resource type for resource-specific permissions
   * @param resourceId Optional resource ID for specific resource instance permissions
   * @returns Boolean indicating if the user has any of the permissions
   */
  const checkAnyPermission = (
    permissionNames: string[], 
    resourceType?: string | null, 
    resourceId?: number | null
  ): boolean => {
    if (!isAuthenticated || !permissions) return false;
    return permissionNames.some(name => hasPermission(name, resourceType, resourceId));
  };

  /**
   * Check if the user has all of the specified permissions
   * @param permissionNames Array of permission names to check
   * @param resourceType Optional resource type for resource-specific permissions
   * @param resourceId Optional resource ID for specific resource instance permissions
   * @returns Boolean indicating if the user has all of the permissions
   */
  const checkAllPermissions = (
    permissionNames: string[], 
    resourceType?: string | null, 
    resourceId?: number | null
  ): boolean => {
    if (!isAuthenticated || !permissions) return false;
    return permissionNames.every(name => hasPermission(name, resourceType, resourceId));
  };

  /**
   * Get all permissions for a specific resource type
   * @param resourceType The resource type to filter permissions by
   * @returns Array of permissions for the specified resource type
   */
  const getPermissionsByResourceType = (resourceType: string) => {
    if (!isAuthenticated || !permissions) return [];
    return permissions.all.filter(p => p.resourceType === resourceType);
  };

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    getPermissionsByResourceType,
    allPermissions: permissions?.all || [],
    permissionsByCategory: permissions?.byCategory || {}
  };
};

export default usePermission;
