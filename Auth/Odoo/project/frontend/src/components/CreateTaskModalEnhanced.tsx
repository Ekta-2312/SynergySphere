import React, { useState, useEffect } from 'react';
import { Project, Task, User } from '../types/auth';
import { api } from '../utils/api';

interface CreateTaskModalProps {
  project: Project;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

export const CreateTaskModalEnhanced: React.FC<CreateTaskModalProps> = ({
  project,
  onClose,
  onTaskCreated,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [availableTags] = useState([
    'Frontend',
    'Backend',
    'Design',
    'Testing',
    'DevOps',
    'Research',
    'Documentation',
    'Bug Fix',
    'Feature',
    'Enhancement',
  ]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      // Get project members and all users
      const users = await api.get('/users');
      setTeamMembers(users);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        project: project._id,
        assignee: formData.assigneeId || null,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        tags: formData.tags,
      };

      console.log('Creating task with data:', taskData);
      const newTask = await api.post('/tasks', taskData);
      console.log('Task created successfully:', newTask);
      onTaskCreated(newTask);
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    setFormData(prev => ({
      ...prev,
      priority,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-300';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-300';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-300';
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>Create New Task</h2>
            <p className='text-sm text-gray-500 mt-1'>
              Project:{' '}
              <span className='font-medium' style={{ color: project.color }}>
                {project.title}
              </span>
            </p>
          </div>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors'>
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

        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-2'>
              Task Title *
            </label>
            <input
              type='text'
              id='title'
              name='title'
              value={formData.title}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors'
              placeholder='Enter task title'
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Tags</label>
            <div className='flex flex-wrap gap-2 mb-3'>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type='button'
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className='flex gap-2'>
              <input
                type='text'
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder='Add custom tag'
                className='flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm'
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
              />
              <button
                type='button'
                onClick={handleAddNewTag}
                className='px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm'
              >
                Add
              </button>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label htmlFor='assigneeId' className='block text-sm font-medium text-gray-700 mb-2'>
              Assign To
            </label>
            <select
              id='assigneeId'
              name='assigneeId'
              value={formData.assigneeId}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors'
            >
              <option value=''>Unassigned</option>
              {teamMembers.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor='dueDate' className='block text-sm font-medium text-gray-700 mb-2'>
              Due Date
            </label>
            <input
              type='date'
              id='dueDate'
              name='dueDate'
              value={formData.dueDate}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors'
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Priority */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Priority</label>
            <div className='grid grid-cols-3 gap-3'>
              {(['low', 'medium', 'high'] as const).map(priority => (
                <button
                  key={priority}
                  type='button'
                  onClick={() => handlePriorityChange(priority)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    formData.priority === priority
                      ? getPriorityColor(priority)
                      : 'text-gray-600 bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className='flex items-center justify-center space-x-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        priority === 'high'
                          ? 'bg-red-500'
                          : priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                    />
                    <span className='capitalize'>{priority}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-2'>
              Description
            </label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none'
              placeholder='Describe the task...'
            />
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50'
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
