import React, { useState } from 'react';
import {
  X,
  Trash2,
  Sparkles,
  Calendar,
  Clock,
  User,
  Plus,
  Check,
  MessageSquare,
  Send,
  Loader2,
} from 'lucide-react';
import { Task, TeamMember, ColumnDefinition, Priority, ColumnId, Subtask } from '../types/task';
import { fetchTaskBreakdown } from '../services/api';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (taskId: string) => void;
  columns: ColumnDefinition[];
  team: TeamMember[];
  currentUser: TeamMember;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  columns,
  team,
  currentUser,
}) => {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<ColumnId>(task.status);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
  const [estimatedHours, setEstimatedHours] = useState(task.estimatedHours || 0);
  const [tagsInput, setTagsInput] = useState(task.tags.join(', '));
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const handleSave = () => {
    const updated: Task = {
      ...task,
      title: title.trim() || task.title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
      estimatedHours: Number(estimatedHours) || 0,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      subtasks,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTask(updated);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2000);
  };

  const handleToggleSubtask = (subId: string) => {
    const updatedSubtasks = subtasks.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    setSubtasks(updatedSubtasks);
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      estimatedHours: 1,
    };
    const updatedSubtasks = [...subtasks, newSub];
    setSubtasks(updatedSubtasks);
    setNewSubtaskTitle('');
    onUpdateTask({ ...task, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() });
  };

  const handleDeleteSubtask = (subId: string) => {
    const updated = subtasks.filter((s) => s.id !== subId);
    setSubtasks(updated);
    onUpdateTask({ ...task, subtasks: updated, updatedAt: new Date().toISOString() });
  };

  // Automated AI Breakdown using Gemini 3.8 Flash
  const handleAIBreakdown = async () => {
    setIsBreakingDown(true);
    try {
      const res = await fetchTaskBreakdown(title, description);
      if (res.subtasks && res.subtasks.length > 0) {
        const generatedSubs: Subtask[] = res.subtasks.map((item, idx) => ({
          id: `ai-sub-${Date.now()}-${idx}`,
          title: item.title,
          completed: false,
          estimatedHours: item.estimatedHours || 2,
        }));
        const combined = [...subtasks, ...generatedSubs];
        setSubtasks(combined);
        onUpdateTask({ ...task, subtasks: combined, updatedAt: new Date().toISOString() });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...(task.comments || []), newComment];
    onUpdateTask({ ...task, comments: updatedComments, updatedAt: new Date().toISOString() });
    setNewCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-neutral-200 bg-white shadow-xl my-8 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold tabular-nums text-neutral-500">
              {task.id}
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-500">
              Created {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccessNotice && (
              <span className="text-xs text-emerald-600 font-medium animate-fade">
                Saved!
              </span>
            )}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this task?')) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 transition-colors"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              placeholder="Task Title..."
              className="w-full text-lg font-semibold text-neutral-900 border-b border-transparent hover:border-neutral-300 focus:border-neutral-900 focus:outline-none py-1"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg border border-neutral-100 bg-neutral-50/60 p-3.5 text-xs">
            {/* Status */}
            <div>
              <label className="block text-2xs font-medium text-neutral-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ColumnId);
                  onUpdateTask({ ...task, status: e.target.value as ColumnId });
                }}
                className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-2xs font-medium text-neutral-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value as Priority);
                  onUpdateTask({ ...task, priority: e.target.value as Priority });
                }}
                className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 capitalize"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-2xs font-medium text-neutral-400 mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => {
                  setAssigneeId(e.target.value);
                  onUpdateTask({ ...task, assigneeId: e.target.value });
                }}
                className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800"
              >
                <option value="">Unassigned</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-2xs font-medium text-neutral-400 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  onUpdateTask({ ...task, dueDate: e.target.value });
                }}
                className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Description & Acceptance Criteria
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              placeholder="Add detailed context, constraints, and requirements..."
              className="w-full rounded-lg border border-neutral-200 p-3 text-xs text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none"
            />
          </div>

          {/* Subtasks Section with Gemini Auto-Breakdown */}
          <div className="rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-900">
                  Subtask Checklist
                </span>
                <span className="font-mono text-2xs tabular-nums text-neutral-400">
                  ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
                </span>
              </div>

              {/* AI Gemini Breakdown Trigger */}
              <button
                type="button"
                onClick={handleAIBreakdown}
                disabled={isBreakingDown}
                className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-2xs font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 transition-colors"
                title="Use Gemini AI to decompose this task into actionable steps"
              >
                {isBreakingDown ? (
                  <Loader2 className="h-3 w-3 animate-spin text-neutral-600" />
                ) : (
                  <Sparkles className="h-3 w-3 text-neutral-600" />
                )}
                <span>Auto-Breakdown with AI</span>
              </button>
            </div>

            {/* Subtask list */}
            <div className="space-y-2 mb-3">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between group rounded p-1.5 hover:bg-neutral-50 text-xs"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-0 h-4 w-4"
                    />
                    <span
                      className={`${
                        sub.completed ? 'line-through text-neutral-400' : 'text-neutral-800'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </label>
                  {sub.estimatedHours && (
                    <span className="font-mono text-3xs text-neutral-400 mr-2 tabular-nums">
                      {sub.estimatedHours}h
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask and press enter..."
                className="flex-1 rounded border border-neutral-200 px-3 py-1.5 text-xs text-neutral-800 focus:border-neutral-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
              >
                Add
              </button>
            </form>
          </div>

          {/* Team Discussion & Comments */}
          <div className="border-t border-neutral-100 pt-4">
            <h4 className="text-xs font-semibold text-neutral-900 mb-3 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-neutral-500" />
              <span>Team Discussion ({task.comments.length})</span>
            </h4>

            <div className="space-y-3 mb-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-neutral-50 p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900">{comment.authorName}</span>
                    <span className="text-2xs text-neutral-400">
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">{comment.text}</p>
                </div>
              ))}

              {task.comments.length === 0 && (
                <p className="text-2xs text-neutral-400 italic">No comments yet on this task.</p>
              )}
            </div>

            {/* Post comment input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={`Leave a comment as ${currentUser.name}...`}
                className="flex-1 rounded border border-neutral-200 px-3 py-1.5 text-xs text-neutral-800 focus:border-neutral-400 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
              >
                <Send className="h-3 w-3" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-200 bg-neutral-50/70 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
