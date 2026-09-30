import React from 'react';
import { X, Users, Activity, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { TeamMember, ActivityLog, Task } from '../types/task';

interface TeamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamMember[];
  activities: ActivityLog[];
  tasks: Task[];
  currentUser: TeamMember;
  onSwitchUser: (member: TeamMember) => void;
  onSimulateCollaboration: () => void;
}

export const TeamDrawer: React.FC<TeamDrawerProps> = ({
  isOpen,
  onClose,
  team,
  activities,
  tasks,
  currentUser,
  onSwitchUser,
  onSimulateCollaboration,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-88 max-w-full border-l border-neutral-200 bg-white shadow-2xl flex flex-col animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 bg-neutral-50/50">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-neutral-800" />
          <h3 className="text-sm font-semibold text-neutral-900">
            Team & Live Collaboration
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-neutral-400 hover:text-neutral-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* Current Active User Switcher */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs font-semibold uppercase tracking-wider text-neutral-400">
              Active User Persona
            </span>
            <span className="flex items-center gap-1 text-2xs text-emerald-600 font-medium">
              <ShieldCheck className="h-3 w-3" />
              Viewing as you
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${currentUser.avatarColor}`}
            >
              {currentUser.initials}
            </div>
            <div className="flex-1">
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const m = team.find((t) => t.id === e.target.value);
                  if (m) onSwitchUser(m);
                }}
                className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-900"
              >
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Team Roster & Presence */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-900">
              Sprint Team Members ({team.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {team.map((member) => {
              const memberActiveTasks = tasks.filter(
                (t) => t.assigneeId === member.id && t.status !== 'done'
              );
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 p-2.5 hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-2xs font-semibold ${member.avatarColor}`}
                      >
                        {member.initials}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                          member.status === 'active'
                            ? 'bg-emerald-500'
                            : member.status === 'in-meeting'
                            ? 'bg-amber-500'
                            : 'bg-neutral-300'
                        }`}
                        title={member.status}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 leading-tight">
                        {member.name}
                      </div>
                      <div className="text-3xs text-neutral-500">{member.role}</div>
                    </div>
                  </div>

                  <span className="font-mono text-2xs tabular-nums text-neutral-500">
                    {memberActiveTasks.length} tasks
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Collaboration Simulator */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Simulate Peer Collaboration</span>
            </div>
          </div>
          <p className="text-2xs text-neutral-500 mb-3 leading-relaxed">
            Trigger simulated actions from teammates to test multi-user real-time updates and activity audit logs.
          </p>
          <button
            onClick={onSimulateCollaboration}
            className="w-full flex items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-white py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            <span>Simulate Peer Update</span>
          </button>
        </div>

        {/* Live Activity Audit Feed */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 mb-3">
            <Activity className="h-3.5 w-3.5 text-neutral-500" />
            <span>Activity Feed</span>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="relative pl-4 border-l border-neutral-200 text-xs">
                <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-neutral-400" />
                <p className="text-neutral-800 leading-snug">
                  <strong className="font-medium text-neutral-900">{act.userName}</strong>{' '}
                  {act.action}
                </p>
                {act.taskTitle && (
                  <p className="text-2xs text-neutral-500 truncate mt-0.5">
                    "{act.taskTitle}"
                  </p>
                )}
                <span className="text-3xs text-neutral-400 mt-1 block">
                  {act.timestamp}
                </span>
              </div>
            ))}

            {activities.length === 0 && (
              <p className="text-2xs text-neutral-400 italic">No recent activities.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
