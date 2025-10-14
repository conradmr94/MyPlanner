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

const TagIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

// Editor mode icons
const BoldIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
  </svg>
);

const ItalicIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6L8 18M14 6l-2 12M6 18h6M10 6h6" />
  </svg>
);

const ListIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const NumberedListIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h.01M7 4h13M3 8h.01M7 8h13M3 12h.01M7 12h13M3 16h.01M7 16h13M3 20h.01M7 20h13" />
  </svg>
);

const QuoteIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const CodeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const UnderlineIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18h12M7 5v7a5 5 0 0010 0V5" />
  </svg>
);

const StrikethroughIcon = ({ className = 'w-4 h-4' }) => (
  <span className={`${className} font-bold text-base flex items-center justify-center`} style={{ textDecoration: 'line-through' }}>S</span>
);

const AlignLeftIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h12M3 12h18M3 16h12" />
  </svg>
);

const AlignCenterIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M3 12h18M7 16h10" />
  </svg>
);

const AlignRightIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M9 8h12M3 12h18M9 16h12" />
  </svg>
);

const LinkIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const HorizontalRuleIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const UndoIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const RedoIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
  </svg>
);

// Editor mode constants
const EDITOR_MODES = {
  PREVIEW: 'preview',
  MARKDOWN: 'markdown',
  EDITOR: 'editor'
};

