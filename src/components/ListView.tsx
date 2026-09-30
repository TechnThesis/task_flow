import React, { useState } from 'react';
import { Task, TeamMember, ColumnDefinition, Priority, ColumnId } from '../types/task';
import { getRelativeDueDateInfo, formatSimpleDate } from '../utils/dateUtils';
import { ArrowUpDown, CheckSquare } from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  columns: ColumnDefinition[];
  team: TeamMember[];
  onTaskClick: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: ColumnId) => void;
  onUpdatePriority: (taskId: string, newPriority: Priority) => void;
  onDeleteTask: (taskId: string) => void;
}

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'assignee';

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  columns,
  team,
  onTaskClick,
  onUpdateStatus,
  onUpdatePriority,
}) => {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const priorityWeights: Record<Priority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'priority') {
      comparison = priorityWeights[a.priority] - priorityWeights[b.priority];
    } else if (sortField === 'status') {
      comparison = a.status.localeCompare(b.status);
    } else if (sortField === 'dueDate') {
      comparison = (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99');
    } else if (sortField === 'assignee') {
      const nameA = team.find((m) => m.id === a.assigneeId)?.name || '';
      const nameB = team.find((m) => m.id === b.assigneeId)?.name || '';
      comparison = nameA.localeCompare(nameB);
    }
    return sortAsc ? comparison : -comparison;
  });

  return (
    <div className="flex-1 overflow-x-auto p-6">
      <div className="min-w-[900px] overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-medium">
              <th className="py-3 pl-4 pr-2 font-medium">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1 hover:text-neutral-900"
                >
                  <span>Task Name</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-medium">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-neutral-900"
                >
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-medium">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-1 hover:text-neutral-900"
                >
                  <span>Priority</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-medium">
                <button
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center gap-1 hover:text-neutral-900"
                >
                  <span>Due Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-medium">
                <button
                  onClick={() => handleSort('assignee')}
                  className="flex items-center gap-1 hover:text-neutral-900"
                >
                  <span>Assignee</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-medium">Checklist</th>
              <th className="py-3 pl-3 pr-4 text-right font-medium">Est. Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sortedTasks.map((task) => {
              const assignee = team.find((m) => m.id === task.assigneeId);
              const dueInfo = getRelativeDueDateInfo(task.dueDate);
              const totalSubs = task.subtasks.length;
              const completedSubs = task.subtasks.filter((s) => s.completed).length;

              return (
                <tr
                  key={task.id}
                  className="group h-11 transition-colors hover:bg-neutral-50/80"
                >
                  {/* Title & Key */}
                  <td className="py-2.5 pl-4 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xs tabular-nums text-neutral-400">
                        {task.id}
                      </span>
                      <button
                        onClick={() => onTaskClick(task)}
                        className="truncate font-medium text-neutral-900 hover:text-neutral-600 text-left max-w-sm"
                      >
                        {task.title}
                      </button>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-3 py-2.5">
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateStatus(task.id, e.target.value as ColumnId)}
                      className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 hover:border-neutral-300 focus:outline-none"
                    >
                      {columns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Priority Dropdown */}
                  <td className="px-3 py-2.5">
                    <select
                      value={task.priority}
                      onChange={(e) => onUpdatePriority(task.id, e.target.value as Priority)}
                      className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 capitalize hover:border-neutral-300 focus:outline-none"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </td>

                  {/* Due Date */}
                  <td className="px-3 py-2.5 tabular-nums">
                    <div className="flex flex-col">
                      <span className={dueInfo.colorClass}>{dueInfo.label}</span>
                      {task.dueDate && (
                        <span className="text-3xs text-neutral-400">
                          {formatSimpleDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="px-3 py-2.5">
                    {assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-3xs font-semibold ${assignee.avatarColor}`}
                        >
                          {assignee.initials}
                        </div>
                        <span className="text-neutral-800">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Subtasks Progress */}
                  <td className="px-3 py-2.5">
                    {totalSubs > 0 ? (
                      <div className="flex items-center gap-1.5 font-mono text-2xs tabular-nums text-neutral-600">
                        <CheckSquare className="h-3 w-3 text-neutral-400" />
                        <span>
                          {completedSubs}/{totalSubs}
                        </span>
                      </div>
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </td>

                  {/* Estimated Hours */}
                  <td className="py-2.5 pl-3 pr-4 text-right font-mono text-xs tabular-nums text-neutral-700">
                    {task.estimatedHours ? `${task.estimatedHours}h` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedTasks.length === 0 && (
          <div className="p-12 text-center text-sm text-neutral-400">
            No matching tasks found. Adjust filters or search criteria.
          </div>
        )}
      </div>
    </div>
  );
};
