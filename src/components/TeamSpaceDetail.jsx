import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  watchTeamTasks,
  createTeamTask,
  updateTeamTask,
  completeTeamTask,
  deleteTeamTask,
  watchTeamNotes,
  createTeamNote,
  updateTeamNote,
  deleteTeamNote,
  watchTeamEvents,
  createTeamEvent,
  updateTeamEvent,
  deleteTeamEvent,
  watchTeamMembers,
  watchTeamInvitations,
  getUserTeamRole,
  canUserManageTeam
} from '../data/teamSpaces';

// Import existing components
import TeamCalendar from './TeamCalendar';

// Icons
const PlusIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const NoteIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CalendarIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const ArrowLeftIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const TrashIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Team Tasks Component
const TeamTasks = ({ teamId, user }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!teamId) return;

    const unsubscribe = watchTeamTasks(teamId, (tasksData) => {
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [teamId]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const text = newTask.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    try {
      await createTeamTask(teamId, {
        title: text,
        priority: 'medium'
      }, user.uid);
      setNewTask('');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      await completeTeamTask(taskId, completed);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTeamTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

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

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CheckIcon className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Team Tasks</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {tasks.filter(t => t.status === 'open').length} remaining
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
      <form onSubmit={handleAddTask} className="mb-6">
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
          >
            {submitting ? (
              <span className="text-xs">...</span>
            ) : (
              <PlusIcon />
            )}
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm ${
              task.status === 'done' ? 'bg-gray-50 border-l-gray-300 opacity-75' : getPriorityColor(task.priority)
            }`}
          >
            <button
              onClick={() => handleToggleTask(task.id, task.status !== 'done')}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 ${
                task.status === 'done'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              {task.status === 'done' && <CheckIcon className="w-3 h-3" />}
            </button>

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${
                  task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
              )}

              {task.status !== 'done' && (
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                  <div className={`w-2 h-2 rounded-full ${getPriorityDot(task.priority)}`}></div>
                  <span className="text-xs text-gray-600 capitalize">{task.priority} priority</span>
                  {task.dueAt && (
                    <span className="text-xs text-gray-500">
                      · Due: {new Date(task.dueAt.toDate()).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => handleDeleteTask(task.id)}
              className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckIcon className="mx-auto mb-3 w-12 h-12 text-gray-300" />
          <p className="text-lg font-medium mb-2">No tasks yet</p>
          <p className="text-sm">Add your first team task above!</p>
        </div>
      )}
    </div>
  );
};

// Team Notes Component
const TeamNotes = ({ teamId, user }) => {
  const [notes, setNotes] = useState([]);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    if (!teamId) return;

    const unsubscribe = watchTeamNotes(teamId, (notesData) => {
      setNotes(notesData);
    });

    return () => unsubscribe();
  }, [teamId]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowNoteEditor(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowNoteEditor(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (editingNote) {
        await updateTeamNote(editingNote.id, noteData);
      } else {
        await createTeamNote(teamId, noteData, user.uid);
      }
      setShowNoteEditor(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteTeamNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleCloseNoteEditor = () => {
    setShowNoteEditor(false);
    setEditingNote(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <NoteIcon className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Team Notes</h2>
        </div>
        <button
          onClick={handleCreateNote}
          className="btn-primary px-3 py-1.5 text-sm"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer group"
            onClick={() => handleEditNote(note)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {note.content.replace(/[#*`]/g, '').substring(0, 100)}...
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <NoteIcon className="mx-auto mb-3 w-12 h-12 text-gray-300" />
          <p className="text-lg font-medium mb-2">No notes yet</p>
          <p className="text-sm">Create your first team note!</p>
        </div>
      )}

      {/* Note Editor Modal - Simplified version */}
      {showNoteEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingNote ? 'Edit Note' : 'Create Note'}
              </h3>
              <button
                onClick={handleCloseNoteEditor}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSaveNote({
                  title: formData.get('title'),
                  content: formData.get('content'),
                  tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : []
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingNote?.title || ''}
                      className="input-primary"
                      placeholder="Note title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      name="content"
                      defaultValue={editingNote?.content || ''}
                      className="input-primary"
                      rows="8"
                      placeholder="Note content (supports markdown)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      defaultValue={editingNote?.tags?.join(', ') || ''}
                      className="input-primary"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseNoteEditor}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      {editingNote ? 'Update Note' : 'Create Note'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Team Members Component
const TeamMembers = ({ teamId, user }) => {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    if (!teamId) return;

    const unsubscribeMembers = watchTeamMembers(teamId, setMembers);
    const unsubscribeInvitations = watchTeamInvitations(teamId, setInvitations);

    return () => {
      unsubscribeMembers();
      unsubscribeInvitations();
    };
  }, [teamId]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <UsersIcon className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
        </div>
        <span className="text-sm text-gray-500">{members.length} members</span>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {member.userId.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">User {member.userId.slice(0, 8)}</p>
                <p className="text-xs text-gray-500 capitalize">{member.role}</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              Joined {new Date(member.joinedAt?.toDate?.() || member.joinedAt).toLocaleDateString()}
            </span>
          </div>
        ))}

        {invitations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Pending Invitations</h4>
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-yellow-600">@</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invitation.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{invitation.role}</p>
                  </div>
                </div>
                <span className="text-xs text-yellow-600">Pending</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main TeamSpaceDetail Component
const TeamSpaceDetail = ({ team, onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (!team?.id || !user) return;

    const checkUserRole = async () => {
      try {
        const role = await getUserTeamRole(team.id, user.uid);
        setUserRole(role);
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, [team?.id, user]);

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

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: CheckIcon },
    { id: 'notes', label: 'Notes', icon: NoteIcon },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'members', label: 'Members', icon: UsersIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTeamColorClasses(team.color)}`}>
                  <UsersIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                  {team.description && (
                    <p className="text-gray-600">{team.description}</p>
                  )}
                </div>
              </div>
            </div>
            {userRole && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Your role:</span>
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${getTeamColorClasses(team.color)}`}>
                  {userRole}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'tasks' && <TeamTasks teamId={team.id} user={user} />}
        {activeTab === 'notes' && <TeamNotes teamId={team.id} user={user} />}
        {activeTab === 'calendar' && (
          <TeamCalendar teamId={team.id} user={user} />
        )}
        {activeTab === 'members' && <TeamMembers teamId={team.id} user={user} />}
      </main>
    </div>
  );
};

export default TeamSpaceDetail;
