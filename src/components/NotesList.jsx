// src/components/NotesList.jsx
import React, { useState, useMemo } from 'react';
import { deleteNote, togglePinNote } from '../data/notes';

// Simple SVG icon components
const PinIcon = ({ className = 'w-4 h-4', filled = false }) => (
  <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const EditIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const TagIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

export default function NotesList({ 
  notes, 
  onEditNote, 
  onDeleteNote, 
  searchQuery = '', 
  filterTag = '',
  onFilterTag,
  user 
}) {
  const [deletingId, setDeletingId] = useState(null);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by tag
    if (filterTag) {
      filtered = filtered.filter(note => 
        note.tags.includes(filterTag)
      );
    }

    // Sort: pinned first, then by updatedAt
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt?.toDate?.() || b.updatedAt) - new Date(a.updatedAt?.toDate?.() || a.updatedAt);
    });
  }, [notes, searchQuery, filterTag]);

  // Get all unique tags for filtering
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  const handleDelete = async (id) => {
    if (!user) {
      onDeleteNote(id);
      return;
    }

    setDeletingId(id);
    try {
      await deleteNote(user.uid, id);
    } catch (err) {
      console.error('deleteNote failed', err);
      // Fallback to local state
      onDeleteNote(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePin = async (id, isPinned) => {
    if (!user) return;

    try {
      await togglePinNote(user.uid, id, !isPinned);
    } catch (err) {
      console.error('togglePinNote failed', err);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  const formatMarkdown = (text) => {
    if (!text) return '';
    
    // Simple markdown formatting for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>')
      .replace(/^### (.*$)/gm, '<h3 class="text-sm font-semibold mt-2 mb-1">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-base font-semibold mt-2 mb-1">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold mt-2 mb-1">$1</h1>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/\n/g, '<br>');
  };

  const truncateContent = (content, maxLines = 3) => {
    if (!content) return '';
    const lines = content.split('\n');
    if (lines.length <= maxLines) return content;
    return lines.slice(0, maxLines).join('\n') + '...';
  };

  return (
    <div className="space-y-4">
      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => onFilterTag('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !filterTag 
                ? 'bg-primary-100 text-primary-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => onFilterTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterTag === tag 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <EditIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium mb-2">No notes found</p>
          <p className="text-sm">
            {searchQuery || filterTag 
              ? 'Try adjusting your search or filter' 
              : 'Create your first note to get started!'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note, index) => (
            <div
              key={note.id}
              className={`group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-primary-300 transition-all duration-200 cursor-pointer ${
                note.isPinned ? 'ring-2 ring-primary-200 bg-primary-50' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => onEditNote(note)}
              title="Click to open note"
            >
              {/* Pin indicator */}
              {note.isPinned && (
                <div className="absolute top-2 right-2">
                  <PinIcon className="w-4 h-4 text-primary-600" filled />
                </div>
              )}

              {/* Note header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 pr-8">
                  <h3 className="font-medium text-gray-900 text-sm leading-tight">
                    {note.title || 'Untitled Note'}
                  </h3>
                  {/* Template note indicator */}
                  {note.id === 1 && note.tags?.includes('demo') && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Template
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(note.id, note.isPinned);
                    }}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    title={note.isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    <PinIcon className="w-4 h-4" filled={note.isPinned} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditNote(note);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit note"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  {/* Hide delete button for template note */}
                  {!(note.id === 1 && note.tags?.includes('demo')) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      disabled={deletingId === note.id}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete note"
                    >
                      {deletingId === note.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Note content preview - first few lines only */}
              {note.content && (
                <div 
                  className="text-gray-600 text-sm mb-3 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdown(truncateContent(note.content)) 
                  }}
                />
              )}

              {/* Note footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(note.updatedAt)}</span>
                <div className="flex items-center space-x-2">
                  {note.linkedTasks && note.linkedTasks.length > 0 && (
                    <span className="text-primary-600">
                      {note.linkedTasks.length} linked task{note.linkedTasks.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    Click to open
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
