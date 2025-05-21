import { useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { authApi } from '@/lib/api';
import { AuthContext } from './context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedToken = localStorage.getItem('medical_auth_token');
    const storedUser = localStorage.getItem('medical_auth_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid stored data
        localStorage.removeItem('medical_auth_token');
        localStorage.removeItem('medical_auth_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.data) {
        setUser(response.data.user);
        setToken(response.data.token);
        
        // Store auth information in localStorage
        localStorage.setItem('medical_auth_token', response.data.token);
        localStorage.setItem('medical_auth_user', JSON.stringify(response.data.user));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      const response = await authApi.register(name, email, password);
      
      if (response.data) {
        setUser(response.data.user);
        setToken(response.data.token);
        
        // Store auth information in localStorage
        localStorage.setItem('medical_auth_token', response.data.token);
        localStorage.setItem('medical_auth_user', JSON.stringify(response.data.user));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('medical_auth_token');
    localStorage.removeItem('medical_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
