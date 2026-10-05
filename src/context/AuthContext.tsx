import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { AuthService, getStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUser: string, pinOrPass: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const token = getStoredToken();
      if (token) {
        try {
          const currentUser = await AuthService.getMe();
          if (currentUser) {
            setUser(currentUser);
          }
        } catch (e) {
          console.warn('Init auth failed:', e);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (emailOrUser: string, pinOrPass: string) => {
    setIsLoading(true);
    try {
      const res = await AuthService.login(emailOrUser, pinOrPass);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const updatedUser: User = {
      id: newRole === 'ADMIN' ? 'usr-admin' : 'usr-seller',
      email: newRole === 'ADMIN' ? 'admin@sistema-ventas.dev' : 'seller@sistema-ventas.dev',
      name: newRole === 'ADMIN' ? 'Administrador' : 'Vendedor',
      role: newRole,
      status: 'ACTIVE'
    };
    setUser(updatedUser);
    localStorage.setItem('luipe_current_user', JSON.stringify(updatedUser));
  };

  const role = user?.role || 'SELLER';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout,
        switchRole
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
