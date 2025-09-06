import React, { useState } from 'react';
import { Project } from '../types/auth';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';

interface ProjectSettingsProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: () => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  project,
  onProjectUpdate,
  onProjectDelete,
}) => {
  const { showSuccess, showError } = useToast();

  // Ensure project has required fields with defaults
  const safeProject = {
    ...project,
    title: project.title || '',
    description: project.description || '',
    color: project.color || '#8B5CF6',
    status: project.status || 'active',
    dueDate: project.dueDate || '',
  };

  const [formData, setFormData] = useState({
    title: safeProject.title,
    description: safeProject.description,
    color: safeProject.color,
    status: safeProject.status as 'active' | 'completed' | 'on-hold' | 'cancelled',
    dueDate: safeProject.dueDate ? new Date(safeProject.dueDate).toISOString().split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title?.trim()) {
        showError('Project title is required');
        setLoading(false);
        return;
      }

      console.log('Updating project with data:', formData);
      const updatedProject = await api.put(`/projects/${project._id}`, formData);
      console.log('Project updated successfully:', updatedProject);

      // Safely call the update callback
      try {
        if (typeof onProjectUpdate === 'function') {
          onProjectUpdate(updatedProject);
        }
      } catch (callbackError) {
        console.error('Error in onProjectUpdate callback:', callbackError);
      }

      showSuccess('Project updated successfully!');
    } catch (error: any) {
      console.error('Error updating project:', error);
      showError(error.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${project._id}`);
      showSuccess('Project deleted successfully');
      onProjectDelete();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      showError(error.message || 'Failed to delete project');
    }
  };

  const colorOptions = [
    '#8B5CF6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#3B82F6',
    '#8B5A2B',
    '#EC4899',
    '#6366F1',
    '#14B8A6',
    '#F97316',
  ];

  return (
    <div className='p-8'>
      <div className='max-w-2xl mx-auto'>
        <h2 className='text-2xl font-bold text-gray-900 mb-8'>Project Settings</h2>

        <div className='space-y-8'>
          {/* Project Details */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-6'>Project Details</h3>

            <form onSubmit={handleUpdateProject} className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Project Name</label>
                <input
                  type='text'
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none'
                  placeholder='What is this project about?'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Project Status
                </label>
                <select
                  value={formData.status}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      status: e.target.value as 'active' | 'completed' | 'on-hold' | 'cancelled',
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none'
                >
                  <option value='active'>Active</option>
                  <option value='on-hold'>On Hold</option>
                  <option value='completed'>Completed</option>
                  <option value='cancelled'>Cancelled</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Due Date</label>
                <input
                  type='date'
                  value={formData.dueDate}
                  onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Project Color
                </label>
                <div className='flex space-x-2'>
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type='button'
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color
                          ? 'ring-2 ring-gray-400 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={loading}
                  className='bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50'
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Project Status */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Project Information</h3>

            <div className='grid grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Created</label>
                <p className='text-gray-900'>{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                <span
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    project.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                </span>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Total Tasks</label>
                <p className='text-gray-900'>{project.tasks?.length || 0}</p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Team Members</label>
                <p className='text-gray-900'>{project.members?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className='bg-white rounded-lg shadow-sm border border-red-200 p-6'>
            <h3 className='text-lg font-semibold text-red-900 mb-4'>Danger Zone</h3>

            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex justify-between items-start'>
                <div>
                  <h4 className='font-medium text-red-900 mb-1'>Delete Project</h4>
                  <p className='text-sm text-red-700'>
                    Once you delete this project, there is no going back. All tasks, discussions,
                    and files will be permanently deleted.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className='ml-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white rounded-xl shadow-2xl w-full max-w-md mx-4'>
              <div className='p-6'>
                <div className='flex items-center mb-4'>
                  <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4'>
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
                  <h3 className='text-lg font-bold text-gray-900'>Delete Project</h3>
                </div>

                <p className='text-gray-600 mb-6'>
                  Are you sure you want to delete "{project.title}"? This action cannot be undone
                  and will permanently delete all project data.
                </p>

                <div className='flex space-x-3'>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className='flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
