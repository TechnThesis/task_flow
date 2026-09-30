import React from 'react';
import { Task, TeamMember } from '../types/task';
import { Users, AlertTriangle, CheckCircle, BarChart3, Clock } from 'lucide-react';

interface WorkloadViewProps {
  tasks: Task[];
  team: TeamMember[];
  onTaskClick: (task: Task) => void;
}

export const WorkloadView: React.FC<WorkloadViewProps> = ({
  tasks,
  team,
  onTaskClick,
}) => {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Total Team Capacity</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
            {team.length} <span className="text-xs font-normal text-neutral-500">active members</span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Active Sprint Tasks</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
            {tasks.filter((t) => t.status !== 'done').length}{' '}
            <span className="text-xs font-normal text-neutral-500">in flight</span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Total Estimated Hours</span>
            <BarChart3 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
            {tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)}h{' '}
            <span className="text-xs font-normal text-neutral-500">committed</span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Completed Work</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 font-mono tabular-nums">
            {tasks.length > 0
              ? `${Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)}%`
              : '0%'}{' '}
            <span className="text-xs font-normal text-neutral-500">done</span>
          </div>
        </div>
      </div>

      {/* Team Member Workload Breakdown */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">
          Workload Distribution by Team Member
        </h3>

        <div className="space-y-6">
          {team.map((member) => {
            const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
            const activeTasks = memberTasks.filter((t) => t.status !== 'done');
            const doneTasks = memberTasks.filter((t) => t.status === 'done');
            const totalHours = activeTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
            const isHighLoad = activeTasks.length >= 4;

            return (
              <div
                key={member.id}
                className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${member.avatarColor}`}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-900">
                          {member.name}
                        </span>
                        <span className="text-2xs text-neutral-500">
                          · {member.role}
                        </span>
                        {isHighLoad && (
                          <span className="flex items-center gap-1 text-2xs font-medium text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            Heavy load
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500">
                        {member.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-neutral-600">
                    <div>
                      <span className="font-semibold text-neutral-900">{activeTasks.length}</span> active tasks
                    </div>
                    <span className="text-neutral-300">·</span>
                    <div>
                      <span className="font-semibold text-neutral-900">{totalHours}h</span> planned
                    </div>
                    <span className="text-neutral-300">·</span>
                    <div>
                      <span className="font-semibold text-emerald-600">{doneTasks.length}</span> finished
                    </div>
                  </div>
                </div>

                {/* Progress bar of their work */}
                <div className="mb-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="h-full bg-neutral-800 transition-all"
                      style={{
                        width: `${
                          memberTasks.length > 0
                            ? Math.round((doneTasks.length / memberTasks.length) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Task pills for quick inspection */}
                {activeTasks.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeTasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onTaskClick(t)}
                        className="rounded border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700 hover:border-neutral-400 hover:text-neutral-900 transition-colors text-left"
                      >
                        <span className="font-mono text-2xs text-neutral-400 mr-1.5">{t.id}</span>
                        <span>{t.title}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">No pending tasks assigned.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
