# MyPlanner 📝

A unified productivity platform that combines intelligent task management with powerful note-taking capabilities. Built with React, Firebase, and AI-powered priority classification.

## 🚀 Quick Start (5 minutes)

Get MyPlanner running locally with all features:

### 1. Clone & Install
```bash
git clone git@github.com:conradmr94/MyPlanner.git
cd MyPlanner
npm install
```

### 2. Start AI Features (Optional but Recommended)
```bash
# Install Ollama (if not already installed)
# Visit https://ollama.ai for installation

# Start Ollama server
ollama serve

# In a new terminal, pull a model
ollama pull mistral

# Start the API server
cd server
npm install
npm run dev
```

### 3. Run the App
```bash
# In the main directory
npm start
```

**That's it!** Open [http://localhost:3000](http://localhost:3000) and start using MyPlanner.

> **Note:** The app works without Ollama, but you'll get AI-powered priority classification when it's running.

---

## ✨ Features

### 🎯 Smart Task Management
- **Natural Language Input**: Add tasks using natural language like "ASAP send report by 5pm"
- **AI-Powered Priority Classification**: Automatic priority detection using Ollama
- **Custom Priority Cues**: Add your own keywords to influence task priority
- **Progress Tracking**: Visual progress indicators and completion statistics
- **Firebase Integration**: Cloud sync when signed in, offline support when signed out

### 🤖 AI Assistant
- **Task-Aware Chat**: Ask questions about your specific tasks and get accurate information
- **Interactive Chat**: Get productivity tips, task management advice, and general help
- **Context-Aware Responses**: AI has access to your current task list and can answer questions about them
- **Always Available**: Chat button in header for quick access without disrupting your workflow
- **Compact Design**: Chat window stays within half the screen to keep other components visible

### 📝 Rich Note-Taking
- **Markdown Support**: Full markdown formatting with live preview
- **Tag Organization**: Organize notes with custom tags
- **Task Linking**: Connect notes to specific tasks
- **Search & Filter**: Find notes by content or tags
- **Pin Important Notes**: Keep important notes at the top
- **Click to Edit**: Click any note preview to open the editor

### 🔧 Technical Features
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live data synchronization
- **Offline Support**: Works without internet connection
- **Modern UI**: Clean, intuitive interface with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/myplanner.git
   cd myplanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Optional: AI Features Setup

For AI-powered priority classification, you'll need to run the Ollama server:

1. **Install Ollama** (if not already installed)
   - Visit [https://ollama.ai](https://ollama.ai) for installation instructions

2. **Start the Ollama server**
   ```bash
   ollama serve
   ```

3. **Pull a model** (e.g., Mistral)
   ```bash
   ollama pull mistral
   ```

4. **Start the API server** (in a new terminal)
   ```bash
   cd server
   npm install
   npm run dev
   ```

## 📁 Project Structure

```
myplanner/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── CueSettings.jsx    # Priority cues management
│   │   ├── NoteEditor.jsx     # Rich text note editor
│   │   ├── NotesList.jsx      # Notes display and management
│   │   └── NotesSearch.jsx    # Search and filtering
│   ├── data/              # Data layer
│   │   ├── tasks.js           # Task CRUD operations
│   │   └── notes.js           # Notes CRUD operations
│   ├── lib/               # Utilities
│   │   └── firebase.js        # Firebase configuration
│   ├── nlp/               # Natural language processing
│   │   ├── priority.js        # Priority classification
│   │   └── userCues.js        # Custom priority cues
│   └── App.js             # Main application component
├── server/                # API server for AI features
│   ├── server.mjs            # Express server
│   └── package.json          # Server dependencies
└── package.json           # Main dependencies
```

## 🛠️ Available Scripts

### Main Application
- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

### Development with AI Features
- `npm run dev:all` - Runs all services concurrently (Ollama, API server, React app, Firebase emulators)

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication and Firestore
3. Copy your Firebase config to `src/lib/firebase.js`
4. Update Firestore rules in `firestore.rules`

### Environment Variables
Create a `.env.local` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:3001
OLLAMA_URL=http://127.0.0.1:11434
PRIORITY_MODEL=mistral
```

## 🎯 Usage

### Adding Tasks
- Type natural language descriptions like "ASAP send report by 5pm"
- Use priority cues like "urgent", "low prio", or add custom ones
- Tasks are automatically prioritized using AI

### Taking Notes
- Click the "+" button in the Notes section
- Use markdown formatting: **bold**, *italic*, `code`, # headers, - lists
- Add tags for organization
- Link notes to specific tasks
- Pin important notes

### Managing Priority Cues
- Click "Priority Cues" in the header
- Add custom keywords that influence task priority
- Choose whether they nudge toward high, medium, or low priority

### Using the AI Assistant
- Click the "AI Assistant" button in the header next to Priority Cues
- Ask questions about your specific tasks: "What are my high priority tasks?", "How many tasks do I have left?"
- Get productivity tips and task management advice
- The AI has access to your current task list and can provide accurate information
- The chat window stays compact to keep your other components visible

## 🔮 Future Features

### 📅 Content Integration
- **Newsletter & Podcast Calendar Integration**: Automatically add publication dates of newsletters and podcasts to your calendar
- **AI-Powered Content Summarization**: Generate automatic summaries of newsletters and podcasts as notes when they're released
- **Content Discovery**: Smart recommendations based on your interests and reading patterns

### 👥 Collaboration Features
- **Team Spaces**: Create shared workspaces for tasks, calendar events, and notes with team members
- **Real-time Collaboration**: Multiple users can work on the same tasks and notes simultaneously
- **Permission Management**: Granular control over who can view, edit, or manage different content
- **Team Notifications**: Get notified when team members complete tasks or add important notes

### 🧠 Enhanced AI Capabilities
- **Smart Scheduling**: AI-powered calendar optimization based on task priorities and deadlines
- **Predictive Task Management**: Suggest task breakdowns and time estimates
- **Context-Aware Reminders**: Intelligent reminders based on your work patterns and preferences

### 🗺️ Knowledge Management
- **Idea Notes Tab**: Dedicated workspace for capturing and organizing ideas
- **Visual Knowledge Graph**: Obsidian-style graph view showing connections between ideas, notes, and tasks
- **Interactive Node Mapping**: Click and drag to create visual relationships between concepts
- **Idea Linking**: Connect ideas to tasks, calendar events, and other notes for better context

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Create React App](https://github.com/facebook/create-react-app)
- UI components styled with [Tailwind CSS](https://tailwindcss.com)
- Backend powered by [Firebase](https://firebase.google.com)
- AI features powered by [Ollama](https://ollama.ai)
- Icons from [Heroicons](https://heroicons.com)
