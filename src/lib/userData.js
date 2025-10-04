// User-specific data management
export const getUserDataKey = (userId, dataType) => {
  return `myplanner_${dataType}_${userId}`;
};

export const saveUserData = (userId, dataType, data) => {
  const key = getUserDataKey(userId, dataType);
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${dataType} data:`, error);
    return false;
  }
};

export const loadUserData = (userId, dataType, defaultValue = []) => {
  const key = getUserDataKey(userId, dataType);
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      // Convert date strings back to Date objects for events
      if (dataType === 'events' && Array.isArray(parsed)) {
        return parsed.map(event => ({
          ...event,
          date: new Date(event.date)
        }));
      }
      return parsed;
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error loading ${dataType} data:`, error);
    return defaultValue;
  }
};

export const clearUserData = (userId) => {
  const dataTypes = ['tasks', 'events', 'notes'];
  dataTypes.forEach(dataType => {
    const key = getUserDataKey(userId, dataType);
    localStorage.removeItem(key);
  });
};

// Demo data for non-authenticated users
export const getDemoData = () => ({
  tasks: [
    {
      id: 1,
      text: 'Welcome to MyPlanner! 🎉',
      completed: false,
      priority: 'high',
      meta: { score: 0.8, rationale: 'demo task', due: null },
    },
    {
      id: 2,
      text: 'Try adding a new task below',
      completed: true,
      priority: 'medium',
      meta: { score: 0.5, rationale: 'demo task', due: null },
    },
    {
      id: 3,
      text: 'Check out the natural language input',
      completed: false,
      priority: 'low',
      meta: { score: 0.2, rationale: 'demo task', due: null },
    },
  ],
  events: [
    {
      id: 1,
      title: 'Team Meeting',
      date: new Date(2024, 11, 15, 10, 0),
      duration: 60,
      type: 'meeting',
      color: 'blue',
      description: 'Weekly team sync',
      guests: ['john@example.com', 'sarah@example.com'],
      recurring: {
        pattern: 'weekly',
        interval: 1,
        endDate: new Date(2025, 2, 15)
      }
    },
    {
      id: 2,
      title: 'Project Deadline',
      date: new Date(2024, 11, 20, 17, 0),
      duration: 0,
      type: 'deadline',
      color: 'red',
      description: 'Q4 project completion',
      guests: [],
      recurring: null
    }
  ],
  notes: [
    {
      id: 1,
      title: 'Welcome to Notes! 📝',
      content: 'This is your first note. You can write anything here - meeting notes, ideas, reminders, or just random thoughts.\n\nTry using **bold text**, *italic text*, or `code snippets`.\n\nYou can also create lists:\n- First item\n- Second item\n- Third item\n\n## Features\n\n- **Rich formatting** with markdown\n- Tag organization\n- Task linking\n- Search and filter\n\n> This is a blockquote example\n\nCheck out [MyPlanner](https://myplanner.app) for more features!',
      tags: ['welcome', 'demo'],
      linkedTasks: [],
      isPinned: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]
});
