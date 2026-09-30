import React from 'react';
import { Plus, Sparkles, Users, Search } from 'lucide-react';

interface TopNavProps {
  currentView: 'board' | 'list' | 'calendar' | 'workload';
  onViewChange: (view: 'board' | 'list' | 'calendar' | 'workload') => void;
  onOpenNewTask: () => void;
  onOpenDailySummary: () => void;
  onToggleTeamDrawer: () => void;
  teamDrawerOpen: boolean;
  activeMemberCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onViewChange,
  onOpenNewTask,
  onOpenDailySummary,
  onToggleTeamDrawer,
  teamDrawerOpen,
  activeMemberCount,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-6 py-3.5 backdrop-blur-sm">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-6">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onViewChange('board');
          }}
          className="text-lg font-bold tracking-tight text-neutral-900 transition-colors hover:text-neutral-700"
        >
          TaskFlow
        </a>

        {/* Zone 2: Navigation views as clean text links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-500">
          <button
            onClick={() => onViewChange('board')}
            className={`transition-colors hover:text-neutral-900 ${
              currentView === 'board' ? 'text-neutral-900 font-semibold underline underline-offset-8 decoration-neutral-900 decoration-2' : ''
            }`}
          >
            Board
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`transition-colors hover:text-neutral-900 ${
              currentView === 'list' ? 'text-neutral-900 font-semibold underline underline-offset-8 decoration-neutral-900 decoration-2' : ''
            }`}
          >
            List
          </button>
          <button
            onClick={() => onViewChange('calendar')}
            className={`transition-colors hover:text-neutral-900 ${
              currentView === 'calendar' ? 'text-neutral-900 font-semibold underline underline-offset-8 decoration-neutral-900 decoration-2' : ''
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => onViewChange('workload')}
            className={`transition-colors hover:text-neutral-900 ${
              currentView === 'workload' ? 'text-neutral-900 font-semibold underline underline-offset-8 decoration-neutral-900 decoration-2' : ''
            }`}
          >
            Team Workload
          </button>
        </nav>
      </div>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        {/* Collaborative Presence / Team toggle */}
        <button
          onClick={onToggleTeamDrawer}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            teamDrawerOpen
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
          }`}
          title="Team roster & collaborative activity feed"
        >
          <Users className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">Team</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
        </button>

        {/* AI Daily Summary Briefing Action */}
        <button
          onClick={onOpenDailySummary}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-300 hover:bg-neutral-100 whitespace-nowrap"
          title="Generate automated daily executive briefing"
        >
          <Sparkles className="h-3.5 w-3.5 text-neutral-700" />
          <span>Daily Summary</span>
        </button>

        {/* Create Task Action */}
        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-neutral-800 whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
