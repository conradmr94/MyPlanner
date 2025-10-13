import React, { useEffect, useMemo, useState } from 'react';
import CueSettings from './components/CueSettings';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import NotesSearch from './components/NotesSearch';
import Calendar from './components/Calendar';
import AuthModal from './components/AuthModal';
import TeamSpaces from './components/TeamSpaces';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { derivePriority } from './nlp/priority';
import { loadUserData, saveUserData, getDemoData } from './lib/userData';

// 🔗 Firebase + data-layer helpers
import { watchOpenTasks } from './data/tasks';
import { watchNotes } from './data/notes';

// Simple SVG icon components (accept className)
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


// --- LLM classifier helper (Ollama-backed API) ---------------------------------
async function classifyWithLLM(text, { timeoutMs = 5000 } = {}) {
  console.log('classifyWithLLM', text);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch('http://localhost:3001/classify_task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: ctrl.signal,
    });
    clearTimeout(t);

    console.log('LLM resp', resp);

    if (!resp.ok) throw new Error(`Bad status ${resp.status}`);
    const { priority } = await resp.json();

    console.log('LLM priority', priority);

    if (priority === 'high' || priority === 'medium' || priority === 'low') return priority;
    return null;
  } catch (err){
    console.log('LLM error', err);
    clearTimeout(t);
    return null; // fall back if API fails/times out
  }
}

