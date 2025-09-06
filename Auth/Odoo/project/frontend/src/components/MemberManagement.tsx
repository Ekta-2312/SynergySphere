import React, { useState, useEffect } from 'react';
import { Project } from '../types/auth';
import { api } from '../utils/api';

interface MemberManagementProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ project, onProjectUpdate }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingInvitations, setPendingInvitations] = useState([]);

  useEffect(() => {
    fetchPendingInvitations();
  }, [project._id]);

  const fetchPendingInvitations = async () => {
    try {
      const invitations = await api.get(`/invitations/project/${project._id}`);
      setPendingInvitations(invitations);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/invitations/invite', {
        projectId: project._id,
        email: inviteEmail,
      });

      setSuccess(
        'Invitation sent successfully! The user will receive an email to join the project.'
      );
      setInviteEmail('');
      setShowInviteModal(false);
      fetchPendingInvitations(); // Refresh pending invitations
    } catch (error: any) {
      setError(error.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const updatedMembers = await api.delete(`/projects/${project._id}/members/${memberId}`);

      // Update the project with new members list
      const updatedProject = { ...project, members: updatedMembers };
      onProjectUpdate(updatedProject);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  return (
    <div className='p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h2 className='text-2xl font-bold text-gray-900'>Team Members</h2>
          <button
            onClick={() => setShowInviteModal(true)}
            className='bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all'
          >
            Invite Member
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6'>
            {success}
          </div>
        )}

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6'>
            {error}
          </div>
        )}

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-6'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Pending Invitations ({pendingInvitations.length})
              </h3>
            </div>

            <div className='divide-y divide-gray-200'>
              {pendingInvitations.map((invitation: any) => (
                <div key={invitation._id} className='px-6 py-4 flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center'>
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
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>{invitation.inviteeEmail}</h4>
                      <p className='text-gray-600 text-sm'>
                        Invited on {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-3'>
                    <span className='px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full'>
                      Pending
                    </span>
                    <span className='text-sm text-gray-500'>
                      Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members List */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Project Team ({project.members?.length || 0})
            </h3>
          </div>

          <div className='divide-y divide-gray-200'>
            {project.members && project.members.length > 0 ? (
              project.members.map(member => (
                <div key={member._id} className='px-6 py-4 flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center'>
                      <span className='text-white font-medium text-lg'>
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>{member.name}</h4>
                      <p className='text-gray-600'>{member.email}</p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-3'>
                    {member._id === (project.owner as any)._id ? (
                      <span className='px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full'>
                        Owner
                      </span>
                    ) : (
                      <span className='px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full'>
                        Member
                      </span>
                    )}

                    {member._id !== (project.owner as any)._id && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className='text-red-600 hover:text-red-800 transition-colors'
                      >
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className='px-6 py-8 text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>No team members yet</h3>
                <p className='text-gray-600'>Invite colleagues to collaborate on this project</p>
              </div>
            )}
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white rounded-xl shadow-2xl w-full max-w-md mx-4'>
              <div className='p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h3 className='text-xl font-bold text-gray-900'>Invite Team Member</h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className='text-gray-400 hover:text-gray-600 transition-colors'
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

                <form onSubmit={handleInviteMember} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Address
                    </label>
                    <input
                      type='email'
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder='colleague@company.com'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none'
                      required
                    />
                  </div>

                  <div className='flex space-x-3 pt-4'>
                    <button
                      type='button'
                      onClick={() => setShowInviteModal(false)}
                      className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      disabled={loading}
                      className='flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50'
                    >
                      {loading ? 'Sending...' : 'Send Invite'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
