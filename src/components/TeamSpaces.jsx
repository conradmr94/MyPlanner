import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  watchTeamSpaces, 
  createTeamSpace, 
  updateTeamSpace, 
  deleteTeamSpace,
  watchTeamMembers,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  createTeamInvitation,
  watchTeamInvitations,
  cancelTeamInvitation,
  getUserTeamRole,
  canUserManageTeam
} from '../data/teamSpaces';
import { sendTeamInvitation } from '../lib/emailService';

// Icons
const PlusIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const SettingsIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrashIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MailIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// Create Team Modal
const CreateTeamModal = ({ isOpen, onClose, onCreateTeam }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onCreateTeam(formData);
    setFormData({ name: '', description: '', color: 'blue' });
    onClose();
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Create Team Space</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-primary"
              placeholder="Enter team name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-primary"
              rows="3"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Color
            </label>
            <div className="flex space-x-2">
              {['blue', 'red', 'green', 'yellow', 'purple', 'gray'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-400' : 'border-gray-200'
                  } ${
                    color === 'blue' ? 'bg-blue-500' :
                    color === 'red' ? 'bg-red-500' :
                    color === 'green' ? 'bg-green-500' :
                    color === 'yellow' ? 'bg-yellow-500' :
                    color === 'purple' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-4 py-2 text-sm"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Invite Member Modal
const InviteMemberModal = ({ isOpen, onClose, onInvite, teamId }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email.trim()) return;
    
    onInvite(formData);
    setFormData({ email: '', role: 'member' });
    onClose();
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-primary"
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-primary"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-4 py-2 text-sm"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Team Card Component
const TeamCard = ({ team, onSelect, onDelete, onInvite, canManage }) => {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    if (!team.id) return;

    // Watch team members
    const unsubscribeMembers = watchTeamMembers(team.id, setMembers);
    
    // Watch team invitations
    const unsubscribeInvitations = watchTeamInvitations(team.id, setInvitations);

    return () => {
      unsubscribeMembers();
      unsubscribeInvitations();
    };
  }, [team.id]);

  const getTeamColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onSelect(team)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTeamColorClasses(team.color)}`}>
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
            {team.description && (
              <p className="text-sm text-gray-600 mt-1">{team.description}</p>
            )}
          </div>
        </div>
        
        {canManage && (
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInvite(team);
              }}
              className="text-gray-400 hover:text-blue-500 p-1"
              title="Invite member"
            >
              <MailIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(team.id);
              }}
              className="text-gray-400 hover:text-red-500 p-1"
              title="Delete team"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <UsersIcon className="w-4 h-4" />
            <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
          </span>
          {invitations.length > 0 && (
            <span className="flex items-center space-x-1">
              <MailIcon className="w-4 h-4" />
              <span>{invitations.length} pending</span>
            </span>
          )}
        </div>
        <span className="text-xs">
          Created {new Date(team.createdAt?.toDate?.() || team.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

// Main TeamSpaces Component
const TeamSpaces = ({ onSelectTeam }) => {
  const { user, requireAuth } = useAuth();
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user's teams
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = watchTeamSpaces(user.uid, (teamsData) => {
      setTeams(teamsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateTeam = async (teamData) => {
    if (!requireAuth('create team')) return;

    try {
      await createTeamSpace(user.uid, teamData);
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team. Please try again.');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTeamSpace(teamId);
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team. Please try again.');
    }
  };

  const handleInviteMember = async (inviteData) => {
    if (!selectedTeam) return;

    try {
      // Create invitation in database
      await createTeamInvitation(selectedTeam.id, inviteData.email, user.uid, inviteData.role);
      
      // Send email invitation
      await sendTeamInvitation({
        email: inviteData.email,
        teamName: selectedTeam.name,
        inviterName: user.name || user.email,
        role: inviteData.role,
        invitationLink: `${window.location.origin}/join-team?teamId=${selectedTeam.id}&email=${inviteData.email}`
      });
      
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    }
  };

  const handleSelectTeam = (team) => {
    if (onSelectTeam) {
      onSelectTeam(team);
    } else {
      setSelectedTeam(team);
    }
  };

  const handleInviteToTeam = (team) => {
    setSelectedTeam(team);
    setShowInviteModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Spaces</h1>
              <p className="text-gray-600 mt-1">Collaborate with your team on tasks, notes, and events</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-4 py-2 text-sm"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Team
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto mb-4 w-16 h-16 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-600 mb-6">Create your first team space to start collaborating</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary px-6 py-3"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Your First Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onSelect={handleSelectTeam}
                onDelete={handleDeleteTeam}
                onInvite={handleInviteToTeam}
                canManage={true} // TODO: Check actual permissions
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTeam={handleCreateTeam}
      />

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
        teamId={selectedTeam?.id}
      />
    </div>
  );
};

export default TeamSpaces;
