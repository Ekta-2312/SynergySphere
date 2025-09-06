import React, { useState, useEffect } from 'react';
import { Project, TaskStats } from '../types/auth';
import { CreateProjectModalEnhanced } from './CreateProjectModalEnhanced';
import { api } from '../utils/api';

interface ProjectDashboardProps {
  onProjectSelect: (project: Project) => void;
  stats: TaskStats | null;
  onStatsUpdate: () => void;
  refreshTrigger?: number;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  onProjectSelect,
  stats,
  onStatsUpdate,
  refreshTrigger,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Refresh projects when refreshTrigger changes
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchProjects();
    }
  }, [refreshTrigger]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.get('/projects');
      console.log('Fetched projects with stats:', data); // Debug log
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    setShowCreateModal(false);
    onStatsUpdate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className='p-8'>
      {/* Header */}
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Projects Dashboard</h1>
          <p className='text-gray-600 mt-2'>Manage your projects and track progress</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg'
        >
          + New Project
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-8'>
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='flex items-center'>
              <div className='p-3 bg-purple-100 rounded-lg'>
                <svg
                  className='w-6 h-6 text-purple-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Total Projects</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.totalProjects}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='flex items-center'>
              <div className='p-3 bg-blue-100 rounded-lg'>
                <svg
                  className='w-6 h-6 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Total Tasks</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.totalTasks}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='flex items-center'>
              <div className='p-3 bg-green-100 rounded-lg'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Completed</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.completedTasks}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='flex items-center'>
              <div className='p-3 bg-yellow-100 rounded-lg'>
                <svg
                  className='w-6 h-6 text-yellow-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>My Tasks</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.myTasks}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <div className='flex items-center'>
              <div className='p-3 bg-red-100 rounded-lg'>
                <svg
                  className='w-6 h-6 text-red-600'
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
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Overdue</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.overdueTasks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {projects.map(project => (
            <div
              key={project._id}
              onClick={() => onProjectSelect(project)}
              className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group'
            >
              {/* Project Image */}
              {project.image && (
                <div className='mb-4 -mx-6 -mt-6'>
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${project.image}`}
                    alt={project.title}
                    className='w-full h-32 object-cover rounded-t-xl'
                    onError={e => {
                      // Hide image if it fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center space-x-3'>
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <h3 className='text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors'>
                    {project.title}
                  </h3>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                >
                  {project.status.replace('-', ' ')}
                </span>
              </div>

              <p className='text-gray-600 text-sm mb-4 line-clamp-2'>{project.description}</p>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className='flex flex-wrap gap-1 mb-3'>
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium'
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium'>
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Priority */}
              {project.priority && (
                <div className='flex items-center mb-3'>
                  <span className='text-xs text-gray-500 mr-2'>Priority:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : project.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                  </span>
                </div>
              )}

              {/* Project Manager */}
              {project.projectManager && (
                <div className='flex items-center mb-3'>
                  <span className='text-xs text-gray-500 mr-2'>Manager:</span>
                  <div className='flex items-center'>
                    <div className='w-5 h-5 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2'>
                      {project.projectManager.name.charAt(0)}
                    </div>
                    <span className='text-xs font-medium text-gray-700'>
                      {project.projectManager.name}
                    </span>
                  </div>
                </div>
              )}

              <div className='space-y-3'>
                {/* Progress Bar */}
                <div>
                  <div className='flex justify-between items-center mb-1'>
                    <span className='text-xs font-medium text-gray-600'>Progress</span>
                    <span
                      className={`text-xs font-medium ${getPriorityColor(project.taskStats.completionPercentage)}`}
                    >
                      {project.taskStats.completionPercentage}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all'
                      style={{ width: `${project.taskStats.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Task Stats */}
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-gray-600'>
                    {project.taskStats.completed}/{project.taskStats.total} tasks
                  </span>
                  <div className='flex items-center space-x-2'>
                    {project.members.slice(0, 3).map((member, index) => (
                      <div
                        key={member._id}
                        className='w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium'
                        style={{ zIndex: 10 - index }}
                      >
                        {member.name.charAt(0)}
                      </div>
                    ))}
                    {project.members.length > 3 && (
                      <span className='text-xs text-gray-500'>+{project.members.length - 3}</span>
                    )}
                  </div>
                </div>

                {/* Due Date */}
                {project.dueDate && (
                  <div className='flex items-center text-xs text-gray-500'>
                    <svg
                      className='w-4 h-4 mr-1'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    Due {new Date(project.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className='col-span-full flex flex-col items-center justify-center py-12'>
              <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                <svg
                  className='w-12 h-12 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No projects yet</h3>
              <p className='text-gray-600 text-center mb-4'>
                Get started by creating your first project
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className='bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all'
              >
                Create Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModalEnhanced
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};
