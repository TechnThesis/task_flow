import React, { useState } from 'react';
import { Task, TeamMember, Priority } from '../types/task';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  team: TeamMember[];
  onTaskClick: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  team,
  onTaskClick,
}) => {
  // Base date centered on current time (Sept/Oct 2026)
  const [currentDate, setCurrentDate] = useState(new Date('2026-09-30T00:00:00'));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-09-30T00:00:00'));
  };

  // Get calendar grid for the month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({ day, dateStr });
  }

  const getPriorityBorder = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return 'border-l-rose-500 bg-rose-50/40 text-rose-900';
      case 'high':
        return 'border-l-amber-500 bg-amber-50/40 text-amber-900';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50/40 text-blue-900';
      default:
        return 'border-l-neutral-400 bg-neutral-50 text-neutral-800';
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        {/* Header Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-neutral-900">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={handleToday}
              className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Current Sprint
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-neutral-200 pb-2 text-center text-xs font-semibold text-neutral-500">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 border-l border-t border-neutral-100">
          {calendarDays.map((item, idx) => {
            if (!item) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[110px] border-b border-r border-neutral-100 bg-neutral-50/30 p-2"
                />
              );
            }

            const dayTasks = tasks.filter((t) => t.dueDate === item.dateStr);
            const isToday = item.dateStr === '2026-09-30';

            return (
              <div
                key={item.dateStr}
                className={`min-h-[110px] border-b border-r border-neutral-100 p-2 transition-colors ${
                  isToday ? 'bg-amber-50/20' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isToday
                        ? 'flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white font-medium'
                        : 'text-neutral-500'
                    }`}
                  >
                    {item.day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="font-mono text-3xs tabular-nums text-neutral-400">
                      {dayTasks.length} {dayTasks.length === 1 ? 'due' : 'due'}
                    </span>
                  )}
                </div>

                {/* Day Tasks */}
                <div className="mt-1.5 flex flex-col gap-1">
                  {dayTasks.map((task) => {
                    const assignee = team.find((m) => m.id === task.assigneeId);
                    return (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`cursor-pointer truncate rounded border-l-2 px-1.5 py-1 text-2xs transition-colors hover:brightness-95 ${getPriorityBorder(
                          task.priority
                        )}`}
                        title={`${task.title} (${task.priority})`}
                      >
                        <span className="font-medium">{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
