import React from 'react';
import { Search, X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { BoardFilter, Priority, TeamMember } from '../types/task';

interface FilterBarProps {
  filter: BoardFilter;
  onFilterChange: (filter: BoardFilter) => void;
  team: TeamMember[];
  availableTags: string[];
  totalTasks: number;
  inProgressCount: number;
  overdueCount: number;
  completedCount: number;
  onSelectOverdueOnly?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  team,
  availableTags,
  totalTasks,
  inProgressCount,
  overdueCount,
  completedCount,
}) => {
  const hasActiveFilters = Boolean(
    filter.search || filter.priority || filter.tag || filter.assigneeId || filter.onlyMyTasks
  );

  const resetFilters = () => {
    onFilterChange({
      search: '',
      priority: '',
      tag: '',
      assigneeId: '',
      onlyMyTasks: false,
    });
  };

  return (
    <div className="border-b border-neutral-200 bg-white px-6 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search & Segmented Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box with shortcut hint */}
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
              placeholder="Search tasks, keys, tags..."
              className="h-8 w-56 rounded-md border border-neutral-200 bg-neutral-50/70 pl-8 pr-7 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none"
            />
            {filter.search && (
              <button
                onClick={() => onFilterChange({ ...filter, search: '' })}
                className="absolute right-2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Priority filter selector */}
          <select
            value={filter.priority}
            onChange={(e) => onFilterChange({ ...filter, priority: e.target.value })}
            className="h-8 rounded-md border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 hover:border-neutral-300 focus:border-neutral-400 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee filter selector */}
          <select
            value={filter.assigneeId}
            onChange={(e) => onFilterChange({ ...filter, assigneeId: e.target.value })}
            className="h-8 rounded-md border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 hover:border-neutral-300 focus:border-neutral-400 focus:outline-none"
          >
            <option value="">All Assignees</option>
            {team.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>

          {/* Tag filter selector */}
          {availableTags.length > 0 && (
            <select
              value={filter.tag}
              onChange={(e) => onFilterChange({ ...filter, tag: e.target.value })}
              className="h-8 rounded-md border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 hover:border-neutral-300 focus:border-neutral-400 focus:outline-none"
            >
              <option value="">All Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}

          {/* Quick toggle: My Tasks */}
          <button
            onClick={() => onFilterChange({ ...filter, onlyMyTasks: !filter.onlyMyTasks })}
            className={`h-8 rounded-md px-3 text-xs font-medium transition-colors ${
              filter.onlyMyTasks
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Assigned to Me
          </button>

          {/* Clear Filters Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex h-8 items-center gap-1 rounded-md px-2 text-xs text-neutral-500 hover:text-neutral-900"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Unboxed Sprint Telemetry / Metrics */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 tabular-nums">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-neutral-900">{totalTasks}</span>
            <span>tasks</span>
          </div>
          <span aria-hidden="true" className="text-neutral-300">·</span>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-amber-500" />
            <span className="font-semibold text-neutral-900">{inProgressCount}</span>
            <span>in progress</span>
          </div>
          <span aria-hidden="true" className="text-neutral-300">·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span className="font-semibold text-neutral-900">{completedCount}</span>
            <span>done</span>
          </div>
          {overdueCount > 0 && (
            <>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <div
                className="flex cursor-pointer items-center gap-1 text-rose-600 font-medium hover:underline"
                onClick={() => onFilterChange({ ...filter, priority: '' })}
                title="Tasks past their due date"
              >
                <AlertCircle className="h-3 w-3" />
                <span>{overdueCount} overdue</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
