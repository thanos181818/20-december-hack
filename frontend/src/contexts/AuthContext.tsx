import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import axios from 'axios'; // Import axios for the type guard

export type UserRole = 'customer' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing token on startup
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_data');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    try {
      // FastAPI OAuth2 expects form-data with 'username' and 'password'
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      // Use different endpoint for admin login (validates against admins.json)
      const endpoint = role === 'admin' ? '/auth/admin/login' : '/auth/login';
      
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, role: serverRole } = response.data;

      // Validate role if specific role was requested
      if (role && serverRole !== role) {
        toast.error(`Invalid role. This account is for a ${serverRole}.`);
        return false;
      }
      
      // Save session
      localStorage.setItem('access_token', access_token);
      
      // Construct user object (Backend doesn't return name on login yet, using email prefix as fallback)
      const userData: User = { 
        id: email, 
        name: email.split('@')[0], 
        email, 
        role: serverRole 
      };
      
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error("Login failed", error);
      // FIX: Use Type Guard to provide better error messages
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Invalid email or password");
      }
      return false;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    try {
      // Backend expects query parameters for register
      await api.post('/auth/register', null, {
        params: { 
          email, 
          password, 
          name,
          role
        } 
      });
      
      return true;
    } catch (error) {
      console.error("Signup failed", error);
      
      let msg = "Registration failed. Try again.";
      
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        msg = error.response.data.detail;
      }
      
      toast.error(msg);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
    toast.info("Logged out successfully");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};