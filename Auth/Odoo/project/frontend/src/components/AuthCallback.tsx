import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userData = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      // Handle authentication error
      navigate('/login?error=' + error);
      return;
    }

    if (token && userData) {
      try {
        // Parse user data
        const user = JSON.parse(decodeURIComponent(userData));
        
        // Store authentication data
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect to dashboard
        navigate('/');
      } catch (err) {
        console.error('Error processing auth callback:', err);
        navigate('/login?error=invalid_response');
      }
    } else {
      // Missing required parameters
      navigate('/login?error=missing_data');
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};