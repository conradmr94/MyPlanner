// server/server.mjs
import express from 'express';
import cors from 'cors';

// If you're on Node < 18, uncomment the next 2 lines:
// import fetch from 'node-fetch';
// globalThis.fetch = fetch;

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

// Simple health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Model warmup endpoint to preload the model
app.post('/warmup', async (req, res) => {
  try {
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const MODEL = process.env.PRIORITY_MODEL || 'mistral';
    
    console.log(`[Server] Warming up model: ${MODEL}`);
    
    // Send a simple request to load the model
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: 'Hello',
        stream: false,
      })
    });
    
    if (resp.ok) {
      console.log(`[Server] Model ${MODEL} warmed up successfully`);
      res.json({ status: 'warmed up' });
    } else {
      console.error(`[Server] Warmup failed: ${resp.status}`);
      res.status(502).json({ error: 'warmup failed' });
    }
  } catch (e) {
    console.error('[Server] Warmup error:', e.message || e);
    res.status(500).json({ error: 'warmup error' });
  }
});

app.post('/classify_task', async (req, res) => {
  const started = Date.now();
  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: 'text required' });

    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const MODEL = process.env.PRIORITY_MODEL || 'mistral';
    const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 15000); // Increased to 15s

    const prompt = `
Classify the task as "high", "medium", or "low" priority.

Rules:
- High: urgent, time-sensitive, important, blocking, due soon.
- Medium: normal importance, not urgent.
- Low: optional, vague, "someday", non-urgent.

Return ONLY one word: high, medium, or low.

Task: "${text}"
`.trim();

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    console.log(`[Server] → Ollama (${MODEL}) classify: "${text}"`);
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        // You can tweak params below if desired:
        // options: { temperature: 0 }  // make it deterministic-ish
      })
    });
    clearTimeout(timer);

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      console.error(`[Server] Ollama HTTP ${resp.status}: ${body}`);
      
      // Special handling for model loading errors
      if (resp.status === 500 && body.includes('loading model')) {
        return res.status(503).json({ 
          error: 'model still loading', 
          message: 'Please wait a moment and try again' 
        });
      }
      
      return res.status(502).json({ error: `ollama http ${resp.status}` });
    }

    const data = await resp.json().catch(() => ({}));
    // Ollama returns { response: "..." } when stream:false
    let out = String(data?.response ?? '').toLowerCase().trim();

    // Harden parsing
    if (out.includes('high')) out = 'high';
    else if (out.includes('medium')) out = 'medium';
    else if (out.includes('low')) out = 'low';
    else out = 'medium';

    console.log(`[Server] ← Ollama result: ${out} (${Date.now() - started}ms)`);

    return res.json({ priority: out });
  } catch (e) {
    console.error('[Server] classify_task failed:', e.message || e);
    
    // Special handling for timeout errors
    if (e.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'request timeout', 
        message: 'Model is taking too long to respond. Please try again.' 
      });
    }
    
    return res.status(500).json({ error: 'classification failed' });
  }
});

