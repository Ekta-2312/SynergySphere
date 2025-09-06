import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { User, LoginForm, RegisterForm, AuthTokens } from '../types/auth';

const API_URL = 'http://localhost:5000/api/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isAuthenticated = !!user && !!localStorage.getItem('accessToken');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(() => {
    try {
      const raw = localStorage.getItem('pendingVerification');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { email?: string; createdAt?: number } | null;
      if (!parsed || !parsed.email || !parsed.createdAt) return null;
      const TTL = 30 * 60 * 1000; // 30 minutes
      if (Date.now() - parsed.createdAt > TTL) {
        localStorage.removeItem('pendingVerification');
        return null;
      }
      return parsed.email;
    } catch (e) {
      return null;
    }
  });
  const navigate = useNavigate();

  const handleApiResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  };

  const login = useCallback(async (data: LoginForm): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleApiResponse(response);

      localStorage.setItem('accessToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      setUser(result.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterForm): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      await handleApiResponse(response);
      setPendingVerificationEmail(data.email);
      navigate('/verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    setIsLoading(true);
    setError(null);
    // Open Google OAuth in the same window
    window.location.href = `${API_URL}/google`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    Cookies.remove('refreshToken');
    setUser(null);
    setError(null);
    navigate('/login');
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await handleApiResponse(response);

      // Store token and user data from verification response
      if (data.token && data.user) {
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isNewLogin', 'true'); // Flag for welcome toast
        setUser(data.user);

        // Clear pending verification
        localStorage.removeItem('pendingVerification');
        setPendingVerificationEmail(null);

        // Navigate to dashboard instead of success page
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPendingVerification = useCallback(() => {
    try {
      localStorage.removeItem('pendingVerification');
    } catch (e) {}
    setPendingVerificationEmail(null);
  }, []);

  const resendOtp = useCallback(async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      await handleApiResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    verifyOtp,
    resendOtp,
    clearError: () => setError(null),
    pendingVerificationEmail,
    clearPendingVerification,
  };
};
