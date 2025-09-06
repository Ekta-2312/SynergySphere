import React, { useState, useEffect } from 'react';
import { Project, Task, Discussion, User } from '../types/auth';
import { TaskBoard } from './TaskBoard';
import { DiscussionBoard } from './DiscussionBoard';
import { MemberManagement } from './MemberManagement';
import { ProjectSettings } from './ProjectSettings';
import { api } from '../utils/api';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onProjectUpdate: (project: Project) => void;
}

type TabType = 'tasks' | 'discussions' | 'members' | 'settings';

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onProjectUpdate
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [project._id]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTasks(),
        fetchDiscussions()
      ]);
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await api.get(`/tasks/project/${project._id}`);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const data = await api.get(`/discussions/project/${project._id}`);
      setDiscussions(data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      );
      // Update project stats when tasks change
      updateProjectStats(updatedTasks);
      return updatedTasks;
    });
  };

  const handleTaskCreate = (newTask: Task) => {
    setTasks(prev => {
      const updatedTasks = [newTask, ...prev];
      // Update project stats when tasks change
      updateProjectStats(updatedTasks);
      return updatedTasks;
    });
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => {
      const updatedTasks = prev.filter(task => task._id !== taskId);
      // Update project stats when tasks change
      updateProjectStats(updatedTasks);
      return updatedTasks;
    });
  };

  const updateProjectStats = (currentTasks: Task[]) => {
    const totalTasks = currentTasks.length;
    const completedTasks = currentTasks.filter(task => task.status === 'done').length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const updatedProject = {
      ...project,
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        completionPercentage
      }
    };

    onProjectUpdate(updatedProject);
  };

  const getTabCounts = () => {
    return {
      tasks: tasks.length,
      discussions: discussions.length,
      members: project.members.length
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-purple-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                ></div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-gray-600 mt-2 max-w-3xl">{project.description}</p>
                
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Owner: {project.owner.name}
                  </div>
                  
                  {project.dueDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due: {new Date(project.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {project.taskStats.completed}/{project.taskStats.total} tasks completed
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 max-w-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">Project Progress</span>
                    <span className="text-sm font-medium text-purple-600">
                      {project.taskStats.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${project.taskStats.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Team Avatars */}
              <div className="flex items-center space-x-2">
                {project.members.slice(0, 5).map((member, index) => (
                  <div
                    key={member._id}
                    className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium shadow-sm"
                    style={{ zIndex: 10 - index }}
                    title={member.name}
                  >
                    {member.name.charAt(0)}
                  </div>
                ))}
                {project.members.length > 5 && (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                    +{project.members.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Tasks
              {tabCounts.tasks > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                  {tabCounts.tasks}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('discussions')}
              className={`pb-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'discussions'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Discussions
              {tabCounts.discussions > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                  {tabCounts.discussions}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`pb-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'members'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Members
              <span className="ml-2 bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                {tabCounts.members}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'tasks' && (
              <TaskBoard
                project={project}
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskCreate={handleTaskCreate}
                onTaskDelete={handleTaskDelete}
              />
            )}
            
            {activeTab === 'discussions' && (
              <DiscussionBoard
                project={project}
                discussions={discussions}
                onDiscussionUpdate={setDiscussions}
              />
            )}
            
            {activeTab === 'members' && (
              <MemberManagement
                project={project}
                onProjectUpdate={onProjectUpdate}
              />
            )}
            
            {activeTab === 'settings' && (
              <ProjectSettings
                project={project}
                onProjectUpdate={onProjectUpdate}
                onProjectDelete={onBack}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
