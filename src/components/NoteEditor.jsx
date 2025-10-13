// src/components/NoteEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createNote, updateNote } from '../data/notes';

// Simple SVG icon components
const SaveIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const CloseIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const LinkIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const TagIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

export default function NoteEditor({ 
  note = null, 
  isOpen, 
  onClose, 
  onSave, 
  user,
  tasks = [],
  teams = [],
  autoAssignTeamId = null
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [linkedTasks, setLinkedTasks] = useState([]);
  const [teamId, setTeamId] = useState(autoAssignTeamId || null);
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLinkTasks, setShowLinkTasks] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const titleRef = useRef(null);
  const contentRef = useRef(null);

  // Initialize form when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
      setLinkedTasks(note.linkedTasks || []);
      setTeamId(note.teamId || null);
      setIsPinned(note.isPinned || false);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setLinkedTasks([]);
      setTeamId(autoAssignTeamId || null);
      setIsPinned(false);
    }
    // Always start in edit mode when opening a note
    setShowPreview(false);
  }, [note, autoAssignTeamId]);

  // Focus title input when opening
  useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus();
      // Reset to edit mode when opening
      setShowPreview(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    setSaving(true);
    try {
      const noteData = {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        tags,
        linkedTasks,
        teamId: teamId ? Number(teamId) : null,
        isPinned,
      };

      if (note) {
        // Update existing note
        if (user) {
          await updateNote(user.uid, note.id, noteData);
        }
        onSave({ ...note, ...noteData });
      } else {
        // Create new note
        if (user) {
          const newNote = await createNote(user.uid, noteData);
          onSave({ id: newNote.id, ...noteData });
        } else {
          // Local fallback
          onSave({ 
            id: Date.now(), 
            ...noteData,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      onClose();
    } catch (err) {
      console.error('Save note failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleContentKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const formatMarkdown = (text) => {
    if (!text) return '';
    
    // Enhanced markdown formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2 text-gray-900">$1</h1>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 text-sm">$1</li>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-white rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-lg transition-colors ${
                isPinned 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={isPinned ? 'Unpin note' : 'Pin note'}
            >
              <svg className="w-5 h-5" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Title */}
          <div className="p-6 pb-0">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Note title..."
              className="w-full text-2xl font-semibold border-none outline-none placeholder-gray-400"
            />
          </div>

          {/* Tags */}
          <div className="px-6 py-3 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Tags:</span>
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center space-x-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag..."
                  className="text-sm border-none outline-none placeholder-gray-400 w-20"
                />
                <button
                  onClick={handleAddTag}
                  className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <TagIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Content</span>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                {showPreview ? '✏️ Edit' : '👁️ Preview'}
              </button>
            </div>
            
            {showPreview ? (
              <div 
                className="w-full h-full overflow-y-auto prose prose-sm max-w-none text-gray-900 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: formatMarkdown(content) 
                }}
              />
            ) : (
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleContentKeyDown}
                onKeyPress={handleKeyPress}
                placeholder="Start writing your note... (Supports markdown: **bold**, *italic*, `code`, # headers, - lists, > quotes, [links](url))"
                className="w-full h-full resize-none border-none outline-none placeholder-gray-400 text-gray-900 leading-relaxed"
              />
            )}
          </div>

          {/* Team Assignment */}
          <div className="px-6 py-3 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Assignment
            </label>
            <select
              value={teamId || ''}
              onChange={(e) => setTeamId(e.target.value || null)}
              className="input-primary text-sm"
            >
              <option value="">No team (Personal note)</option>
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
            <p className="text-xs text-gray-500 mt-1">
              Assign this note to a team to share it with team members
            </p>
          </div>

          {/* Task Linking */}
          {tasks.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowLinkTasks(!showLinkTasks)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>
                    {linkedTasks.length > 0 
                      ? `${linkedTasks.length} task${linkedTasks.length !== 1 ? 's' : ''} linked`
                      : 'Link to tasks'
                    }
                  </span>
                </button>
              </div>
              
              {showLinkTasks && (
                <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                  {tasks.filter(task => !task.completed).map(task => (
                    <label key={task.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={linkedTasks.includes(task.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLinkedTasks([...linkedTasks, task.id]);
                          } else {
                            setLinkedTasks(linkedTasks.filter(id => id !== task.id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700">{task.text}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-xs text-gray-500">
            Press Ctrl+Enter to save, Esc to close
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (!title.trim() && !content.trim())}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  <span>{note ? 'Update' : 'Create'} Note</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

