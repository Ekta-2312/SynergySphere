import React, { useState } from 'react';
import { Project, Discussion } from '../types/auth';
import { api } from '../utils/api';

interface DiscussionBoardProps {
  project: Project;
  discussions: Discussion[];
  onDiscussionUpdate: (discussions: Discussion[]) => void;
}

export const DiscussionBoard: React.FC<DiscussionBoardProps> = ({
  project,
  discussions,
  onDiscussionUpdate
}) => {
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) return;

    setLoading(true);
    try {
      const discussion = await api.post('/discussions', {
        title: newDiscussion.title,
        content: newDiscussion.content,
        project: project._id
      });
      
      onDiscussionUpdate([discussion, ...discussions]);
      setNewDiscussion({ title: '', content: '' });
    } catch (error) {
      console.error('Error creating discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Project Discussions</h2>

        {/* New Discussion Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Start a Discussion</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Discussion title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
            <textarea
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
              placeholder="What would you like to discuss?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Start Discussion'}
            </button>
          </form>
        </div>

        {/* Discussions List */}
        <div className="space-y-6">
          {discussions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
              <p className="text-gray-600">Start the conversation by creating the first discussion</p>
            </div>
          ) : (
            discussions.map((discussion) => (
              <div key={discussion._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {discussion.isPinned && (
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-yellow-700 font-medium">Pinned</span>
                  </div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{discussion.author.name.charAt(0)}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{discussion.title}</h4>
                      {discussion.isResolved && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Resolved</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{discussion.content}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>By {discussion.author.name}</span>
                      <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                      {discussion.replies.length > 0 && (
                        <span>{discussion.replies.length} replies</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
