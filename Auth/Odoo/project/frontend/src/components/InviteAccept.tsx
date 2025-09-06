import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { LoadingSpinner } from './LoadingSpinner';
import { GoogleButton } from './GoogleButton';

export const InviteAccept: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPasswordField, setShowPasswordField] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvitationDetails();
    }
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/invitations/${token}`);
      setInvitation(data);
      setUserForm(prev => ({ ...prev, email: data.inviteeEmail }));
    } catch (error: any) {
      setError(error.message || 'Invalid or expired invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Determine what data to send based on user status
    let requestData: any = {};

    if (!invitation.userExists) {
      // New user registration
      if (!userForm.name.trim()) {
        setError('Name is required');
        return;
      }
      if (userForm.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (userForm.password !== userForm.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      requestData = {
        email: userForm.email,
        name: userForm.name,
        password: userForm.password,
      };
    } else if (invitation.isGoogleUser) {
      // Google user - redirect to Google auth with invitation token
      window.location.href = `/api/auth/google?state=${token}`;
      return;
    } else if (showPasswordField) {
      // Existing local user login
      if (!userForm.password) {
        setError('Password is required');
        return;
      }

      requestData = {
        email: userForm.email,
        password: userForm.password,
      };
    } else if (invitation.userExists) {
      // Local user exists but no password field shown - we need to show it
      setShowPasswordField(true);
      setError(
        'This email is already registered. Please enter your password to accept the invitation.'
      );
      return;
    }

    setAccepting(true);
    try {
      await api.post(`/invitations/accept/${token}`, requestData);

      // Show success message and redirect
      alert('Invitation accepted successfully! Welcome to the project.');
      navigate('/dashboard');
    } catch (error: any) {
      if (
        error.message.includes('requires Login') ||
        error.message.includes('provide your password')
      ) {
        setShowPasswordField(true);
        setError(error.message);
      } else if (error.message.includes('Registration required')) {
        setError('Please complete the registration form');
      } else if (error.message.includes('Google Sign-In')) {
        // This is a Google user, show Google sign-in option
        setError(error.message);
      } else {
        setError(error.message || 'Failed to accept invitation');
      }
    } finally {
      setAccepting(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to Google OAuth with invitation token as state
    window.location.href = `/api/auth/google?state=${token}`;
  };

  const handleDeclineInvitation = async () => {
    if (!confirm('Are you sure you want to decline this invitation?')) return;

    try {
      await api.post(`/invitations/decline/${token}`);
      alert('Invitation declined');
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Failed to decline invitation');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center'>
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h2 className='text-xl font-bold text-gray-900 mb-2'>Invalid Invitation</h2>
            <p className='text-gray-600 mb-6'>{error}</p>
            <button
              onClick={() => navigate('/')}
              className='bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all'
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center'>
      <div className='bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4'>
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-white font-bold text-xl'>S</span>
          </div>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
            SynergySphere
          </h1>
        </div>

        <div className='text-center mb-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-2'>You're Invited!</h2>
          <p className='text-gray-600'>
            <strong>{invitation?.inviter.name}</strong> has invited you to join the project:
          </p>
        </div>

        <div className='bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6'>
          <h3 className='font-semibold text-gray-900 mb-1'>{invitation?.project.title}</h3>
          <p className='text-gray-600 text-sm'>{invitation?.project.description}</p>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4'>
            {error}
          </div>
        )}

        <form onSubmit={handleAcceptInvitation} className='space-y-4'>
          {/* Email field - always show for reference */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
            <input
              type='email'
              name='email'
              value={userForm.email}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50'
              disabled
            />
          </div>

          {!invitation?.userExists && (
            <>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
                <input
                  type='text'
                  name='name'
                  value={userForm.name}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none'
                  placeholder='Enter your full name'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                <input
                  type='password'
                  name='password'
                  value={userForm.password}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none'
                  placeholder='Create a password'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Confirm Password
                </label>
                <input
                  type='password'
                  name='confirmPassword'
                  value={userForm.confirmPassword}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none'
                  placeholder='Confirm your password'
                  required
                />
              </div>
            </>
          )}

          {invitation?.userExists && showPasswordField && !invitation.isGoogleUser && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
              <input
                type='password'
                name='password'
                value={userForm.password}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none'
                placeholder='Enter your password'
                required
              />
              <p className='text-sm text-gray-600 mt-1'>
                This email is already registered. Please enter your password to accept the
                invitation.
              </p>
            </div>
          )}

          {invitation?.userExists && !showPasswordField && !invitation.isGoogleUser && (
            <div className='bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg'>
              <p className='text-sm mb-2'>
                Welcome back! This email is already registered in our system.
              </p>
              <p className='text-sm'>
                Click "Accept & Join" and you'll be prompted to enter your password.
              </p>
            </div>
          )}

          {invitation?.isGoogleUser && (
            <div className='space-y-4'>
              <div className='bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg'>
                <p className='text-sm mb-2'>
                  <strong>Welcome back!</strong> This email is registered with Google.
                </p>
                <p className='text-sm'>Please use Google Sign-In to accept this invitation.</p>
              </div>

              <div className='flex justify-center'>
                <GoogleButton onClick={handleGoogleSignIn}>
                  <svg className='w-5 h-5' viewBox='0 0 24 24'>
                    <path
                      fill='#4285F4'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='#34A853'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='#FBBC05'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='#EA4335'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                  Sign in with Google
                </GoogleButton>
              </div>
            </div>
          )}

          <div className='flex space-x-3 pt-4'>
            <button
              type='button'
              onClick={handleDeclineInvitation}
              className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Decline
            </button>
            {!invitation?.isGoogleUser && (
              <button
                type='submit'
                disabled={accepting}
                className='flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50'
              >
                {accepting ? 'Accepting...' : 'Accept & Join'}
              </button>
            )}
          </div>
        </form>

        <p className='text-xs text-gray-500 text-center mt-4'>
          This invitation expires on {new Date(invitation?.expiresAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
