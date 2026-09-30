import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { ColumnId, Priority, Task, TeamMember, ColumnDefinition } from '../types/task';
import { fetchSmartEstimate } from '../services/api';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  columns: ColumnDefinition[];
  team: TeamMember[];
  defaultColumnId?: ColumnId;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  columns,
  team,
  defaultColumnId = 'todo',
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ColumnId>(defaultColumnId);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('2026-10-02');
  const [assigneeId, setAssigneeId] = useState(team[0]?.id || '');
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [tags, setTags] = useState('Sprint, Feature');
  const [isSuggesting, setIsSuggesting] = useState(false);

  // AI Smart Suggest
  const handleSmartSuggest = async () => {
    if (!title.trim()) return;
    setIsSuggesting(true);
    try {
      const result = await fetchSmartEstimate(title, description);
      if (result.priority) setPriority(result.priority);
      if (result.estimatedHours) setEstimatedHours(result.estimatedHours);
      if (result.suggestedTags?.length) setTags(result.suggestedTags.join(', '));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      estimatedHours: Number(estimatedHours) || 0,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      assigneeId,
      subtasks: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 0,
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
          <h3 className="text-sm font-semibold text-neutral-900">Create New Sprint Task</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-neutral-700">Task Title *</label>
              <button
                type="button"
                onClick={handleSmartSuggest}
                disabled={isSuggesting || !title.trim()}
                className="flex items-center gap-1 text-2xs font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-40"
                title="Auto-fill priority, tags and hours based on task title"
              >
                {isSuggesting ? (
                  <Loader2 className="h-3 w-3 animate-spin text-neutral-600" />
                ) : (
                  <Sparkles className="h-3 w-3 text-neutral-600" />
                )}
                <span>AI Auto-Suggest</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Webhook retry exponential backoff"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary and technical requirements..."
              className="w-full rounded-md border border-neutral-200 p-2.5 text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 mb-1">Column / Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ColumnId)}
                className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-800"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-800 capitalize"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-800"
              >
                <option value="">Unassigned</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 mb-1">Estimated Hours</label>
              <input
                type="number"
                min="0"
                max="80"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-neutral-800 font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-neutral-600 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Backend, Infra, Bug"
                className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-neutral-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
