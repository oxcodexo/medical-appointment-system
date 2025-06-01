import { useContext } from 'react';
import { AuthContext, AuthContextType } from './context';

/**
 * Custom hook to access the auth context
 * @returns The auth context
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