// Main App Content Component
const AppContent = () => {
  const { user, requireAuth, logout, setShowAuthModal, setAuthMode } = useAuth();

  // Navigation state
  const [currentView, setCurrentView] = useState('main'); // 'main'

  // Teams state
  const [teams, setTeams] = useState([]);

  // Initialize with demo data
  const [tasks, setTasks] = useState([]);
  
  // Debug: Log tasks state changes
  useEffect(() => {
    console.log('Tasks state changed:', tasks);
    console.log('Tasks length:', tasks.length);
  }, [tasks]);

  const [newTask, setNewTask] = useState('');
  const [showCueSettings, setShowCueSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // NEW: Async preview state
  const [preview, setPreview] = useState(null);
  
  // Model warmup state
  const [modelLoading, setModelLoading] = useState(true);
  const [modelReady, setModelReady] = useState(false);

  // Task editing state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState('');

  // Notes state
  const [notes, setNotes] = useState([]);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [notesFilterTag, setNotesFilterTag] = useState('');

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      // Load user-specific data using Firebase UID
      const userId = user.uid || user.id; // Support both Firebase UID and legacy ID
      const userTasks = loadUserData(userId, 'tasks', []);
      const userNotes = loadUserData(userId, 'notes', []);
      const userTeams = loadUserData(userId, 'teams', []);
      
      // Debug: Log user data loading
      console.log('Loading data for user:', userId);
      console.log('Loaded tasks from localStorage:', userTasks);
      console.log('Loaded notes from localStorage:', userNotes);
      console.log('Loaded teams from localStorage:', userTeams);
      
      // Always include the template note for all users
      const demoData = getDemoData();
      const templateNote = demoData.notes[0]; // Get the welcome note
      
      // Check if template note already exists in user's notes
      const hasTemplateNote = userNotes.some(note => note.id === templateNote.id);
      
      setTasks(userTasks);
      setNotes(hasTemplateNote ? userNotes : [templateNote, ...userNotes]);
      setTeams(userTeams);
    } else {
      // Load demo data for non-authenticated users
      const demoData = getDemoData();
      console.log('Loading demo data for non-authenticated user');
      console.log('Demo tasks:', demoData.tasks);
      setTasks(demoData.tasks);
      setNotes(demoData.notes);
      setTeams([]);
    }
  }, [user]);

  // 🔄 Subscribe to Firestore tasks when signed in
  useEffect(() => {
    if (!user) return; // keep demo data when signed out
    console.log('Setting up Firestore tasks subscription for user:', user.uid);
    const unsub = watchOpenTasks(user.uid, (docs) => {
      console.log('Received tasks from Firestore:', docs);
      // Map Firestore docs → UI shape
      const mapped = docs.map((d) => ({
        id: d.id,                           // Firestore doc id
        text: d.title || '',                // UI expects 'text'
        completed: d.status === 'done',     // normalize
        priority: d.priority || 'medium',
        meta: {
          score: d?.nlp?.score ?? 0,
          rationale: d?.nlp?.rationale ?? '',
          due: d?.dueAt ?? null,
        },
      }));
      console.log('Mapped Firestore tasks:', mapped);
      setTasks(mapped);
    });
    return () => unsub && unsub();
  }, [user]);

  // 🔄 Subscribe to Firestore notes when signed in
  useEffect(() => {
    if (!user) return; // keep demo data when signed out
    const unsub = watchNotes(user.uid, (docs) => {
      setNotes(docs);
    });
    return () => unsub && unsub();
  }, [user]);

  // Save teams when they change
  useEffect(() => {
    if (user && teams.length >= 0) {
      const userId = user.uid || user.id;
      saveUserData(userId, 'teams', teams);
    }
  }, [teams, user]);

  // Warm up the Ollama model when the app starts
  useEffect(() => {
    const warmupModel = async () => {
      try {
        setModelLoading(true);
        setModelReady(false);
        const response = await fetch('http://localhost:3001/warmup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          setModelReady(true);
          // Show success message briefly
          setTimeout(() => setModelReady(false), 3000);
        } else {
          console.warn('Model warmup failed, but continuing...');
        }
      } catch (error) {
        console.warn('Model warmup error:', error.message);
      } finally {
        setModelLoading(false);
      }
    };
    warmupModel();
  }, []);

  // Live preview (debounced)
  useEffect(() => {
    let cancelled = false;
    if (!newTask.trim()) {
      setPreview(null);
      return;
    }
    // Don't call API for very short text (less than 3 characters)
    if (newTask.trim().length < 3) {
      setPreview(null);
      return;
    }
    // Debounce the NLP call - only call after user stops typing for 500ms
    const timeoutId = setTimeout(async () => {
      try {
        const p = await derivePriority(newTask);
        if (!cancelled) setPreview(p);
      } catch {
        if (!cancelled) setPreview(null);
      }
    }, 500);
    
    return () => { 
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [newTask]);

  const addTask = async (e) => {
    e.preventDefault();
    const text = newTask.trim();
    if (!text || submitting) return;
    
    // Require authentication for creating tasks
    if (!requireAuth('create task')) {
      return;
    }
    
    setSubmitting(true);

    // Always compute local signals (fast, offline, due-date aware)
    const local = await derivePriority(text);

    // Ask LLM for final label; fall back to local label on failure/timeout
    const llmPriority = await classifyWithLLM(text);
    const finalLabel = llmPriority || local.label;

    // Add task to local state
    const taskToAdd = {
      id: Date.now(),
      text: local.cleanText,
      completed: false,
      priority: finalLabel,
      manualPriority: false, // Track if priority was manually set
      meta: {
        score: local.score ?? 0,
        rationale: local.rationale,
        due: local.due ? local.due.toISOString() : null,
      },
    };
    
    setTasks(prev => [...prev, taskToAdd]);
    
    // Save to user data if authenticated
    if (user) {
      const userId = user.uid || user.id; // Support both Firebase UID and legacy ID
      const updatedTasks = [...tasks, taskToAdd];
      saveUserData(userId, 'tasks', updatedTasks);
    }

    setNewTask('');
    setSubmitting(false);
  };

  const toggleTask = async (id) => {
    // Require authentication for modifying tasks
    if (!requireAuth('modify task')) {
      return;
    }
    
    const t = tasks.find((x) => x.id === id);
    const nextDone = !(t?.completed);
    
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: nextDone } : task))
    );
    
    // Save to user data if authenticated
    if (user) {
      const userId = user.uid || user.id; // Support both Firebase UID and legacy ID
      const updatedTasks = tasks.map((task) => 
        task.id === id ? { ...task, completed: nextDone } : task
      );
      saveUserData(userId, 'tasks', updatedTasks);
    }
  };

  const deleteTask = async (id) => {
    // Require authentication for deleting tasks
    if (!requireAuth('delete task')) {
      return;
    }
    
    setTasks((prev) => prev.filter((task) => task.id !== id));
    
    // Save to user data if authenticated
    if (user) {
      const userId = user.uid || user.id; // Support both Firebase UID and legacy ID
      const updatedTasks = tasks.filter((task) => task.id !== id);
      saveUserData(userId, 'tasks', updatedTasks);
    }
  };

  const updateTask = async (id, updates) => {
    // Require authentication for updating tasks
    if (!requireAuth('update task')) {
      return;
    }
    
    setTasks((prev) => 
      prev.map((task) => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
    
    // Save to user data if authenticated
    if (user) {
      const userId = user.uid || user.id; // Support both Firebase UID and legacy ID
      const updatedTasks = tasks.map((task) => 
        task.id === id ? { ...task, ...updates } : task
      );
      saveUserData(userId, 'tasks', updatedTasks);
    }
  };

  const assignTaskToTeam = async (taskId, teamId) => {
    // Require authentication for assigning tasks
    if (!requireAuth('assign task to team')) {
      return;
    }
    
    // Convert teamId to number if it exists (dropdown returns string)
    const numericTeamId = teamId ? Number(teamId) : null;
    updateTask(taskId, { teamId: numericTeamId });
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

  const changePriority = (taskId, newPriority) => {
    updateTask(taskId, { 
      priority: newPriority,
      manualPriority: true // Mark as manually set
    });
  };

  // 📝 Notes handlers
  const handleCreateNote = () => {
    // Require authentication for creating notes
    if (!requireAuth('create note')) {
      return;
    }
    
    setEditingNote(null);
    setShowNoteEditor(true);
  };

  const handleEditNote = (note) => {
    // Require authentication for editing notes
    if (!requireAuth('edit note')) {
      return;
    }
    
    setEditingNote(note);
    setShowNoteEditor(true);
  };

  const handleSaveNote = (noteData) => {
    if (editingNote) {
      // Update existing note
      const updatedNotes = notes.map(note => 
        note.id === editingNote.id ? { ...note, ...noteData } : note
      );
      setNotes(updatedNotes);
      
      // Save to user data if authenticated (excluding template note)
      if (user) {
        const userId = user.uid || user.id; // Support both Firebase UID and legacy ID
        const demoData = getDemoData();
        const templateNoteId = demoData.notes[0].id;
        const userNotes = updatedNotes.filter(note => note.id !== templateNoteId);
        saveUserData(userId, 'notes', userNotes);
      }
    } else {
      // Create new note
      const newNotes = [noteData, ...notes];
      setNotes(newNotes);
      
      // Save to user data if authenticated (excluding template note)
      if (user) {
        const userId = user.uid || user.id; // Support both Firebase UID and legacy ID
        const demoData = getDemoData();
        const templateNoteId = demoData.notes[0].id;
        const userNotes = newNotes.filter(note => note.id !== templateNoteId);
        saveUserData(userId, 'notes', userNotes);
      }
    }
  };

  const handleDeleteNote = (id) => {
    // Require authentication for deleting notes
    if (!requireAuth('delete note')) {
      return;
    }
    
    // Prevent deletion of template note
    const demoData = getDemoData();
    const templateNoteId = demoData.notes[0].id;
    if (id === templateNoteId) {
      alert('This is a template note and cannot be deleted. It helps you learn how to use the notes feature!');
      return;
    }
    
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    // Save to user data if authenticated (excluding template note)
    if (user) {
      const userId = user.uid || user.id; // Support both Firebase UID and legacy ID
      const userNotes = updatedNotes.filter(note => note.id !== templateNoteId);
      saveUserData(userId, 'notes', userNotes);
    }
  };

  const handleCloseNoteEditor = () => {
    setShowNoteEditor(false);
    setEditingNote(null);
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

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  // Navigation handlers
  const handleShowMain = () => {
    setCurrentView('main');
  };

  // Optional: sort by score (desc), completed at bottom
  const visibleTasks = useMemo(() => {
    const active = tasks
      .filter((t) => !t.completed)
      .sort((a, b) => (b.meta?.score ?? 0) - (a.meta?.score ?? 0));
    const done = tasks.filter((t) => t.completed);
    return [...active, ...done];
  }, [tasks]);

  // 📝 Notes computed values
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filter by search query
    if (notesSearchQuery.trim()) {
      const query = notesSearchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by tag
    if (notesFilterTag) {
      filtered = filtered.filter(note => 
        note.tags.includes(notesFilterTag)
      );
    }

    // Sort: pinned first, then by updatedAt
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt?.toDate?.() || b.updatedAt) - new Date(a.updatedAt?.toDate?.() || a.updatedAt);
    });
  }, [notes, notesSearchQuery, notesFilterTag]);

  // Get all unique tags for filtering
  const allNoteTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[95vw] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gradient">MyPlanner</h1>
                <p className="text-sm text-gray-600">Your unified productivity platform</p>
              </div>
              {totalTasks > 0 && (
                <div className="hidden sm:flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      completedTasks === totalTasks ? 'bg-green-400' : 'bg-blue-400'
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">{completedTasks}/{totalTasks} completed</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {/* Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShowMain}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    currentView === 'main' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  My Planner
                </button>
                <button
                  onClick={() => setCurrentView('teamspaces')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    currentView === 'teamspaces' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Team Spaces
                </button>
              </div>

              {/* 🔐 Auth UI */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Hi, {user.name || user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                    title="Sign out"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Demo Mode - <button 
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="text-primary-600 hover:text-primary-700 underline cursor-pointer"
                  >
                    Sign up to save your data
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowCueSettings(true)}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                title="Manage priority cues"
              >
                Priority Cues
              </button>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">v1.0 Dev</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentView === 'main' && (
        <main className="max-w-[95vw] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <div className="lg:col-span-1">
            <div className="card animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {tasks.filter((t) => !t.completed).length} remaining
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

              {/* Model Loading Indicator */}
              {modelLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-700">Preparing AI model...</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">This may take a few moments on first use</p>
                </div>
              )}

              {/* Model Ready Indicator */}
              {modelReady && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-green-700">AI model ready!</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">You can now add tasks with AI-powered priority classification</p>
                </div>
              )}

              {/* Add Task Form */}
              <form onSubmit={addTask} className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add task... (e.g., 'ASAP send report by 5pm', 'low prio maybe clean desk')"
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

                {/* Live NLP Preview */}
                {preview && (
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full capitalize ${
                        preview.label === 'high'
                          ? 'bg-red-100 text-red-800'
                          : preview.label === 'medium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {preview.label} priority
                      </span>
                      <span className="text-gray-500">
                        {preview.rationale}
                        {preview.due && (
                          <>
                            {' · '}
                            Due: {new Date(preview.due).toLocaleString()}
                          </>
                        )}
                      </span>
                    </div>
                    <span className="text-gray-400">
                      score {typeof preview.score === 'number' ? preview.score.toFixed(2) : '...'}
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  💡 Try cues like <code>ASAP</code>, <code>EOD</code>, <code>low prio</code>, or add your own in{' '}
                  <button
                    type="button"
                    className="underline hover:text-gray-700"
                    onClick={() => setShowCueSettings(true)}
                  >
                    Priority Cues
                  </button>
                  .
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

                      {/* Team Assignment */}
                      {editingTaskId !== task.id && (
                        <div className="mt-2">
                          <select
                            value={task.teamId || ''}
                            onChange={(e) => assignTaskToTeam(task.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">No team assigned</option>
                            {teams.length === 0 ? (
                              <option value="" disabled>No teams available - create one in Team Spaces</option>
                            ) : (
                              teams.map(team => (
                                <option key={team.id} value={team.id}>
                                  {team.name}
                                </option>
                              ))
                            )}
                          </select>
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

              {tasks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckIcon className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No tasks yet</p>
                  <p className="text-sm">Add your first task above to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Calendar />
            </div>
          </div>

          {/* Notes Section */}
          <div className="lg:col-span-1">
            <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <NoteIcon className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
                </div>
                <button
                  onClick={handleCreateNote}
                  className="btn-primary px-3 py-1.5 text-sm"
                  title="Create new note"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Notes Search */}
              <div className="mb-6">
                <NotesSearch
                  searchQuery={notesSearchQuery}
                  onSearchChange={setNotesSearchQuery}
                  filterTag={notesFilterTag}
                  onFilterChange={setNotesFilterTag}
                  allTags={allNoteTags}
                  totalNotes={notes.length}
                  filteredCount={filteredNotes.length}
                />
              </div>

              {/* Notes List */}
              <div className="max-h-96 overflow-y-auto">
                <NotesList
                  notes={filteredNotes}
                  onEditNote={handleEditNote}
                  onDeleteNote={handleDeleteNote}
                  searchQuery={notesSearchQuery}
                  filterTag={notesFilterTag}
                  onFilterTag={setNotesFilterTag}
                  user={user}
                />
              </div>
            </div>
          </div>
        </div>


        {/* Development Progress */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
            <h3 className="text-lg font-semibold text-primary-900 mb-3">🚀 Development Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">Task Management</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">Natural Language Input</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Enhanced</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">Calendar Integration</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Week 5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">Notes System</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Complete</span>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">💡 Try These Features</h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Type "ASAP send report by 5pm" and watch the preview update</li>
              <li>• Add your own cue like "blocker" in <em>Priority Cues</em></li>
              <li>• Use "low prio" / "maybe" to de-emphasize</li>
              <li>• Complete tasks to see progress tracking</li>
              <li>• Create notes with **bold**, *italic*, `code`, # headers, and lists</li>
              <li>• Use markdown formatting: &gt; quotes, [links](url), numbered lists</li>
              <li>• Click on any note preview to open it in the editor</li>
              <li>• Pin important notes and organize with tags</li>
              <li>• Link notes to tasks for better organization</li>
              <li>• Search and filter notes by content or tags</li>
            </ul>
          </div>
        </div>
        </main>
      )}

      {/* Team Spaces View */}
      {currentView === 'teamspaces' && (
        <TeamSpaces 
          teams={teams} 
          setTeams={setTeams}
          tasks={tasks}
          setTasks={setTasks}
          addTask={addTask}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          updateTask={updateTask}
          changePriority={changePriority}
          user={user}
        />
      )}

      {/* Priority Cues modal */}
      <CueSettings isOpen={showCueSettings} onClose={() => setShowCueSettings(false)} />

      {/* Note Editor modal */}
      <NoteEditor
        note={editingNote}
        isOpen={showNoteEditor}
        onClose={handleCloseNoteEditor}
        onSave={handleSaveNote}
        user={user}
        tasks={tasks}
      />

      {/* Auth Modal */}
      <AuthModal />

      
    </div>
  );
};

// Main App Component with Auth Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
