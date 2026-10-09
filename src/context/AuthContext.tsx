import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { AuthService, getStoredToken } from '../services/api';
import { useCurrency } from './CurrencyContext';
interface AuthContextType {
  user: User | null;
  role: UserRole; // Real role of the logged in user
  currentViewRole: UserRole; // Active view (ADMIN can switch to SELLER view)
  canSwitchRole: boolean; // Only true if user is ADMIN
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUser: string, pinOrPass: string) => Promise<void>;
  logout: () => void;
  switchViewRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentViewRole, setCurrentViewRole] = useState<UserRole>('SELLER');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { syncWithBCV } = useCurrency();
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const token = getStoredToken();
      if (token) {
        try {
          const currentUser = await AuthService.getMe();
          if (currentUser) {
            setUser(currentUser);
            setCurrentViewRole(currentUser.role);
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
      setCurrentViewRole(res.user.role);
      try { 
        await syncWithBCV(); 
      } catch (error) {
         console.error('No se pudo sincronizar la tasa BCV:', error); 
        }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setCurrentViewRole('SELLER');
  };

  const switchViewRole = (newRole: UserRole) => {
    // Only administrators can switch between views
    if (user?.role !== 'ADMIN') return;
    setCurrentViewRole(newRole);
  };

  const role = user?.role || 'SELLER';
  const canSwitchRole = user?.role === 'ADMIN';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        currentViewRole,
        canSwitchRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        switchViewRole
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
