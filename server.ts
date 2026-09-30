import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Heuristic fallback for Daily Summary
function generateLocalSummary(tasks: any[], team: any[], mode: 'morning' | 'evening', targetDate: string) {
  const total = tasks.length;
  const done = tasks.filter((t: any) => t.status === 'done');
  const inProgress = tasks.filter((t: any) => t.status === 'in_progress');
  const inReview = tasks.filter((t: any) => t.status === 'in_review');
  const backlog = tasks.filter((t: any) => t.status === 'backlog' || t.status === 'todo');

  const today = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter((t: any) => t.dueDate && t.dueDate < today && t.status !== 'done');
  const urgent = tasks.filter((t: any) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done');

  const greeting = mode === 'morning' ? 'Morning Standup & Sprint Kickoff' : 'End-of-Day Sprint & Progress Wrap-Up';
  
  let markdown = `### 📋 Daily Briefing: ${greeting} (${targetDate || today})\n\n`;

  markdown += `**Velocity Snapshot:**\n`;
  markdown += `* **Total Active Sprint Tasks:** ${total}\n`;
  markdown += `* **Completed:** ${done.length} (${total ? Math.round((done.length / total) * 100) : 0}% completion rate)\n`;
  markdown += `* **In Flight (In Progress / Review):** ${inProgress.length + inReview.length}\n`;
  markdown += `* **Pipeline (Backlog / Todo):** ${backlog.length}\n\n`;

  if (overdue.length > 0) {
    markdown += `### 🚨 Urgent Attention & Overdue Items\n`;
    overdue.forEach((t: any) => {
      const assignee = team.find((m: any) => m.id === t.assigneeId)?.name || 'Unassigned';
      markdown += `* **${t.title}** (Due: ${t.dueDate} · ${assignee}) — Priority: ${t.priority.toUpperCase()}\n`;
    });
    markdown += `\n`;
  }

  if (done.length > 0) {
    markdown += `### ✅ Key Accomplishments\n`;
    done.slice(0, 5).forEach((t: any) => {
      const assignee = team.find((m: any) => m.id === t.assigneeId)?.name || 'Team';
      markdown += `* **${t.title}** shipped by ${assignee}\n`;
    });
    markdown += `\n`;
  }

  markdown += `### 🎯 Primary Focus & Critical Path\n`;
  const focusItems = [...urgent, ...inProgress].slice(0, 4);
  if (focusItems.length > 0) {
    focusItems.forEach((t: any) => {
      const assignee = team.find((m: any) => m.id === t.assigneeId)?.name || 'Unassigned';
      markdown += `* **${t.title}** (${assignee}) — Status: ${t.status.replace('_', ' ')}\n`;
    });
  } else {
    markdown += `* Great job! No urgent blockers on the board right now.\n`;
  }
  markdown += `\n`;

  markdown += `### 👥 Team Workload Distribution\n`;
  team.forEach((member: any) => {
    const memberTasks = tasks.filter((t: any) => t.assigneeId === member.id && t.status !== 'done');
    markdown += `* **${member.name}** (${member.role}): ${memberTasks.length} active tasks\n`;
  });

  return markdown;
}

// POST /api/daily-summary
app.post('/api/daily-summary', async (req: Request, res: Response) => {
  try {
    const { tasks = [], team = [], mode = 'morning', date = new Date().toISOString().split('T')[0] } = req.body;

    if (!ai) {
      const fallback = generateLocalSummary(tasks, team, mode, date);
      return res.json({ summary: fallback, source: 'heuristic' });
    }

    const taskBriefs = tasks.map((t: any) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignee: team.find((m: any) => m.id === t.assigneeId)?.name || 'Unassigned',
      tags: t.tags || [],
      subtasksCompleted: `${(t.subtasks || []).filter((s: any) => s.completed).length}/${(t.subtasks || []).length}`
    }));

    const prompt = `You are an elite agile project manager providing an automated daily executive summary for an engineering and product team.
Current date: ${date}.
Summary mode: ${mode === 'morning' ? 'Morning Kickoff (focus on today\'s targets, roadblocks, high priorities)' : 'Evening Wrap-Up (focus on what was delivered, remaining tasks, tomorrow\'s setup)'}.

Here is the current sprint board state:
${JSON.stringify(taskBriefs, null, 2)}

Team members:
${JSON.stringify(team.map((m: any) => ({ name: m.name, role: m.role })), null, 2)}

Create a crisp, highly actionable, professional summary in Markdown formatting.
Include:
1. Executive Snapshot (1-2 sentences on sprint health and velocity)
2. 🚨 Blockers & Overdue/Urgent Items (if any, with assignee callouts)
3. 🎯 Top Focus Areas for ${mode === 'morning' ? 'Today' : 'Tomorrow'}
4. ✅ Key Completed Highlights
5. 👥 Team Bandwidth & Allocation Insight

Keep it clean, concise, and focused. Avoid generic boilerplate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const summaryText = response.text || generateLocalSummary(tasks, team, mode, date);
    return res.json({ summary: summaryText, source: 'gemini' });
  } catch (error: any) {
    console.error('Error generating daily summary via Gemini:', error);
    const fallback = generateLocalSummary(req.body.tasks || [], req.body.team || [], req.body.mode || 'morning', req.body.date);
    return res.json({ summary: fallback, source: 'heuristic_fallback' });
  }
});

// POST /api/breakdown-task
app.post('/api/breakdown-task', async (req: Request, res: Response) => {
  try {
    const { title, description = '' } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!ai) {
      // Default heuristic subtask breakdown
      return res.json({
        subtasks: [
          { title: `Define specifications and acceptance criteria for ${title}`, estimatedHours: 2 },
          { title: `Implement core functionality and data models`, estimatedHours: 4 },
          { title: `Add unit tests and edge-case validation`, estimatedHours: 2 },
          { title: `Code review and QA verification`, estimatedHours: 1 }
        ]
      });
    }

    const prompt = `Break down the following task into 3-5 concrete, actionable subtasks with estimated hours.
Task Title: "${title}"
Task Description: "${description}"

Respond ONLY with a JSON array of objects having keys: "title" (string, concise action item) and "estimatedHours" (number, between 1 and 8). Example:
[
  {"title": "Draft architectural schema and API contracts", "estimatedHours": 2},
  {"title": "Build frontend component with responsive states", "estimatedHours": 4}
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    let subtasks = [];
    try {
      subtasks = JSON.parse(response.text || '[]');
    } catch {
      subtasks = [
        { title: `Define requirements for ${title}`, estimatedHours: 2 },
        { title: `Execute core implementation`, estimatedHours: 4 },
        { title: `Testing and review`, estimatedHours: 2 }
      ];
    }

    return res.json({ subtasks });
  } catch (error) {
    console.error('Error in task breakdown:', error);
    return res.json({
      subtasks: [
        { title: `Define specifications for task`, estimatedHours: 2 },
        { title: `Implement feature core`, estimatedHours: 4 },
        { title: `Quality assurance and test verification`, estimatedHours: 2 }
      ]
    });
  }
});

// POST /api/smart-estimate
app.post('/api/smart-estimate', async (req: Request, res: Response) => {
  try {
    const { title, description = '' } = req.body;
    if (!ai) {
      return res.json({
        priority: 'medium',
        estimatedHours: 4,
        suggestedTags: ['Feature', 'Sprint']
      });
    }

    const prompt = `Analyze this task and recommend:
1. priority: 'low' | 'medium' | 'high' | 'urgent'
2. estimatedHours: number (e.g. 1 to 24)
3. suggestedTags: array of 1-3 concise string tags (e.g. ['Backend', 'Security'] or ['UI/UX', 'Design'])

Task: "${title}"
Description: "${description}"

Respond ONLY with valid JSON:
{"priority": "high", "estimatedHours": 6, "suggestedTags": ["Backend", "API"]}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      priority: parsed.priority || 'medium',
      estimatedHours: parsed.estimatedHours || 4,
      suggestedTags: parsed.suggestedTags || ['Feature']
    });
  } catch (error) {
    return res.json({
      priority: 'medium',
      estimatedHours: 4,
      suggestedTags: ['General']
    });
  }
});

// Dev vs Prod Vite Integration
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TaskFlow server listening on http://0.0.0.0:${PORT}`);
});
