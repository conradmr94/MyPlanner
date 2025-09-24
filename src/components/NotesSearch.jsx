// src/components/NotesSearch.jsx
import React, { useState } from 'react';

const SearchIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ClearIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FilterIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

export default function NotesSearch({ 
  searchQuery, 
  onSearchChange, 
  filterTag, 
  onFilterChange,
  allTags = [],
  totalNotes = 0,
  filteredCount = 0 
}) {
  const [showFilters, setShowFilters] = useState(false);

  const handleClearSearch = () => {
    onSearchChange('');
  };


  const hasActiveFilters = searchQuery.trim() || filterTag;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes..."
          className="input-primary pl-10 pr-10 w-full text-sm"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ClearIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FilterIcon className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </button>

        {/* Results count */}
        <div className="text-sm text-gray-500">
          {hasActiveFilters ? (
            <span>
              {filteredCount} of {totalNotes} notes
            </span>
          ) : (
            <span>{totalNotes} notes</span>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by tag
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onFilterChange('')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    !filterTag 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  All Tags
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => onFilterChange(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filterTag === tag 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  onSearchChange('');
                  onFilterChange('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Search Suggestions */}
      {!searchQuery && !filterTag && (
        <div className="text-xs text-gray-500 space-y-1">
          <div className="font-medium">Quick search tips:</div>
          <div>• Search by title, content, or tags</div>
          <div>• Use quotes for exact phrases: "meeting notes"</div>
          <div>• Filter by tags to find related notes</div>
        </div>
      )}
    </div>
  );
}

