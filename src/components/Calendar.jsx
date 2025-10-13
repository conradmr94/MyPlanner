import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadUserData, saveUserData, getDemoData } from '../lib/userData';

// Calendar icons
const ChevronLeftIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CalendarIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PlusIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SearchIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Quick Add Button Component
const QuickAddButton = ({ onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-1.5 shadow-lg ${className}`}
    title="Add event"
  >
    <PlusIcon className="w-3 h-3" />
  </button>
);

// Event Modal Component
const EventModal = ({ isOpen, onClose, onSave, event = null, selectedDate, selectedTime = null, teams = [], autoAssignTeamId = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    type: 'meeting',
    color: 'blue',
    description: '',
    guests: [],
    teamId: autoAssignTeamId || null,
    recurring: {
      enabled: false,
      pattern: 'weekly',
      interval: 1,
      endDate: ''
    }
  });

  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date);
      setFormData({
        title: event.title,
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().slice(0, 5),
        duration: event.duration,
        type: event.type,
        color: event.color,
        description: event.description || '',
        guests: event.guests || [],
        teamId: event.teamId || null,
        recurring: event.recurring ? {
          enabled: true,
          pattern: event.recurring.pattern,
          interval: event.recurring.interval,
          endDate: event.recurring.endDate ? event.recurring.endDate.toISOString().split('T')[0] : ''
        } : {
          enabled: false,
          pattern: 'weekly',
          interval: 1,
          endDate: ''
        }
      });
    } else if (selectedDate) {
      const date = new Date(selectedDate);
      const time = selectedTime ? 
        `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}` :
        '09:00';
      setFormData(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0],
        time: time,
        teamId: autoAssignTeamId || null
      }));
    }
  }, [event, selectedDate, selectedTime, autoAssignTeamId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const eventDateTime = new Date(`${formData.date}T${formData.time}`);
    const eventData = {
      title: formData.title.trim(),
      date: eventDateTime,
      duration: parseInt(formData.duration),
      type: formData.type,
      color: formData.color,
      description: formData.description.trim(),
      guests: formData.guests,
      teamId: formData.teamId ? Number(formData.teamId) : null,
      recurring: formData.recurring.enabled ? {
        pattern: formData.recurring.pattern,
        interval: parseInt(formData.recurring.interval),
        endDate: formData.recurring.endDate ? new Date(formData.recurring.endDate) : null
      } : null
    };

    onSave(eventData);
    onClose();
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRecurringChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      recurring: {
        ...prev.recurring,
        [field]: value
      }
    }));
  };

  const addGuest = (email) => {
    if (email && !formData.guests.includes(email)) {
      setFormData(prev => ({
        ...prev,
        guests: [...prev.guests, email]
      }));
    }
  };

  const removeGuest = (email) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter(g => g !== email)
    }));
  };

  const [newGuestEmail, setNewGuestEmail] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {event ? 'Edit Event' : 'Create Event'}
          </h3>
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
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-primary"
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="input-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input-primary"
                min="0"
                step="15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-primary"
              >
                <option value="meeting">Meeting</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="deadline">Deadline</option>
                <option value="appointment">Appointment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
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

          {/* Team Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Assignment
            </label>
            <select
              name="teamId"
              value={formData.teamId || ''}
              onChange={handleChange}
              className="input-primary"
            >
              <option value="">No team (Personal event)</option>
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
              Assign this event to a team to share it with team members
            </p>
          </div>

          {/* Guests Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guests
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  className="input-primary flex-1"
                  placeholder="Enter email address"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addGuest(newGuestEmail);
                      setNewGuestEmail('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    addGuest(newGuestEmail);
                    setNewGuestEmail('');
                  }}
                  className="btn-primary px-3 py-2 text-sm"
                >
                  Add
                </button>
              </div>
              {formData.guests.length > 0 && (
                <div className="space-y-1">
                  {formData.guests.map((guest, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm text-gray-700">{guest}</span>
                      <button
                        type="button"
                        onClick={() => removeGuest(guest)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recurring Events Section */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring.enabled}
                onChange={(e) => handleRecurringChange('enabled', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                Make this a recurring event
              </label>
            </div>

            {formData.recurring.enabled && (
              <div className="space-y-3 pl-6 border-l-2 border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Repeat
                    </label>
                    <select
                      value={formData.recurring.pattern}
                      onChange={(e) => handleRecurringChange('pattern', e.target.value)}
                      className="input-primary"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Every
                    </label>
                    <input
                      type="number"
                      value={formData.recurring.interval}
                      onChange={(e) => handleRecurringChange('interval', parseInt(e.target.value))}
                      className="input-primary"
                      min="1"
                      max="99"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.recurring.endDate}
                    onChange={(e) => handleRecurringChange('endDate', e.target.value)}
                    className="input-primary"
                  />
                </div>
              </div>
            )}
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
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Calendar = ({ teams = [], filterTeamId = null, autoAssignTeamId = null, hideHeader = false }) => {
  const { user, requireAuth } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterColor, setFilterColor] = useState('all');
  const [showRecurring, setShowRecurring] = useState(true);
  const [events, setEvents] = useState([]);

  // Load events when user changes
  useEffect(() => {
    if (user) {
      // Load user-specific events
      const userId = user.uid || user.id; // Support both Firebase UID and legacy ID
      const userEvents = loadUserData(userId, 'events', []);
      setEvents(userEvents);
    } else {
      // Load demo events for non-authenticated users
      const demoData = getDemoData();
      setEvents(demoData.events);
    }
  }, [user]);

  // Save events when they change (only for authenticated users)
  useEffect(() => {
    if (user && events.length > 0) {
      const userId = user.uid || user.id; // Support both Firebase UID and legacy ID
      saveUserData(userId, 'events', events);
    }
  }, [events, user]);

  // Event management functions
  const createEvent = (eventData) => {
    // Require authentication for creating events
    if (!requireAuth('create event')) {
      return;
    }
    
    const newEvent = {
      id: Date.now(),
      ...eventData,
      date: new Date(eventData.date)
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (eventId, eventData) => {
    // Require authentication for updating events
    if (!requireAuth('update event')) {
      return;
    }
    
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, ...eventData, date: new Date(eventData.date) }
        : event
    ));
  };

  const deleteEvent = (eventId) => {
    // Require authentication for deleting events
    if (!requireAuth('delete event')) {
      return;
    }
    
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handleCreateEvent = (date = null, time = null) => {
    setEditingEvent(null);
    if (date) {
      setSelectedDate(date);
    }
    setShowEventModal(true);
  };

  const handleQuickCreateEvent = (date, time = null) => {
    setEditingEvent(null);
    setSelectedDate(date);
    setSelectedTime(time);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
    }
  };

  // Generate recurring event instances
  const generateRecurringInstances = (event, startDate, endDate) => {
    if (!event.recurring) return [event];
    
    const instances = [];
    const { pattern, interval, endDate: recurringEndDate } = event.recurring;
    const eventDate = new Date(event.date);
    const searchEndDate = endDate || new Date(eventDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year default
    const actualEndDate = recurringEndDate ? new Date(Math.min(recurringEndDate, searchEndDate)) : searchEndDate;
    
    let currentDate = new Date(eventDate);
    
    while (currentDate <= actualEndDate) {
      if (currentDate >= startDate) {
        instances.push({
          ...event,
          id: `${event.id}-${currentDate.getTime()}`,
          date: new Date(currentDate),
          isRecurring: true,
          originalEventId: event.id
        });
      }
      
      // Calculate next occurrence
      switch (pattern) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + interval);
          break;
        default:
          break;
      }
    }
    
    return instances;
  };

  // Get all events (including recurring instances) for a date range
  const getAllEventsInRange = (startDate, endDate) => {
    const allEvents = [];
    
    events.forEach(event => {
      if (event.recurring) {
        const instances = generateRecurringInstances(event, startDate, endDate);
        allEvents.push(...instances);
      } else {
        allEvents.push(event);
      }
    });
    
    return allEvents;
  };

  // Filter events based on search and filter criteria
  const getFilteredEvents = (eventsList) => {
    return eventsList.filter(event => {
      // Team filter (if viewing from Team Space)
      if (filterTeamId !== null && event.teamId !== filterTeamId) {
        return false;
      }
      
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.guests.some(guest => guest.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }
      
      // Type filter
      if (filterType !== 'all' && event.type !== filterType) {
        return false;
      }
      
      // Color filter
      if (filterColor !== 'all' && event.color !== filterColor) {
        return false;
      }
      
      // Recurring filter
      if (!showRecurring && event.isRecurring) {
        return false;
      }
      
      return true;
    });
  };

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the starting day of the week (0 = Sunday)
    const startDay = firstDay.getDay();
    
    // Calculate how many days to show from previous month
    const daysFromPrevMonth = startDay;
    
    // Calculate total days in current month
    const daysInMonth = lastDay.getDate();
    
    // Calculate how many days to show from next month
    const totalCells = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;
    const daysFromNextMonth = totalCells - daysFromPrevMonth - daysInMonth;
    
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString()
      });
    }
    
    // Next month days
    for (let day = 1; day <= daysFromNextMonth; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    return days;
  }, [currentDate, selectedDate]);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const allEvents = getAllEventsInRange(startOfDay, endOfDay);
    const dayEvents = allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfDay && eventDate <= endOfDay;
    });
    
    return getFilteredEvents(dayEvents);
  };


  // Get events for a specific day
  const getEventsForDay = (date) => {
    return getEventsForDate(date);
  };

  // Get week data for week view
  const getWeekData = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    
    return weekDays;
  };

  // Generate time slots for day/week view
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        displayTime: hour === 0 ? '12:00 AM' : 
                    hour < 12 ? `${hour}:00 AM` :
                    hour === 12 ? '12:00 PM' : 
                    `${hour - 12}:00 PM`
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Navigation functions
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() - 7);
        return newDate;
      });
    } else if (viewMode === 'day') {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() - 1);
        return newDate;
      });
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + 7);
        return newDate;
      });
    } else if (viewMode === 'day') {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + 1);
        return newDate;
      });
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Get event color classes
  const getEventColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[color] || colorMap.gray;
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Format week range for display
  const formatWeekRange = (date) => {
    const weekDays = getWeekData(date);
    const start = weekDays[0];
    const end = weekDays[6];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} ${start.getDate()}-${end.getDate()}`;
    } else {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  // Format day for display
  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get current period display text
  const getCurrentPeriodText = () => {
    switch (viewMode) {
      case 'month':
        return formatDate(currentDate);
      case 'week':
        return formatWeekRange(currentDate);
      case 'day':
        return formatDay(currentDate);
      default:
        return formatDate(currentDate);
    }
  };

  return (
    <div className={hideHeader ? "" : "bg-white rounded-lg shadow-sm border border-gray-200 p-6"}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Today
            </button>
            <div className="flex items-center space-x-1">
              <button
                onClick={goToPrevious}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                title={`Previous ${viewMode}`}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={goToNext}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                title={`Next ${viewMode}`}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Period Display */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {getCurrentPeriodText()}
        </h3>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-primary pl-10"
            placeholder="Search events, descriptions, or guests..."
          />
          <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-primary text-sm py-1"
            >
              <option value="all">All Types</option>
              <option value="meeting">Meeting</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="deadline">Deadline</option>
              <option value="appointment">Appointment</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Color:</label>
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="input-primary text-sm py-1"
            >
              <option value="all">All Colors</option>
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="purple">Purple</option>
              <option value="gray">Gray</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showRecurring"
              checked={showRecurring}
              onChange={(e) => setShowRecurring(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="showRecurring" className="text-sm font-medium text-gray-700">
              Show recurring events
            </label>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {['month', 'week', 'day'].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
              viewMode === mode
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Calendar Grid */}
      {viewMode === 'month' && (
        <div className="space-y-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border border-gray-200 rounded-lg transition-all group relative ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${
                    day.isToday ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                  } ${
                    day.isSelected ? 'bg-primary-100 border-primary-300' : ''
                  }`}
                >
                  <div 
                    className={`text-sm font-medium mb-1 cursor-pointer ${
                      day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}
                    onClick={() => handleDateClick(day.date)}
                  >
                    {day.date.getDate()}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1 flex-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-2 py-1 rounded border truncate ${getEventColorClasses(event.color)} group relative`}
                        title={event.title}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="truncate block flex-1">{event.title}</span>
                          {event.isRecurring && (
                            <span className="text-xs opacity-75" title="Recurring event">↻</span>
                          )}
                          {event.guests && event.guests.length > 0 && (
                            <span className="text-xs opacity-75" title={`${event.guests.length} guest(s)`}>👥</span>
                          )}
                        </div>
                        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                            className="text-gray-600 hover:text-gray-800 mr-1"
                            title="Edit event"
                          >
                            <EditIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                            className="text-gray-600 hover:text-red-600"
                            title="Delete event"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Quick Add Button */}
                  <div className="absolute top-2 right-2">
                    <QuickAddButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickCreateEvent(day.date);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          {/* Week header */}
          <div className="grid grid-cols-8 gap-1">
            <div className="p-2 text-sm font-medium text-gray-500">Time</div>
            {getWeekData(currentDate).map((day, index) => (
              <div key={index} className="p-2 text-center">
                <div className="text-sm font-medium text-gray-900">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-xs ${
                  day.toDateString() === new Date().toDateString() 
                    ? 'text-primary-600 font-bold' 
                    : 'text-gray-500'
                }`}>
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Week grid with time slots */}
          <div className="grid grid-cols-8 gap-1 border border-gray-200 rounded-lg overflow-hidden">
            {/* Time column */}
            <div className="bg-gray-50">
              {timeSlots.map((slot) => (
                <div key={slot.hour} className="h-12 border-b border-gray-200 flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-gray-500">{slot.displayTime}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {getWeekData(currentDate).map((day, dayIndex) => {
              const dayEvents = getEventsForDate(day);
              return (
                <div key={dayIndex} className="bg-white">
                  {timeSlots.map((slot) => {
                    const slotEvents = dayEvents.filter(event => {
                      const eventHour = new Date(event.date).getHours();
                      return eventHour === slot.hour;
                    });
                    
                    return (
                      <div
                        key={slot.hour}
                        className="h-12 border-b border-gray-200 relative hover:bg-gray-50 group"
                      >
                        {slotEvents.map((event, eventIndex) => (
                          <div
                            key={event.id}
                            className={`absolute inset-1 rounded text-xs p-1 truncate ${getEventColorClasses(event.color)} group relative`}
                            title={event.title}
                          >
                            <span className="truncate block">{event.title}</span>
                            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEvent(event);
                                }}
                                className="text-gray-600 hover:text-gray-800 mr-1"
                                title="Edit event"
                              >
                                <EditIcon className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.id);
                                }}
                                className="text-gray-600 hover:text-red-600"
                                title="Delete event"
                              >
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Quick Add Button for empty time slots */}
                        {slotEvents.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <QuickAddButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                const eventDate = new Date(day);
                                eventDate.setHours(slot.hour, 0, 0, 0);
                                handleQuickCreateEvent(eventDate);
                              }}
                              className="opacity-0 group-hover:opacity-100"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day header */}
          <div className="grid grid-cols-2 gap-1">
            <div className="p-2 text-sm font-medium text-gray-500">Time</div>
            <div className="p-2 text-center">
              <div className="text-sm font-medium text-gray-900">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className={`text-xs ${
                currentDate.toDateString() === new Date().toDateString() 
                  ? 'text-primary-600 font-bold' 
                  : 'text-gray-500'
              }`}>
                {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Day grid with time slots */}
          <div className="grid grid-cols-2 gap-1 border border-gray-200 rounded-lg overflow-hidden">
            {/* Time column */}
            <div className="bg-gray-50">
              {timeSlots.map((slot) => (
                <div key={slot.hour} className="h-16 border-b border-gray-200 flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-gray-500">{slot.displayTime}</span>
                </div>
              ))}
            </div>

            {/* Events column */}
            <div className="bg-white">
              {timeSlots.map((slot) => {
                const slotEvents = getEventsForDay(currentDate).filter(event => {
                  const eventHour = new Date(event.date).getHours();
                  return eventHour === slot.hour;
                });
                
                return (
                  <div
                    key={slot.hour}
                    className="h-16 border-b border-gray-200 relative hover:bg-gray-50 group"
                  >
                    {slotEvents.map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className={`absolute inset-1 rounded text-xs p-2 ${getEventColorClasses(event.color)} group relative`}
                        title={event.title}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {event.date.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                          {event.duration > 0 && ` (${event.duration} min)`}
                        </div>
                        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                            className="text-gray-600 hover:text-gray-800 mr-1"
                            title="Edit event"
                          >
                            <EditIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                            className="text-gray-600 hover:text-red-600"
                            title="Delete event"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Quick Add Button for empty time slots */}
                    {slotEvents.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <QuickAddButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            const eventDate = new Date(currentDate);
                            eventDate.setHours(slot.hour, 0, 0, 0);
                            handleQuickCreateEvent(eventDate);
                          }}
                          className="opacity-0 group-hover:opacity-100"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border ${getEventColorClasses(event.color)} group relative`}
                >
                  <div className="font-medium flex items-center space-x-2">
                    <span>{event.title}</span>
                    {event.isRecurring && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Recurring
                      </span>
                    )}
                  </div>
                  <div className="text-sm opacity-75">
                    {event.date.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                    {event.duration > 0 && ` (${event.duration} min)`}
                  </div>
                  {event.description && (
                    <div className="text-xs opacity-75 mt-1">{event.description}</div>
                  )}
                  {event.guests && event.guests.length > 0 && (
                    <div className="text-xs opacity-75 mt-1">
                      <span className="font-medium">Guests:</span> {event.guests.join(', ')}
                    </div>
                  )}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="text-gray-600 hover:text-gray-800 mr-2"
                      title="Edit event"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-gray-600 hover:text-red-600"
                      title="Delete event"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm">No events scheduled</div>
            )}
          </div>
        </div>
      )}

      {/* Add Event Button */}
      <div className="mt-6 flex justify-center">
        <button 
          onClick={() => handleCreateEvent()}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedTime(null);
        }}
        onSave={editingEvent ? (eventData) => updateEvent(editingEvent.id, eventData) : createEvent}
        event={editingEvent}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        teams={teams}
        autoAssignTeamId={autoAssignTeamId}
      />
    </div>
  );
};

export default Calendar;