// Chat endpoint for AI assistant
app.post('/chat', async (req, res) => {
  const started = Date.now();
  try {
    const { message, tasks = [] } = req.body || {};
    if (!message || !message.trim()) return res.status(400).json({ error: 'message required' });

    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const MODEL = process.env.PRIORITY_MODEL || 'mistral';
    const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 30000); // 30s for chat

    // Build context with tasks if available
    let contextPrompt = message;
    let tasksList = '';
    
    if (tasks && tasks.length > 0) {
      tasksList = tasks.map((task, index) => 
        `${index + 1}. ${task.text} (${task.completed ? 'completed' : 'pending'}, ${task.priority} priority)`
      ).join('\n');
      
      contextPrompt = `You are a helpful AI assistant. Here are the user's current tasks:

${tasksList}

User: "${message}"

IMPORTANT: Use ONLY the task information provided above. Do not make up, hallucinate, or invent any task information. Only reference the exact tasks listed.

Respond naturally and directly. Do NOT include any instructional text, examples, or explanations about how to use commands.

When the user wants to modify tasks, silently include the appropriate command in your response:
- ADD_TASK: "description" (for adding)
- COMPLETE_TASK: number (for completing)  
- DELETE_TASK: number (for deleting)
- EDIT_TASK: number: "new description" (for editing)

Just answer the user's question directly without any extra text.`;
    }

    const prompt = contextPrompt;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    console.log(`[Server] → Ollama (${MODEL}) chat: "${message}"`);
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: { 
          temperature: 0.7, // Slightly more creative for chat
          top_p: 0.9
        }
      })
    });
    clearTimeout(timer);

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      console.error(`[Server] Ollama HTTP ${resp.status}: ${body}`);
      
      // Special handling for model loading errors
      if (resp.status === 500 && body.includes('loading model')) {
        return res.status(503).json({ 
          error: 'model still loading', 
          message: 'Please wait a moment and try again' 
        });
      }
      
      return res.status(502).json({ error: `ollama http ${resp.status}` });
    }

    const data = await resp.json().catch(() => ({}));
    const response = String(data?.response ?? '').trim();

    console.log(`[Server] ← Ollama chat response (${Date.now() - started}ms)`);
    console.log(`[Server] Raw response:`, response);
    console.log(`[Server] Looking for task commands in response...`);
    console.log(`[Server] Current tasks context:`, tasksList);

    // Parse task modification commands
    const taskActions = [];
    let cleanResponse = response;

    // Check for ADD_TASK command
    const addTaskMatch = response.match(/ADD_TASK:\s*"([^"]+)"/);
    if (addTaskMatch) {
      taskActions.push({
        type: 'ADD_TASK',
        text: addTaskMatch[1]
      });
      cleanResponse = cleanResponse.replace(/ADD_TASK:\s*"[^"]+"/, '').trim();
    }

    // Check for COMPLETE_TASK command (multiple patterns)
    let completeTaskMatch = response.match(/COMPLETE_TASK:\s*(\d+)/);
    if (!completeTaskMatch) {
      // Try alternative patterns
      completeTaskMatch = response.match(/COMPLETE_TASK\s*(\d+)/);
    }
    if (!completeTaskMatch) {
      // Try without colon
      completeTaskMatch = response.match(/COMPLETE_TASK\s+(\d+)/);
    }
    
    if (completeTaskMatch) {
      const taskIndex = parseInt(completeTaskMatch[1]) - 1; // Convert to 0-based index
      if (taskIndex >= 0 && taskIndex < tasks.length) {
        taskActions.push({
          type: 'COMPLETE_TASK',
          taskId: tasks[taskIndex].id
        });
        cleanResponse = cleanResponse.replace(/COMPLETE_TASK[:\s]*\d+/, '').trim();
        console.log(`[Server] Found COMPLETE_TASK command for task ${taskIndex + 1}`);
      }
    }

    // Check for DELETE_TASK command
    const deleteTaskMatch = response.match(/DELETE_TASK:\s*(\d+)/);
    if (deleteTaskMatch) {
      const taskIndex = parseInt(deleteTaskMatch[1]) - 1; // Convert to 0-based index
      if (taskIndex >= 0 && taskIndex < tasks.length) {
        taskActions.push({
          type: 'DELETE_TASK',
          taskId: tasks[taskIndex].id
        });
        cleanResponse = cleanResponse.replace(/DELETE_TASK:\s*\d+/, '').trim();
      }
    }

    // Check for EDIT_TASK command (multiple patterns)
    console.log(`[Server] Checking for EDIT_TASK commands...`);
    let editTaskMatch = response.match(/EDIT_TASK:\s*(\d+):\s*"([^"]+)"/);
    if (!editTaskMatch) {
      console.log(`[Server] No EDIT_TASK with quotes found, trying without quotes...`);
      // Try without quotes
      editTaskMatch = response.match(/EDIT_TASK:\s*(\d+):\s*([^\s]+)/);
    }
    if (!editTaskMatch) {
      console.log(`[Server] No EDIT_TASK with colon found, trying without colon...`);
      // Try without colon
      editTaskMatch = response.match(/EDIT_TASK\s+(\d+)\s+"([^"]+)"/);
    }
    if (!editTaskMatch) {
      console.log(`[Server] No EDIT_TASK commands found in response`);
    }
    
    if (editTaskMatch) {
      const taskIndex = parseInt(editTaskMatch[1]) - 1; // Convert to 0-based index
      console.log(`[Server] Found EDIT_TASK match: task ${taskIndex + 1}, new text: "${editTaskMatch[2]}"`);
      console.log(`[Server] Task index validation: ${taskIndex} (0-based) should be < ${tasks.length}`);
      if (taskIndex >= 0 && taskIndex < tasks.length) {
        const targetTask = tasks[taskIndex];
        console.log(`[Server] Target task: "${targetTask.text}" (ID: ${targetTask.id})`);
        taskActions.push({
          type: 'EDIT_TASK',
          taskId: targetTask.id,
          newText: editTaskMatch[2]
        });
        cleanResponse = cleanResponse.replace(/EDIT_TASK[:\s]*\d+[:\s]*"[^"]*"/, '').trim();
        console.log(`[Server] Added EDIT_TASK action for task ${taskIndex + 1}: "${editTaskMatch[2]}"`);
      } else {
        console.log(`[Server] ERROR: Task index ${taskIndex + 1} is out of range (tasks.length = ${tasks.length})`);
      }
    }

    // Fallback: Try to parse natural language responses for task completion
    // Only trigger if we haven't found any explicit commands and the response contains action words
    if (taskActions.length === 0) {
      // Look for action patterns that indicate the user wants to complete a task
      const actionPatterns = [
        /marked.*as.*complete/i,
        /marked.*complete/i,
        /i.*completed/i,
        /i.*marked/i,
        /i.*finished/i,
        /i.*done/i,
        /task.*is.*complete/i,
        /task.*is.*done/i,
        /task.*is.*finished/i
      ];
      
      const hasActionLanguage = actionPatterns.some(pattern => response.match(pattern));
      
      if (hasActionLanguage) {
        // Try multiple patterns to find which task
        let taskIndex = -1;
        
        // Pattern 1: "task 2", "task2", etc.
        let taskNumberMatch = response.match(/task\s*(\d+)/i);
        if (taskNumberMatch) {
          taskIndex = parseInt(taskNumberMatch[1]) - 1;
        }
        
        // Pattern 2: "second task", "first task", etc.
        if (taskIndex === -1) {
          const ordinalMatch = response.match(/(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th)\s+task/i);
          if (ordinalMatch) {
            const ordinals = {
              'first': 0, '1st': 0,
              'second': 1, '2nd': 1,
              'third': 2, '3rd': 2,
              'fourth': 3, '4th': 3,
              'fifth': 4, '5th': 4
            };
            taskIndex = ordinals[ordinalMatch[1].toLowerCase()];
          }
        }
        
        // Pattern 3: Match by task description (only if it's not just listing tasks)
        if (taskIndex === -1 && !response.includes('(') && !response.includes('priority)')) {
          for (let i = 0; i < tasks.length; i++) {
            const taskText = tasks[i].text.toLowerCase();
            if (response.toLowerCase().includes(taskText)) {
              taskIndex = i;
              break;
            }
          }
        }
        
        if (taskIndex >= 0 && taskIndex < tasks.length) {
          taskActions.push({
            type: 'COMPLETE_TASK',
            taskId: tasks[taskIndex].id
          });
          console.log(`[Server] Fallback: Found task completion for task ${taskIndex + 1} (${tasks[taskIndex].text})`);
        }
      }
    }

    // If cleanResponse is empty but we have task actions, provide a default response
    if (!cleanResponse.trim() && taskActions.length > 0) {
      cleanResponse = "I've processed your request and updated your tasks.";
    }

    console.log(`[Server] Final clean response:`, cleanResponse);
    console.log(`[Server] Task actions:`, taskActions);

    return res.json({ 
      response: cleanResponse,
      taskActions: taskActions.length > 0 ? taskActions : undefined
    });
  } catch (e) {
    console.error('[Server] chat failed:', e.message || e);
    
    // Special handling for timeout errors
    if (e.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'request timeout', 
        message: 'The AI is taking too long to respond. Please try again.' 
      });
    }
    
    return res.status(500).json({ error: 'chat failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Priority API running on :${PORT}`));
