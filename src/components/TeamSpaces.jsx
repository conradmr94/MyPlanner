// src/components/TeamSpaces.jsx
import React, { useState, useMemo } from 'react';

// Simple SVG icon components
const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PlusIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ChevronRightIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowLeftIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EditIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SaveIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CancelIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChartIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const InfoIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TeamSpaces = ({ 
  teams = [], 
  setTeams = () => {},
  tasks = [],
  setTasks = () => {},
  toggleTask = () => {},
  deleteTask = () => {},
  updateTask = () => {},
  changePriority = () => {},
  user = null
}) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    description: '',
    color: 'blue',
  });
  const [editTeamData, setEditTeamData] = useState({
    id: null,
    name: '',
    description: '',
    color: 'blue',
    members: [],
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState('');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-400 bg-red-50';
      case 'low':
        return 'border-l-gray-400 bg-gray-50';
      default:
        return 'border-l-blue-400 bg-blue-50';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-400';
      case 'low':
        return 'bg-gray-400';
      default:
        return 'bg-blue-400';
    }
  };

  const getTeamColor = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colorMap[color] || colorMap.blue;
  };

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamData.name.trim()) return;

    const team = {
      id: Date.now(),
      name: newTeamData.name.trim(),
      description: newTeamData.description.trim(),
      color: newTeamData.color,
      members: user ? [{ email: user.email, role: 'owner' }] : [], // Current user as owner
      createdAt: new Date(),
    };

    setTeams(prev => [...prev, team]);
    setShowCreateTeamModal(false);
    setNewTeamData({ name: '', description: '', color: 'blue' });
  };

  const handleDeleteTeam = (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? Team tasks will be unassigned.')) {
      // Unassign tasks from this team
      setTasks(prev => prev.map(task => 
        task.teamId === teamId ? { ...task, teamId: null } : task
      ));
      
      setTeams(prev => prev.filter(t => t.id !== teamId));
      
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(null);
      }
    }
  };

  const handleOpenEditTeam = (team) => {
    setEditTeamData({
      id: team.id,
      name: team.name,
      description: team.description || '',
      color: team.color,
      members: Array.isArray(team.members) ? team.members : [],
    });
    setShowEditTeamModal(true);
  };

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) return;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    // Check if member already exists
    if (editTeamData.members.some(m => m.email === newMemberEmail.trim())) {
      alert('This member is already in the team');
      return;
    }

    setEditTeamData(prev => ({
      ...prev,
      members: [...prev.members, { email: newMemberEmail.trim(), role: 'member' }]
    }));
    setNewMemberEmail('');
  };

  const handleRemoveMember = (emailToRemove) => {
    // Don't allow removing the owner
    const member = editTeamData.members.find(m => m.email === emailToRemove);
    if (member && member.role === 'owner') {
      alert('Cannot remove the team owner');
      return;
    }

    setEditTeamData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.email !== emailToRemove)
    }));
  };

  const handleEditTeam = (e) => {
    e.preventDefault();
    if (!editTeamData.name.trim()) return;

    const updatedTeam = {
      ...editTeamData,
      name: editTeamData.name.trim(),
      description: editTeamData.description.trim(),
    };

    setTeams(prev => prev.map(team => 
      team.id === editTeamData.id ? updatedTeam : team
    ));

    // Update selected team if it's the one being edited
    if (selectedTeam?.id === editTeamData.id) {
      setSelectedTeam(updatedTeam);
    }

    setShowEditTeamModal(false);
    setEditTeamData({ id: null, name: '', description: '', color: 'blue', members: [] });
    setNewMemberEmail('');
  };

  const getTeamTaskCount = (teamId) => {
    return tasks.filter(task => task.teamId === teamId && !task.completed).length;
  };

  const getTeamStats = (teamId) => {
    const teamTasks = tasks.filter(task => task.teamId == teamId);
    const completedTasks = teamTasks.filter(task => task.completed).length;
    const totalTasks = teamTasks.length;
    const activeTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const priorityCounts = {
      high: teamTasks.filter(t => !t.completed && t.priority === 'high').length,
      medium: teamTasks.filter(t => !t.completed && t.priority === 'medium').length,
      low: teamTasks.filter(t => !t.completed && t.priority === 'low').length,
    };

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      completionRate,
      priorityCounts
    };
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const saveEditingTask = () => {
    if (editingTaskText.trim() && editingTaskId) {
      updateTask(editingTaskId, { text: editingTaskText.trim() });
      setEditingTaskId(null);
      setEditingTaskText('');
    }
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  const addTask = async (e) => {
    e.preventDefault();
    const text = newTask.trim();
    if (!text || submitting || !selectedTeam) return;
    
    setSubmitting(true);

    const taskToAdd = {
      id: Date.now(),
      text: text,
      completed: false,
      priority: 'medium',
      teamId: selectedTeam.id, // Automatically assign to current team
      meta: {
        score: 0.5,
        rationale: 'Team task',
        due: null,
      },
    };
    
    setTasks(prev => [...prev, taskToAdd]);
    setNewTask('');
    setSubmitting(false);
  };

  // Get current team's tasks
  const currentTeamTasks = useMemo(() => {
    if (!selectedTeam) return [];
    // Use == to handle both string and number comparisons
    return tasks.filter(task => task.teamId === selectedTeam.id);
  }, [tasks, selectedTeam]);

  const completedTasks = currentTeamTasks.filter((t) => t.completed).length;
  const totalTasks = currentTeamTasks.length;

  // Sort by completed status
  const visibleTasks = useMemo(() => {
    const active = currentTeamTasks
      .filter((t) => !t.completed)
      .sort((a, b) => (b.meta?.score ?? 0) - (a.meta?.score ?? 0));
    const done = currentTeamTasks.filter((t) => t.completed);
    return [...active, ...done];
  }, [currentTeamTasks]);

  // Team List View
  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-[95vw] mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Spaces</h1>
              <p className="text-gray-600">Select a team to view tasks and collaborate</p>
            </div>
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Team</span>
            </button>
          </div>

          {teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className="card hover:shadow-lg transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => setSelectedTeam(team)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${getTeamColor(team.color)}`}>
                          <UsersIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-500">
                            {Array.isArray(team.members) ? team.members.length : team.members} member{(Array.isArray(team.members) ? team.members.length : team.members) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{team.description || 'No description'}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        {getTeamTaskCount(team.id)} active tasks
                      </span>
                      <span className="text-xs text-primary-600 font-medium">View team →</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditTeam(team);
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Edit team
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeam(team.id);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 transition-colors"
                    >
                      Delete team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">No teams yet</p>
              <p className="text-sm text-gray-600 mb-6">Create your first team to get started</p>
              <button
                onClick={() => setShowCreateTeamModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Your First Team</span>
              </button>
            </div>
          )}

          {/* Create Team Modal */}
          {showCreateTeamModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Create New Team</h3>
                  <button
                    onClick={() => {
                      setShowCreateTeamModal(false);
                      setNewTeamData({ name: '', description: '', color: 'blue' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon />
                  </button>
                </div>

                <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={newTeamData.name}
                      onChange={(e) => setNewTeamData(prev => ({ ...prev, name: e.target.value }))}
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
                      value={newTeamData.description}
                      onChange={(e) => setNewTeamData(prev => ({ ...prev, description: e.target.value }))}
                      className="input-primary"
                      rows="3"
                      placeholder="Optional description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex space-x-2">
                      {['blue', 'green', 'purple', 'red', 'yellow'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewTeamData(prev => ({ ...prev, color }))}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            newTeamData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                          } ${
                            color === 'blue' ? 'bg-blue-500' :
                            color === 'green' ? 'bg-green-500' :
                            color === 'purple' ? 'bg-purple-500' :
                            color === 'red' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateTeamModal(false);
                        setNewTeamData({ name: '', description: '', color: 'blue' });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary px-4 py-2 text-sm"
                      disabled={!newTeamData.name.trim()}
                    >
                      Create Team
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Team Detail View
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-[95vw] mx-auto px-4 py-8">
        {/* Back button and team header */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedTeam(null)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to teams</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${getTeamColor(selectedTeam.color)}`}>
                <UsersIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 
                  className="text-3xl font-bold text-gray-900 hover:text-primary-600 cursor-pointer transition-colors flex items-center space-x-2"
                  onClick={() => setShowTeamDetailsModal(true)}
                  title="Click to view team details"
                >
                  <span>{selectedTeam.name}</span>
                  <InfoIcon className="w-6 h-6" />
                </h1>
                <p className="text-gray-600">
                  {Array.isArray(selectedTeam.members) ? selectedTeam.members.length : selectedTeam.members} member{(Array.isArray(selectedTeam.members) ? selectedTeam.members.length : selectedTeam.members) !== 1 ? 's' : ''} • {selectedTeam.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenEditTeam(selectedTeam)}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <EditIcon />
              <span>Edit Team</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Team Tasks Section */}
          <div className="lg:col-span-1">
            <div className="card animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Team Tasks</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {currentTeamTasks.filter((t) => !t.completed).length} remaining
                  </span>
                  {completedTasks > 0 && (
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Task Form */}
              <form onSubmit={addTask} className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add team task..."
                    className="input-primary flex-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="btn-primary px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newTask.trim() || submitting}
                    title="Add task"
                  >
                    {submitting ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <PlusIcon />
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  💡 Add tasks for your team to collaborate on
                </p>
              </form>

              {/* Task List */}
              <div className="space-y-3">
                {visibleTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm ${
                      task.completed ? 'bg-gray-50 border-l-gray-300 opacity-75' : getPriorityColor(task.priority)
                    }`}
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                      }`}
                      title={task.completed ? 'Mark as not done' : 'Mark as done'}
                    >
                      {task.completed && <CheckIcon className="w-3 h-3" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingTaskId === task.id ? (
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={editingTaskText}
                            onChange={(e) => setEditingTaskText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditingTask();
                              if (e.key === 'Escape') cancelEditingTask();
                            }}
                            className="flex-1 text-sm border border-primary-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            autoFocus
                          />
                          <button
                            onClick={saveEditingTask}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                            title="Save"
                          >
                            <SaveIcon />
                          </button>
                          <button
                            onClick={cancelEditingTask}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Cancel"
                          >
                            <CancelIcon />
                          </button>
                        </div>
                      ) : (
                        <p
                          className={`text-sm ${
                            task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}
                        >
                          {task.text}
                        </p>
                      )}

                      {/* Priority + rationale/due */}
                      {!task.completed && editingTaskId !== task.id && (
                        <div className="space-y-2 mt-1">
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                            <div className={`w-2 h-2 rounded-full ${getPriorityDot(task.priority)}`}></div>
                            <span className="text-xs text-gray-600 capitalize">{task.priority} priority</span>
                            {task.manualPriority && (
                              <span className="text-xs text-primary-600" title="Manually set priority">
                                (Manual)
                              </span>
                            )}
                            {!task.manualPriority && task.meta?.rationale && (
                              <span className="text-xs text-gray-500">· {task.meta.rationale}</span>
                            )}
                            {task.meta?.due && (
                              <span className="text-xs text-gray-500">
                                · Due: {new Date(task.meta.due).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Change priority:</span>
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changePriority(task.id, 'low');
                                }}
                                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                                  task.priority === 'low'
                                    ? 'bg-gray-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                Low
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changePriority(task.id, 'medium');
                                }}
                                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                                  task.priority === 'medium'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                Med
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changePriority(task.id, 'high');
                                }}
                                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                                  task.priority === 'high'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                High
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {editingTaskId !== task.id && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startEditingTask(task)}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Edit task"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete task"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {currentTeamTasks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckIcon className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No team tasks yet</p>
                  <p className="text-sm">Add your first team task above to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Collaboration Section */}
          <div className="lg:col-span-2">
            <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center space-x-2 mb-4">
                <UsersIcon className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Team Collaboration</h2>
              </div>
              <div className="text-center py-12 text-gray-500">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium mb-2">Coming Soon</p>
                <p className="text-sm">Team calendar, shared notes, and real-time collaboration features will be available here.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Team Modal */}
        {showEditTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Edit Team</h3>
                <button
                  onClick={() => {
                    setShowEditTeamModal(false);
                    setEditTeamData({ id: null, name: '', description: '', color: 'blue', members: [] });
                    setNewMemberEmail('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon />
                </button>
              </div>

              <form onSubmit={handleEditTeam} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={editTeamData.name}
                    onChange={(e) => setEditTeamData(prev => ({ ...prev, name: e.target.value }))}
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
                    value={editTeamData.description}
                    onChange={(e) => setEditTeamData(prev => ({ ...prev, description: e.target.value }))}
                    className="input-primary"
                    rows="3"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {['blue', 'green', 'purple', 'red', 'yellow'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditTeamData(prev => ({ ...prev, color }))}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          editTeamData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                        } ${
                          color === 'blue' ? 'bg-blue-500' :
                          color === 'green' ? 'bg-green-500' :
                          color === 'purple' ? 'bg-purple-500' :
                          color === 'red' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Members
                  </label>
                  
                  {/* Add member input */}
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMember();
                        }
                      }}
                      className="input-primary flex-1"
                      placeholder="Enter email address"
                    />
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {/* Members list */}
                  {editTeamData.members.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {editTeamData.members.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">{member.email}</span>
                            {member.role === 'owner' && (
                              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                Owner
                              </span>
                            )}
                          </div>
                          {member.role !== 'owner' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.email)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-4 text-center border border-gray-200 rounded-lg">
                      No members yet. Add members by email address.
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Add team members by entering their email addresses
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditTeamModal(false);
                      setEditTeamData({ id: null, name: '', description: '', color: 'blue', members: [] });
                      setNewMemberEmail('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2 text-sm"
                    disabled={!editTeamData.name.trim()}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Team Details Modal */}
        {showTeamDetailsModal && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getTeamColor(selectedTeam.color)}`}>
                    <UsersIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedTeam.name}</h3>
                </div>
                <button
                  onClick={() => setShowTeamDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Team Description */}
                {selectedTeam.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedTeam.description}</p>
                  </div>
                )}

                {/* Team Statistics */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <ChartIcon className="w-5 h-5 text-primary-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Team Statistics</h4>
                  </div>
                  
                  {(() => {
                    const stats = getTeamStats(selectedTeam.id);
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Total Tasks */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
                          <div className="text-sm text-gray-600">Total Tasks</div>
                        </div>

                        {/* Active Tasks */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-blue-600">{stats.activeTasks}</div>
                          <div className="text-sm text-blue-600">Active Tasks</div>
                        </div>

                        {/* Completed Tasks */}
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                          <div className="text-sm text-green-600">Completed Tasks</div>
                        </div>

                        {/* Completion Rate */}
                        <div className="bg-primary-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-primary-600">{stats.completionRate}%</div>
                          <div className="text-sm text-primary-600">Completion Rate</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Priority Breakdown */}
                  {(() => {
                    const stats = getTeamStats(selectedTeam.id);
                    const hasActiveTasks = stats.activeTasks > 0;
                    
                    return hasActiveTasks && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Active Tasks by Priority</h5>
                        <div className="space-y-2">
                          {/* High Priority */}
                          {stats.priorityCounts.high > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <span className="text-sm text-gray-700">High Priority</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{stats.priorityCounts.high}</span>
                            </div>
                          )}

                          {/* Medium Priority */}
                          {stats.priorityCounts.medium > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                                <span className="text-sm text-gray-700">Medium Priority</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{stats.priorityCounts.medium}</span>
                            </div>
                          )}

                          {/* Low Priority */}
                          {stats.priorityCounts.low > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                <span className="text-sm text-gray-700">Low Priority</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{stats.priorityCounts.low}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Progress Bar */}
                  {(() => {
                    const stats = getTeamStats(selectedTeam.id);
                    return stats.totalTasks > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Overall Progress</span>
                          <span className="font-medium text-gray-900">{stats.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${stats.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <UsersIcon className="w-5 h-5 text-primary-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Team Members</h4>
                  </div>

                  {Array.isArray(selectedTeam.members) && selectedTeam.members.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTeam.members.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-700">
                                {member.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">{member.email}</span>
                          </div>
                          {member.role === 'owner' && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                              Owner
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-lg">
                      No members in this team yet
                    </p>
                  )}
                </div>

                {/* Team Info */}
                {selectedTeam.createdAt && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Created on {new Date(selectedTeam.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTeamDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowTeamDetailsModal(false);
                    handleOpenEditTeam(selectedTeam);
                  }}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Edit Team
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeamSpaces;

