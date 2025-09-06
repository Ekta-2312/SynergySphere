import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';

interface NotificationSettings {
  emailNotifications: boolean;
  taskReminders: boolean;
  projectUpdates: boolean;
  weeklyDigest: boolean;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  provider?: string;
  isVerified?: boolean;
  createdAt: string;
  notificationSettings: NotificationSettings;
}

export const ProfileSettings: React.FC = () => {
  const { logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    taskReminders: true,
    projectUpdates: true,
    weeklyDigest: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      if (response.success) {
        setProfile(response.user);
        setSettings(response.user.notificationSettings);
        setFormData({
          name: response.user.name,
          email: response.user.email,
        });
      }
    } catch (error) {
      showError('Failed to load profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    try {
      setSettings(newSettings);
      const response = await api.put('/auth/profile/notifications', newSettings);
      if (response.success) {
        showSuccess('Notification settings updated');
      }
    } catch (error) {
      // Revert the change if it failed
      setSettings(settings);
      showError('Failed to update notification settings');
      console.error('Error updating settings:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      showError('Name and email are required');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/auth/profile', formData);
      if (response.success) {
        setProfile(response.user);
        setIsEditing(false);
        showSuccess('Profile updated successfully');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showError('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('New password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/auth/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        showSuccess('Password changed successfully');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to change password');
      console.error('Error changing password:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
      </div>
    );
  }

  return (
    <div className='p-8 w-full'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Profile & Settings</h1>
        <p className='text-gray-600 mt-2'>Manage your account settings and preferences</p>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl'>
        {/* Profile Card */}
        <div className='xl:col-span-1'>
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-8'>
            <div className='text-center'>
              <div className='w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-white text-2xl font-bold'>
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <h3 className='text-xl font-semibold text-gray-900'>{profile?.name}</h3>
              <p className='text-gray-600'>{profile?.email}</p>
              {profile?.provider && (
                <p className='text-sm text-purple-600 mt-1'>
                  Connected via {profile.provider === 'google' ? 'Google' : profile.provider}
                </p>
              )}
              {profile?.isVerified && (
                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1'>
                  ✓ Verified
                </span>
              )}
              <p className='text-sm text-gray-500 mt-2'>
                Member since{' '}
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className='mt-6 pt-6 border-t border-gray-200'>
              <button
                onClick={handleLogout}
                className='w-full flex items-center justify-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors'
              >
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panels */}
        <div className='xl:col-span-2 space-y-6'>
          {/* Account Information */}
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>Account Information</h2>
              <button
                onClick={() => {
                  if (isEditing) {
                    setFormData({
                      name: profile?.name || '',
                      email: profile?.email || '',
                    });
                  }
                  setIsEditing(!isEditing);
                }}
                className='text-purple-600 hover:text-purple-700 font-medium'
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Name</label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none'
                  />
                </div>
                <div className='flex space-x-3'>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className='px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: profile?.name || '',
                        email: profile?.email || '',
                      });
                    }}
                    className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                  <p className='text-gray-900'>{profile?.name}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                  <p className='text-gray-900'>{profile?.email}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Account Type
                  </label>
                  <p className='text-gray-900 capitalize'>{profile?.provider || 'Email'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6'>Notification Preferences</h2>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>Email Notifications</h3>
                  <p className='text-sm text-gray-600'>
                    Receive email notifications for important updates
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    settings.emailNotifications ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>Task Reminders</h3>
                  <p className='text-sm text-gray-600'>
                    Get reminded about upcoming task deadlines
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('taskReminders')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    settings.taskReminders ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.taskReminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>Project Updates</h3>
                  <p className='text-sm text-gray-600'>
                    Stay informed about project activity and changes
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('projectUpdates')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    settings.projectUpdates ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.projectUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>Weekly Digest</h3>
                  <p className='text-sm text-gray-600'>Receive a weekly summary of your projects</p>
                </div>
                <button
                  onClick={() => handleSettingChange('weeklyDigest')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    settings.weeklyDigest ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6'>Account Actions</h2>

            <div className='space-y-4'>
              {(!profile?.provider || profile.provider === 'local') && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className='w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='text-sm font-medium text-gray-900'>Change Password</h3>
                      <p className='text-sm text-gray-600'>Update your account password</p>
                    </div>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </div>
                </button>
              )}

              <button className='w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-sm font-medium text-gray-900'>Export Data</h3>
                    <p className='text-sm text-gray-600'>Download your project data</p>
                  </div>
                  <svg
                    className='w-5 h-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </div>
              </button>

              <button className='w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-sm font-medium text-red-900 group-hover:text-red-700'>
                      Delete Account
                    </h3>
                    <p className='text-sm text-red-600 group-hover:text-red-500'>
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <svg
                    className='w-5 h-5 text-red-400 group-hover:text-red-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-lg font-semibold text-gray-900'>Change Password</h3>
              <button
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Current Password
                </label>
                <input
                  type='password'
                  value={passwordData.currentPassword}
                  onChange={e =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>New Password</label>
                <input
                  type='password'
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Confirm New Password
                </label>
                <input
                  type='password'
                  value={passwordData.confirmPassword}
                  onChange={e =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                />
              </div>
            </div>

            <div className='flex space-x-3 mt-6'>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className='flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>
              <button
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className='flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
