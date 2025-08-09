import React, { useState } from 'react';

// Simple SVG icon components
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const NoteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

function App() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Welcome to MyPlanner! 🎉', completed: false, priority: 'high' },
    { id: 2, text: 'Try adding a new task below', completed: true, priority: 'medium' },
    { id: 3, text: 'Check out the natural language input', completed: false, priority: 'low' },
  ]);
  const [newTask, setNewTask] = useState('');

  // Natural language processing (basic version)
  const parseTaskInput = (input) => {
    const text = input.trim();
    let priority = 'medium';
    
    // Simple priority detection
    if (text.includes('urgent') || text.includes('important') || text.includes('!!')) {
      priority = 'high';
    } else if (text.includes('low') || text.includes('maybe') || text.includes('someday')) {
      priority = 'low';
    }

    return {
      text: text.replace(/!!/g, '').replace(/\b(urgent|important|low|maybe|someday)\b/gi, '').trim(),
      priority
    };
  };

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      const parsed = parseTaskInput(newTask);
      setTasks([...tasks, {
        id: Date.now(),
        text: parsed.text,
        completed: false,
        priority: parsed.priority
      }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-400 bg-red-50';
      case 'low': return 'border-l-gray-400 bg-gray-50';
      default: return 'border-l-blue-400 bg-blue-50';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-400';
      case 'low': return 'bg-gray-400';
      default: return 'bg-blue-400';
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gradient">
                  MyPlanner
                </h1>
                <p className="text-sm text-gray-600">
                  Your unified productivity platform
                </p>
              </div>
              {totalTasks > 0 && (
                <div className="hidden sm:flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                  <div className={`w-2 h-2 rounded-full ${completedTasks === totalTasks ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {completedTasks}/{totalTasks} completed
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="input-primary pl-10 pr-4 py-2 w-64 text-sm"
                  disabled
                />
                <SearchIcon className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                v1.0 Dev
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tasks Section */}
          <div className="lg:col-span-1">
            <div className="card animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <CheckIcon className="text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {tasks.filter(t => !t.completed).length} remaining
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
                    placeholder="Add task... (try 'urgent call mom' or 'maybe clean desk')"
                    className="input-primary flex-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="btn-primary px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newTask.trim()}
                  >
                    <PlusIcon />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Try keywords like "urgent", "important", "low priority", or "maybe"
                </p>
              </form>

              {/* Task List */}
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm ${
                      task.completed
                        ? 'bg-gray-50 border-l-gray-300 opacity-75'
                        : getPriorityColor(task.priority)
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                      }`}
                    >
                      {task.completed && (
                        <CheckIcon className="w-3 h-3" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${
                        task.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900'
                      }`}>
                        {task.text}
                      </p>
                      {!task.completed && (
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityDot(task.priority)}`}></div>
                          <span className="text-xs text-gray-500 capitalize">
                            {task.priority} priority
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
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
            <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center space-x-2 mb-6">
                <CalendarIcon className="text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
              </div>
              
              <div className="text-center py-16">
                <div className="bg-primary-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Calendar Integration
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Connect your Google Calendar and Microsoft Outlook to see all your events in one place.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-gray-700 mb-2">Coming Soon:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Google Calendar sync</li>
                    <li>• Microsoft Calendar sync</li>
                    <li>• Task-to-event conversion</li>
                    <li>• Smart scheduling suggestions</li>
                    <li>• Meeting preparation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="lg:col-span-1">
            <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center space-x-2 mb-6">
                <NoteIcon className="text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
              </div>
              
              <div className="text-center py-16">
                <div className="bg-primary-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <NoteIcon className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Smart Note-Taking
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Capture thoughts, meeting notes, and ideas with automatic linking to your tasks and calendar.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-gray-700 mb-2">Coming Soon:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Rich text editor</li>
                    <li>• Markdown support</li>
                    <li>• Voice memo transcription</li>
                    <li>• Auto-link to tasks & events</li>
                    <li>• Quick capture shortcuts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Development Progress */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
            <h3 className="text-lg font-semibold text-primary-900 mb-3">
              🚀 Development Progress
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">Task Management</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">Natural Language Input</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Basic</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">Calendar Integration</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Week 5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">Notes System</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Week 6</span>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              💡 Try These Features
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Add "urgent call mom" or "important meeting prep"</li>
              <li>• Try "maybe clean desk" for low priority tasks</li>
              <li>• Use "!!" for high priority items</li>
              <li>• Complete tasks to see progress tracking</li>
              <li>• Watch the smooth animations and transitions</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
