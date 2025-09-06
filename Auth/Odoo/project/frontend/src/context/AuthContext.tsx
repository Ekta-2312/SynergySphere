import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;
  login: (credentials: { email: string; password: string; isOtp: boolean }) => Promise<void>;
  signup: (data: { email: string; password: string; name: string }) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  clearError: () => void;
  clearPendingVerification: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async ({ email, password, isOtp }: { email: string; password: string; isOtp: boolean }) => {
    setIsLoading(true);
    try {
      // Implement your login API call here
      setIsAuthenticated(true);
      // navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    setIsLoading(true);
    try {
      // Implement your signup API call here
      setPendingVerificationEmail(email);
      // navigate('/verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      // Implement your OTP verification API call here
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    setIsLoading(true);
    try {
      // Implement your resend OTP API call here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearPendingVerification = () => setPendingVerificationEmail(null);

  const value = {
    isAuthenticated,
    isLoading,
    error,
    pendingVerificationEmail,
    login,
    signup,
    verifyOtp,
    resendOtp,
    clearError,
    clearPendingVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
