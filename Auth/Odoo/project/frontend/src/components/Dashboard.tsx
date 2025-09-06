import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Project, Task, TaskStats } from '../types/auth';
import { ProjectDashboard } from './ProjectDashboard';
import { MyTasks } from './MyTasks';
import { NotificationCenter } from './NotificationCenter';
import { ProfileSettings } from './ProfileSettings';
import { ProjectDetail } from './ProjectDetail';
import { useToast } from '../context/ToastContext';
import { api } from '../utils/api';

type TabType = 'dashboard' | 'tasks' | 'notifications' | 'profile';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Check if user is authenticated before making API calls
    const token = localStorage.getItem('accessToken');
    if (!token || !user) {
      console.log('No token or user found, redirecting to login');
      logout();
      return;
    }

    fetchStats();
    fetchUnreadNotifications();
    
    // Check if this is a fresh login after verification
    const isNewLogin = localStorage.getItem('isNewLogin');
    if (isNewLogin === 'true') {
      showSuccess('Welcome to SynergySphere!', 'Your account has been verified successfully');
      localStorage.removeItem('isNewLogin');
    }
  }, [showSuccess, user, logout]);

  const fetchStats = async () => {
    try {
      const data = await api.get('/tasks/stats/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const data = await api.get('/notifications/unread-count');
      setUnreadNotifications(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    logout();
  };

  if (selectedProject) {
    return (
      <ProjectDetail 
        project={selectedProject} 
        onBack={handleBackToDashboard}
        onProjectUpdate={(updatedProject: Project) => setSelectedProject(updatedProject)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  SynergySphere
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v-2a4 4 0 10-8 0c0 1.657 1.343 3 3 3h2v2l5-5v-2z" />
                </svg>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{user?.name}</span>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 1v6m8-6v6" />
                </svg>
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                My Tasks
                {stats && stats.myTasks > 0 && (
                  <span className="ml-auto bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                    {stats.myTasks}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 17h5l-5 5v-5z" />
                </svg>
                Notifications
                {unreadNotifications > 0 && (
                  <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {activeTab === 'dashboard' && (
            <ProjectDashboard 
              onProjectSelect={handleProjectSelect} 
              stats={stats}
              onStatsUpdate={fetchStats}
            />
          )}
          {activeTab === 'tasks' && <MyTasks />}
          {activeTab === 'notifications' && (
            <NotificationCenter 
              onUnreadCountChange={setUnreadNotifications}
            />
          )}
          {activeTab === 'profile' && <ProfileSettings />}
        </main>
      </div>
    </div>
  );
};