// Formatting Toolbar Component
const FormattingToolbar = ({ onFormat, isActive, onHeaderChange, onColorChange, onLinkInsert }) => {
  // Button groups organized logically
  const buttonGroups = [
    {
      name: 'text',
      buttons: [
        { id: 'bold', icon: BoldIcon, label: 'Bold', shortcut: 'Ctrl+B' },
        { id: 'italic', icon: ItalicIcon, label: 'Italic', shortcut: 'Ctrl+I' },
        { id: 'underline', icon: UnderlineIcon, label: 'Underline', shortcut: 'Ctrl+U' },
        { id: 'strikethrough', icon: StrikethroughIcon, label: 'Strikethrough', shortcut: 'Ctrl+Shift+X' },
      ]
    },
    {
      name: 'alignment',
      buttons: [
        { id: 'alignLeft', icon: AlignLeftIcon, label: 'Align Left' },
        { id: 'alignCenter', icon: AlignCenterIcon, label: 'Align Center' },
        { id: 'alignRight', icon: AlignRightIcon, label: 'Align Right' },
      ]
    },
    {
      name: 'lists',
      buttons: [
        { id: 'ulist', icon: ListIcon, label: 'Bullet List', shortcut: 'Ctrl+Shift+8' },
        { id: 'olist', icon: NumberedListIcon, label: 'Numbered List', shortcut: 'Ctrl+Shift+7' },
      ]
    },
    {
      name: 'insert',
      buttons: [
        { id: 'code', icon: CodeIcon, label: 'Code', shortcut: 'Ctrl+`' },
        { id: 'quote', icon: QuoteIcon, label: 'Quote', shortcut: 'Ctrl+Shift+>' },
        { id: 'link', icon: LinkIcon, label: 'Insert Link', shortcut: 'Ctrl+K', onClick: 'link' },
        { id: 'hr', icon: HorizontalRuleIcon, label: 'Horizontal Rule' },
      ]
    },
    {
      name: 'history',
      buttons: [
        { id: 'undo', icon: UndoIcon, label: 'Undo', shortcut: 'Ctrl+Z' },
        { id: 'redo', icon: RedoIcon, label: 'Redo', shortcut: 'Ctrl+Y' },
      ]
    }
  ];

  const ToolbarButton = ({ id, icon: Icon, label, shortcut, onClick: customOnClick }) => (
    <button
      onClick={() => customOnClick === 'link' ? onLinkInsert() : onFormat(id)}
      className={`p-2 rounded-md hover:bg-white hover:shadow-sm transition-all duration-150 ${
        isActive(id) 
          ? 'bg-primary-100 text-primary-600 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900'
      }`}
      title={shortcut ? `${label} (${shortcut})` : label}
      type="button"
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const Separator = () => (
    <div className="w-px h-6 bg-gray-200 mx-1.5"></div>
  );

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100/50 border-b border-gray-200 shadow-sm">
      <div className="flex items-center flex-wrap gap-1 px-3 py-2.5">
        {/* Text Formatting */}
        <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 shadow-sm">
          {buttonGroups[0].buttons.map((btn) => (
            <ToolbarButton key={btn.id} {...btn} />
          ))}
        </div>

        <Separator />

        {/* Header Dropdown */}
        <div className="bg-white rounded-lg p-1 shadow-sm">
          <select
            onChange={(e) => onHeaderChange(e.target.value)}
            className="text-xs font-medium border-none bg-transparent px-2 py-1.5 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
            title="Header Style"
          >
            <option value="">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>

        <Separator />

        {/* Alignment */}
        <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 shadow-sm">
          {buttonGroups[1].buttons.map((btn) => (
            <ToolbarButton key={btn.id} {...btn} />
          ))}
        </div>

        <Separator />

        {/* Lists */}
        <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 shadow-sm">
          {buttonGroups[2].buttons.map((btn) => (
            <ToolbarButton key={btn.id} {...btn} />
          ))}
        </div>

        <Separator />

        {/* Insert */}
        <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 shadow-sm">
          {buttonGroups[3].buttons.map((btn) => (
            <ToolbarButton key={btn.id} {...btn} />
          ))}
        </div>

        <Separator />

        {/* Color Pickers */}
        <div className="flex items-center gap-1.5 bg-white rounded-lg p-1.5 shadow-sm">
          <div className="relative group">
            <input
              type="color"
              onChange={(e) => onColorChange('text', e.target.value)}
              className="w-7 h-7 rounded border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
              title="Text Color"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border border-gray-300 flex items-center justify-center">
              <span className="text-[8px] font-bold text-gray-600">A</span>
            </div>
          </div>
          <div className="relative group">
            <input
              type="color"
              onChange={(e) => onColorChange('background', e.target.value)}
              className="w-7 h-7 rounded border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
              title="Background Color"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border border-gray-300 flex items-center justify-center">
              <div className="w-2 h-1.5 bg-gray-600 rounded-sm"></div>
            </div>
          </div>
        </div>

        <Separator />

        {/* History */}
        <div className="flex items-center gap-0.5 bg-white rounded-lg p-1 shadow-sm">
          {buttonGroups[4].buttons.map((btn) => (
            <ToolbarButton key={btn.id} {...btn} />
          ))}
        </div>
      </div>
    </div>
  );
};

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
  const [editorMode, setEditorMode] = useState(EDITOR_MODES.EDITOR);

  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const editorRef = useRef(null);

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
    // Always start in editor mode when opening a note
    setEditorMode(EDITOR_MODES.EDITOR);
  }, [note, autoAssignTeamId]);

  // Focus title input when opening
  useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus();
      // Reset to editor mode when opening
      setEditorMode(EDITOR_MODES.EDITOR);
    }
  }, [isOpen]);

  // Initialize editor content when switching to editor mode
  useEffect(() => {
    if (editorMode === EDITOR_MODES.EDITOR && editorRef.current) {
      // Only set content if the editor is empty
      if (!editorRef.current.innerHTML || editorRef.current.innerHTML === '<br>') {
        editorRef.current.innerHTML = markdownToHtml(content) || '<br>';
      }
    }
  }, [editorMode, content]);

  // Update editor content when content changes (but not from user input)
  useEffect(() => {
    if (editorMode === EDITOR_MODES.EDITOR && editorRef.current) {
      // Only update if we're not currently editing (to avoid cursor issues)
      if (document.activeElement !== editorRef.current) {
        const currentHtml = editorRef.current.innerHTML;
        const newHtml = markdownToHtml(content);
        if (currentHtml !== newHtml) {
          editorRef.current.innerHTML = newHtml;
        }
      }
    }
  }, [content, editorMode]);

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

  // Convert markdown to HTML for rich text editing
  const markdownToHtml = (markdown) => {
    if (!markdown) return '';
    
    return markdown
      // Code blocks (must be before inline code)
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 rounded-lg p-4 my-3 overflow-x-auto"><code class="font-mono text-sm">$1</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2 text-gray-900">$1</h1>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 text-sm">$1</li>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary-400 pl-4 italic text-gray-600 my-3 py-2">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^---$/gm, '<hr class="my-4 border-gray-300">')
      .replace(/^___$/gm, '<hr class="my-4 border-gray-300">')
      .replace(/\n/g, '<br>');
  };

  // Convert HTML back to markdown
  const htmlToMarkdown = (html) => {
    if (!html) return '';
    
    return html
      // Code blocks (must be before inline code) - handle pre with code
      .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, '```$1```')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>') // Keep underline as HTML since markdown doesn't support it
      .replace(/<del>(.*?)<\/del>/g, '~~$1~~')
      .replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`')
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1')
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1')
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1')
      .replace(/<li[^>]*>• (.*?)<\/li>/g, '- $1')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '1. $1')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/g, '> $1')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
      .replace(/<hr[^>]*>/g, '---')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<div[^>]*>/g, '')
      .replace(/<\/div>/g, '')
      .replace(/<p[^>]*>/g, '')
      .replace(/<\/p>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  // Rich text editor formatting functions
  const applyFormatting = (format) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.focus();
      
      // Execute the formatting command
      switch (format) {
        case 'bold':
          document.execCommand('bold', false, null);
          break;
        case 'italic':
          document.execCommand('italic', false, null);
          break;
        case 'underline':
          document.execCommand('underline', false, null);
          break;
        case 'strikethrough':
          document.execCommand('strikeThrough', false, null);
          break;
        case 'code':
          // Create a code block (pre + code)
          const codeSelection = window.getSelection();
          if (codeSelection.rangeCount > 0) {
            const range = codeSelection.getRangeAt(0);
            const selectedText = range.toString();
            
            const pre = document.createElement('pre');
            pre.className = 'bg-gray-900 text-gray-100 rounded-lg p-4 my-3 overflow-x-auto';
            
            const code = document.createElement('code');
            code.className = 'font-mono text-sm';
            
            if (selectedText) {
              code.textContent = selectedText;
            } else {
              // Add placeholder text
              code.textContent = '// Type your code here...';
              code.setAttribute('data-placeholder', 'true');
              code.style.color = '#6b7280'; // gray-500
            }
            
            pre.appendChild(code);
            range.deleteContents();
            range.insertNode(pre);
            
            // Add line break after the code block
            const br = document.createElement('br');
            range.setStartAfter(pre);
            range.insertNode(br);
            
            // Position cursor inside the code block
            const newRange = document.createRange();
            newRange.setStart(code.firstChild || code, 0);
            newRange.setEnd(code.firstChild || code, code.textContent.length);
            codeSelection.removeAllRanges();
            codeSelection.addRange(newRange);
            
            // Add event listener to remove placeholder on focus/input
            code.addEventListener('focus', function removePlaceholder() {
              if (this.getAttribute('data-placeholder') === 'true') {
                this.textContent = '';
                this.removeAttribute('data-placeholder');
                this.style.color = '';
              }
            });
            
            code.addEventListener('click', function removePlaceholder() {
              if (this.getAttribute('data-placeholder') === 'true') {
                this.textContent = '';
                this.removeAttribute('data-placeholder');
                this.style.color = '';
                // Position cursor at the start
                const range = document.createRange();
                range.setStart(this, 0);
                range.setEnd(this, 0);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
              }
            });
          }
          break;
        case 'alignLeft':
          document.execCommand('justifyLeft', false, null);
          break;
        case 'alignCenter':
          document.execCommand('justifyCenter', false, null);
          break;
        case 'alignRight':
          document.execCommand('justifyRight', false, null);
          break;
        case 'quote':
          // Insert quote block
          const quoteSelection = window.getSelection();
          if (quoteSelection.rangeCount > 0) {
            const range = quoteSelection.getRangeAt(0);
            const selectedText = range.toString();
            
            const blockquote = document.createElement('blockquote');
            blockquote.className = 'border-l-4 border-primary-400 pl-4 italic text-gray-600 my-3 py-2';
            blockquote.contentEditable = 'true';
            
            if (selectedText) {
              blockquote.textContent = selectedText;
            } else {
              // Add placeholder text
              blockquote.textContent = 'Type your quote here...';
              blockquote.setAttribute('data-placeholder', 'true');
              blockquote.style.color = '#9ca3af'; // gray-400
            }
            
            range.deleteContents();
            range.insertNode(blockquote);
            
            // Add line break after the quote block
            const br = document.createElement('br');
            range.setStartAfter(blockquote);
            range.insertNode(br);
            
            // Position cursor inside the blockquote and select placeholder text
            const newRange = document.createRange();
            newRange.setStart(blockquote.firstChild || blockquote, 0);
            newRange.setEnd(blockquote.firstChild || blockquote, blockquote.textContent.length);
            quoteSelection.removeAllRanges();
            quoteSelection.addRange(newRange);
            
            // Add event listener to remove placeholder on focus/input
            blockquote.addEventListener('focus', function removePlaceholder() {
              if (this.getAttribute('data-placeholder') === 'true') {
                this.textContent = '';
                this.removeAttribute('data-placeholder');
                this.style.color = '';
              }
            });
            
            blockquote.addEventListener('click', function removePlaceholder() {
              if (this.getAttribute('data-placeholder') === 'true') {
                this.textContent = '';
                this.removeAttribute('data-placeholder');
                this.style.color = '';
                // Position cursor at the start
                const range = document.createRange();
                range.setStart(this, 0);
                range.setEnd(this, 0);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
              }
            });
          }
          break;
        case 'ulist':
          // Insert bullet list
          const ulSelection = window.getSelection();
          if (ulSelection.rangeCount > 0) {
            const range = ulSelection.getRangeAt(0);
            const selectedText = range.toString();
            
            const listItem = document.createElement('li');
            listItem.className = 'ml-4 text-sm';
            listItem.textContent = selectedText || '';
            
            range.deleteContents();
            range.insertNode(listItem);
            
            // Position cursor inside the list item
            range.setStart(listItem, 0);
            range.setEnd(listItem, 0);
            ulSelection.removeAllRanges();
            ulSelection.addRange(range);
          }
          break;
        case 'olist':
          // Insert numbered list
          const olSelection = window.getSelection();
          if (olSelection.rangeCount > 0) {
            const range = olSelection.getRangeAt(0);
            const selectedText = range.toString();
            
            const listItem = document.createElement('li');
            listItem.className = 'ml-4 text-sm';
            listItem.textContent = selectedText || '';
            
            range.deleteContents();
            range.insertNode(listItem);
            
            // Position cursor inside the list item
            range.setStart(listItem, 0);
            range.setEnd(listItem, 0);
            olSelection.removeAllRanges();
            olSelection.addRange(range);
          }
          break;
        case 'hr':
          // Insert horizontal rule
          const hrSelection = window.getSelection();
          if (hrSelection.rangeCount > 0) {
            const range = hrSelection.getRangeAt(0);
            const hr = document.createElement('hr');
            hr.className = 'my-4 border-gray-300';
            range.insertNode(hr);
            
            // Position cursor after the hr
            range.setStartAfter(hr);
            range.setEndAfter(hr);
            hrSelection.removeAllRanges();
            hrSelection.addRange(range);
          }
          break;
        case 'undo':
          document.execCommand('undo', false, null);
          break;
        case 'redo':
          document.execCommand('redo', false, null);
          break;
        default:
          return;
      }
      
      // Update content after formatting
      updateEditorContent();
    }
  };

  const isFormatActive = (format) => {
    if (!editorRef.current) return false;
    
    // Check if the current selection has the formatting
    switch (format) {
      case 'bold':
        return document.queryCommandState('bold');
      case 'italic':
        return document.queryCommandState('italic');
      case 'underline':
        return document.queryCommandState('underline');
      case 'strikethrough':
        return document.queryCommandState('strikeThrough');
      case 'alignLeft':
        return document.queryCommandState('justifyLeft');
      case 'alignCenter':
        return document.queryCommandState('justifyCenter');
      case 'alignRight':
        return document.queryCommandState('justifyRight');
      case 'code':
        // Check if selection is within code tags
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const container = range.commonAncestorContainer;
          return container.parentElement?.tagName === 'CODE' || 
                 container.parentElement?.classList?.contains('code');
        }
        return false;
      default:
        return false;
    }
  };

  // Header change handler
  const handleHeaderChange = (headerType) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.focus();
      
      if (headerType) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedText = range.toString();
          
          const headerElement = document.createElement(headerType);
          const classes = {
            'h1': 'text-2xl font-bold mt-4 mb-2 text-gray-900',
            'h2': 'text-xl font-semibold mt-4 mb-2 text-gray-900',
            'h3': 'text-lg font-semibold mt-4 mb-2 text-gray-900'
          };
          headerElement.className = classes[headerType];
          headerElement.textContent = selectedText || '';
          
          range.deleteContents();
          range.insertNode(headerElement);
          
          // Position cursor inside the header
          range.setStart(headerElement, 0);
          range.setEnd(headerElement, 0);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      updateEditorContent();
    }
  };

  // Color change handler
  const handleColorChange = (type, color) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.focus();
      
      if (type === 'text') {
        document.execCommand('foreColor', false, color);
      } else if (type === 'background') {
        document.execCommand('backColor', false, color);
      }
      updateEditorContent();
    }
  };

  // Link insertion handler
  const handleLinkInsert = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const text = prompt('Enter link text (optional):', url);
      if (text !== null) {
        if (editorRef.current) {
          const editor = editorRef.current;
          editor.focus();
          
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const linkElement = document.createElement('a');
            linkElement.href = url;
            linkElement.textContent = text || url;
            linkElement.className = 'text-blue-600 hover:text-blue-800 underline';
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            
            range.deleteContents();
            range.insertNode(linkElement);
            
            // Position cursor after the link
            range.setStartAfter(linkElement);
            range.setEndAfter(linkElement);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          updateEditorContent();
        }
      }
    }
  };

  const updateEditorContent = (e) => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const markdown = htmlToMarkdown(html);
      // Only update if the content has actually changed
      if (markdown !== content) {
        setContent(markdown);
      }
    }
  };

  const handleEditorKeyDown = (e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          applyFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormatting('italic');
          break;
        case 'u':
          e.preventDefault();
          applyFormatting('underline');
          break;
        case 'x':
          if (e.shiftKey) {
            e.preventDefault();
            applyFormatting('strikethrough');
          }
          break;
        case '`':
          e.preventDefault();
          applyFormatting('code');
          break;
        case 'k':
          e.preventDefault();
          handleLinkInsert();
          break;
        case '>':
          if (e.shiftKey) {
            e.preventDefault();
            applyFormatting('quote');
          }
          break;
        case '8':
          if (e.shiftKey) {
            e.preventDefault();
            applyFormatting('ulist');
          }
          break;
        case '7':
          if (e.shiftKey) {
            e.preventDefault();
            applyFormatting('olist');
          }
          break;
        case 'z':
          e.preventDefault();
          applyFormatting('undo');
          break;
        case 'y':
          e.preventDefault();
          applyFormatting('redo');
          break;
        default:
          break;
      }
    }
  };

  const formatMarkdown = (text) => {
    if (!text) return '';
    
    // Enhanced markdown formatting
    return text
      // Code blocks (must be before inline code)
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 rounded-lg p-4 my-3 overflow-x-auto"><code class="font-mono text-sm">$1</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2 text-gray-900">$1</h1>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 text-sm">$1</li>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary-400 pl-4 italic text-gray-600 my-3 py-2">$1</blockquote>')
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
          <div className="flex-1 flex flex-col">
            {/* Mode Selector */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-sm text-gray-600">Content</span>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setEditorMode(EDITOR_MODES.EDITOR)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    editorMode === EDITOR_MODES.EDITOR
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ✏️ Editor
                </button>
                <button
                  onClick={() => setEditorMode(EDITOR_MODES.MARKDOWN)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    editorMode === EDITOR_MODES.MARKDOWN
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📝 Markdown
                </button>
                <button
                  onClick={() => setEditorMode(EDITOR_MODES.PREVIEW)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    editorMode === EDITOR_MODES.PREVIEW
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  👁️ Preview
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 flex flex-col">
              {editorMode === EDITOR_MODES.EDITOR && (
                <>
                  <FormattingToolbar 
                    onFormat={applyFormatting}
                    isActive={isFormatActive}
                    onHeaderChange={handleHeaderChange}
                    onColorChange={handleColorChange}
                    onLinkInsert={handleLinkInsert}
                  />
                  <div className="flex-1 p-4">
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={updateEditorContent}
                      onKeyDown={handleEditorKeyDown}
                      onKeyPress={handleKeyPress}
                      onFocus={() => {
                        // Ensure the editor has content when focused
                        if (!editorRef.current.innerHTML || editorRef.current.innerHTML === '<br>') {
                          editorRef.current.innerHTML = markdownToHtml(content) || '<br>';
                        }
                      }}
                      className="w-full h-full resize-none border-none outline-none text-gray-900 leading-relaxed prose prose-sm max-w-none focus:outline-none"
                      style={{ minHeight: '200px' }}
                      suppressContentEditableWarning={true}
                    />
                  </div>
                </>
              )}

              {editorMode === EDITOR_MODES.MARKDOWN && (
                <div className="flex-1 p-4">
                  <textarea
                    ref={contentRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleContentKeyDown}
                    onKeyPress={handleKeyPress}
                    placeholder="Start writing your note... (Supports markdown: **bold**, *italic*, `code`, # headers, - lists, > quotes, [links](url))"
                    className="w-full h-full resize-none border-none outline-none placeholder-gray-400 text-gray-900 leading-relaxed font-mono text-sm"
                  />
                </div>
              )}

              {editorMode === EDITOR_MODES.PREVIEW && (
                <div className="flex-1 p-4">
                  <div 
                    className="w-full h-full overflow-y-auto prose prose-sm max-w-none text-gray-900 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMarkdown(content) 
                    }}
                  />
                </div>
              )}
            </div>
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

