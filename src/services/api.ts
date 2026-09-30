import { Task, TeamMember, Subtask } from '../types/task';

export async function fetchDailySummary(
  tasks: Task[],
  team: TeamMember[],
  mode: 'morning' | 'evening',
  date: string
): Promise<{ summary: string; source: string }> {
  try {
    const res = await fetch('/api/daily-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks, team, mode, date }),
    });

    if (!res.ok) {
      throw new Error(`Failed to generate summary: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('API error, falling back to client summary generator:', error);
    // Client-side instant generator
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done');
    const inProgress = tasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review');
    const urgent = tasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done');
    const overdue = tasks.filter((t) => t.dueDate && t.dueDate < date && t.status !== 'done');

    const summary = `### 📋 Daily Briefing: ${mode === 'morning' ? 'Morning Sprint Kickoff' : 'Evening Progress Wrap-up'} (${date})\n\n` +
      `**Velocity & Health:**\n` +
      `* **Total Tasks in Sprint:** ${total}\n` +
      `* **Shipped / Complete:** ${done.length} (${total ? Math.round((done.length / total) * 100) : 0}%)\n` +
      `* **Active Work in Progress:** ${inProgress.length}\n\n` +
      (overdue.length > 0
        ? `### 🚨 Urgent / Overdue Blockers\n` +
          overdue.map((t) => `* **${t.title}** (Due: ${t.dueDate}) · Priority: ${t.priority.toUpperCase()}`).join('\n') + `\n\n`
        : '') +
      `### 🎯 Key Focus Items\n` +
      urgent.slice(0, 3).map((t) => `* **${t.title}** — ${t.status.replace('_', ' ')}`).join('\n') + `\n\n` +
      `### 👥 Team Allocation\n` +
      team.map((m) => {
        const count = tasks.filter((t) => t.assigneeId === m.id && t.status !== 'done').length;
        return `* **${m.name}** (${m.role}): ${count} active tasks`;
      }).join('\n');

    return { summary, source: 'client_fallback' };
  }
}

export async function fetchTaskBreakdown(
  title: string,
  description?: string
): Promise<{ subtasks: { title: string; estimatedHours: number }[] }> {
  try {
    const res = await fetch('/api/breakdown-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) throw new Error('Failed to generate breakdown');
    return await res.json();
  } catch (error) {
    console.warn('Breakdown error, using local template:', error);
    return {
      subtasks: [
        { title: `Define specifications and acceptance criteria`, estimatedHours: 2 },
        { title: `Implement core functionality and data models`, estimatedHours: 4 },
        { title: `Perform testing, edge-case checks, and code review`, estimatedHours: 2 },
      ],
    };
  }
}

export async function fetchSmartEstimate(
  title: string,
  description?: string
): Promise<{ priority: 'low' | 'medium' | 'high' | 'urgent'; estimatedHours: number; suggestedTags: string[] }> {
  try {
    const res = await fetch('/api/smart-estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) throw new Error('Estimate failed');
    return await res.json();
  } catch {
    const isUrgent = /urgent|critical|security|blocker|hotfix|prod/i.test(title + ' ' + description);
    const isHigh = /feat|api|auth|database|redesign/i.test(title + ' ' + description);
    return {
      priority: isUrgent ? 'urgent' : isHigh ? 'high' : 'medium',
      estimatedHours: 4,
      suggestedTags: isUrgent ? ['Urgent', 'Infra'] : ['Feature', 'Sprint'],
    };
  }
}
