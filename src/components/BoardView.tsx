import React, { useState } from 'react';
import { Plus, CheckSquare, MessageSquare, GripVertical, AlertTriangle } from 'lucide-react';
import { Task, ColumnDefinition, TeamMember, ColumnId, Priority } from '../types/task';
import { getRelativeDueDateInfo } from '../utils/dateUtils';

interface BoardViewProps {
  columns: ColumnDefinition[];
  tasks: Task[];
  team: TeamMember[];
  onTaskClick: (task: Task) => void;
  onMoveTask: (taskId: string, targetColumn: ColumnId, targetIndex?: number) => void;
  onQuickAddTask: (columnId: ColumnId) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  columns,
  tasks,
  team,
  onTaskClick,
  onMoveTask,
  onQuickAddTask,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<ColumnId | null>(null);

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return { dot: 'bg-rose-500', text: 'text-rose-600', border: 'border-l-rose-500' };
      case 'high':
        return { dot: 'bg-amber-500', text: 'text-amber-600', border: 'border-l-amber-500' };
      case 'medium':
        return { dot: 'bg-blue-500', text: 'text-blue-600', border: 'border-l-blue-500' };
      case 'low':
      default:
        return { dot: 'bg-neutral-400', text: 'text-neutral-500', border: 'border-l-neutral-300' };
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setActiveDropColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== colId) {
      setActiveDropColumn(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumn: ColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onMoveTask(taskId, targetColumn);
    }
    setDraggedTaskId(null);
    setActiveDropColumn(null);
  };

  return (
    <div className="flex-1 overflow-x-auto p-6">
      <div className="flex min-h-[calc(100vh-160px)] items-start gap-5">
        {columns.map((column) => {
          const columnTasks = tasks
            .filter((t) => t.status === column.id)
            .sort((a, b) => a.order - b.order);

          const isOverDrop = activeDropColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={() => {
                if (activeDropColumn === column.id) setActiveDropColumn(null);
              }}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex w-80 shrink-0 flex-col rounded-xl border border-neutral-200/80 bg-neutral-100/60 p-3 transition-colors ${
                isOverDrop ? 'bg-neutral-200/80 ring-2 ring-neutral-400 ring-offset-2' : ''
              }`}
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                    {column.title}
                  </h3>
                  <span className="font-mono text-xs tabular-nums text-neutral-400">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onQuickAddTask(column.id)}
                  className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700"
                  title={`Add task to ${column.title}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Tasks List Container */}
              <div className="flex flex-1 flex-col gap-2.5 min-h-[140px]">
                {columnTasks.map((task) => {
                  const assignee = team.find((m) => m.id === task.assigneeId);
                  const pStyle = getPriorityStyle(task.priority);
                  const dueInfo = getRelativeDueDateInfo(task.dueDate);
                  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
                  const totalSubtasks = task.subtasks.length;
                  const isBeingDragged = draggedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onTaskClick(task)}
                      className={`group relative cursor-pointer rounded-lg border border-neutral-200 bg-white p-3.5 shadow-2xs transition-all hover:border-neutral-300 hover:shadow-xs ${
                        isBeingDragged ? 'opacity-40 scale-98' : ''
                      } border-l-4 ${pStyle.border}`}
                    >
                      {/* Drag handle affordance visible on hover */}
                      <div className="absolute right-2 top-2.5 opacity-0 transition-opacity group-hover:opacity-40">
                        <GripVertical className="h-3.5 w-3.5 text-neutral-500" />
                      </div>

                      {/* Task Title */}
                      <h4 className="pr-4 text-sm font-medium leading-snug text-neutral-900 line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Clean Unboxed Metadata (Zero-Pill Discipline: inline text with · separators) */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        <span className={`capitalize font-medium ${pStyle.text}`}>
                          {task.priority}
                        </span>
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <span className={dueInfo.colorClass}>
                          {dueInfo.label}
                        </span>
                        {task.estimatedHours > 0 && (
                          <>
                            <span aria-hidden="true" className="text-neutral-300">·</span>
                            <span className="font-mono tabular-nums">{task.estimatedHours}h</span>
                          </>
                        )}
                      </div>

                      {/* Subtasks Progress micro-bar if subtasks exist */}
                      {totalSubtasks > 0 && (
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-2xs text-neutral-400">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3" />
                              <span className="font-mono tabular-nums">
                                {completedSubtasks}/{totalSubtasks} subtasks
                              </span>
                            </span>
                            <span className="font-mono tabular-nums">
                              {Math.round((completedSubtasks / totalSubtasks) * 100)}%
                            </span>
                          </div>
                          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className="h-full bg-neutral-700 transition-all"
                              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Tags & Footer (Assignee + comments) */}
                      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5">
                        {/* Tags as clean inline labels */}
                        <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
                          {task.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-2xs text-neutral-500 font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {task.comments.length > 0 && (
                            <div className="flex items-center gap-1 text-2xs text-neutral-400 font-mono tabular-nums">
                              <MessageSquare className="h-3 w-3" />
                              <span>{task.comments.length}</span>
                            </div>
                          )}

                          {/* Assignee Avatar */}
                          {assignee ? (
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full text-3xs font-semibold ${assignee.avatarColor}`}
                              title={`${assignee.name} (${assignee.role})`}
                            >
                              {assignee.initials}
                            </div>
                          ) : (
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-neutral-300 text-3xs text-neutral-400"
                              title="Unassigned"
                            >
                              ?
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty column placeholder */}
                {columnTasks.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 p-6 text-center">
                    <p className="text-xs text-neutral-400">No tasks in {column.title.toLowerCase()}</p>
                    <button
                      onClick={() => onQuickAddTask(column.id)}
                      className="mt-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                    >
                      + Create task
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Quick-Add Action */}
              <button
                onClick={() => onQuickAddTask(column.id)}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-200/70 hover:text-neutral-800"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add task</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
