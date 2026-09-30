/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Task, TeamMember, ColumnDefinition, ColumnId, Priority, BoardFilter, ActivityLog } from './types/task';
import { INITIAL_COLUMNS, INITIAL_TEAM, INITIAL_TASKS, INITIAL_ACTIVITIES } from './data/mockData';
import { TopNav } from './components/TopNav';
import { FilterBar } from './components/FilterBar';
import { BoardView } from './components/BoardView';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { WorkloadView } from './components/WorkloadView';
import { TaskModal } from './components/TaskModal';
import { NewTaskModal } from './components/NewTaskModal';
import { DailySummaryModal } from './components/DailySummaryModal';
import { TeamDrawer } from './components/TeamDrawer';

export default function App() {
  // Persistence via localStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('taskflow_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('taskflow_team');
      return saved ? JSON.parse(saved) : INITIAL_TEAM;
    } catch {
      return INITIAL_TEAM;
    }
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('taskflow_activities');
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  const [columns] = useState<ColumnDefinition[]>(INITIAL_COLUMNS);
  const [currentUser, setCurrentUser] = useState<TeamMember>(INITIAL_TEAM[0]);

  // View state
  const [currentView, setCurrentView] = useState<'board' | 'list' | 'calendar' | 'workload'>('board');

  // Modals & Drawers
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [defaultNewTaskColumn, setDefaultNewTaskColumn] = useState<ColumnId>('todo');
  const [dailySummaryOpen, setDailySummaryOpen] = useState(false);
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);

  // Filters
  const [filter, setFilter] = useState<BoardFilter>({
    search: '',
    priority: '',
    tag: '',
    assigneeId: '',
    onlyMyTasks: false,
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_team', JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem('taskflow_activities', JSON.stringify(activities));
  }, [activities]);

  // Log activity helper
  const addActivity = (action: string, taskTitle?: string, taskId?: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      taskTitle,
      taskId,
      timestamp: 'Just now',
    };
    setActivities((prev) => [newLog, ...prev.slice(0, 30)]);
  };

  // Task Mutations
  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    addActivity('created new task', newTask.title, newTask.id);
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (selectedTask?.id === updated.id) {
      setSelectedTask(updated);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    if (taskToDelete) {
      addActivity('deleted task', taskToDelete.title, taskToDelete.id);
    }
  };

  const handleMoveTask = (taskId: string, targetColumn: ColumnId) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || targetTask.status === targetColumn) return;

    const oldStatus = targetTask.status;
    const colName = columns.find((c) => c.id === targetColumn)?.title || targetColumn;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: targetColumn, updatedAt: new Date().toISOString() } : t
    );
    setTasks(updatedTasks);
    addActivity(`moved task from ${oldStatus.replace('_', ' ')} to ${colName}`, targetTask.title, taskId);
  };

  const handleUpdateStatus = (taskId: string, newStatus: ColumnId) => {
    handleMoveTask(taskId, newStatus);
  };

  const handleUpdatePriority = (taskId: string, newPriority: Priority) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;
    const updated = { ...targetTask, priority: newPriority, updatedAt: new Date().toISOString() };
    handleUpdateTask(updated);
    addActivity(`changed priority to ${newPriority}`, targetTask.title, taskId);
  };

  const handleQuickAddTask = (columnId: ColumnId) => {
    setDefaultNewTaskColumn(columnId);
    setNewTaskOpen(true);
  };

  // Simulate Peer Collaboration
  const handleSimulateCollaboration = () => {
    const peers = team.filter((m) => m.id !== currentUser.id);
    const randomPeer = peers[Math.floor(Math.random() * peers.length)] || currentUser;
    const eligibleTasks = tasks.filter((t) => t.status !== 'done');
    const randomTask = eligibleTasks[Math.floor(Math.random() * eligibleTasks.length)];

    if (!randomTask) return;

    const actions = [
      () => {
        // Move task to next column
        const columnProgression: Record<ColumnId, ColumnId> = {
          backlog: 'todo',
          todo: 'in_progress',
          in_progress: 'in_review',
          in_review: 'done',
          done: 'done',
        };
        const nextCol = columnProgression[randomTask.status];
        if (nextCol !== randomTask.status) {
          const colTitle = columns.find((c) => c.id === nextCol)?.title;
          const updated = { ...randomTask, status: nextCol, updatedAt: new Date().toISOString() };
          handleUpdateTask(updated);
          setActivities((prev) => [
            {
              id: `act-${Date.now()}`,
              userId: randomPeer.id,
              userName: randomPeer.name,
              action: `moved task to ${colTitle}`,
              taskTitle: randomTask.title,
              taskId: randomTask.id,
              timestamp: 'Just now',
            },
            ...prev,
          ]);
        }
      },
      () => {
        // Leave a comment
        const commentSnippets = [
          'Review complete! Performance tests look optimal.',
          'Double-checked the boundary conditions, looking good.',
          'Added integration test coverage and updated API contracts.',
          'Ready for staging cutover verification.',
        ];
        const snippet = commentSnippets[Math.floor(Math.random() * commentSnippets.length)];
        const newComment = {
          id: `c-${Date.now()}`,
          authorId: randomPeer.id,
          authorName: randomPeer.name,
          text: snippet,
          createdAt: new Date().toISOString(),
        };
        const updated = {
          ...randomTask,
          comments: [...(randomTask.comments || []), newComment],
          updatedAt: new Date().toISOString(),
        };
        handleUpdateTask(updated);
        setActivities((prev) => [
          {
            id: `act-${Date.now()}`,
            userId: randomPeer.id,
            userName: randomPeer.name,
            action: `commented on task`,
            taskTitle: randomTask.title,
            taskId: randomTask.id,
            timestamp: 'Just now',
          },
          ...prev,
        ]);
      },
      () => {
        // Check off subtask
        if (randomTask.subtasks.length > 0) {
          const updatedSubs = randomTask.subtasks.map((s, idx) =>
            idx === 0 ? { ...s, completed: true } : s
          );
          const updated = { ...randomTask, subtasks: updatedSubs, updatedAt: new Date().toISOString() };
          handleUpdateTask(updated);
          setActivities((prev) => [
            {
              id: `act-${Date.now()}`,
              userId: randomPeer.id,
              userName: randomPeer.name,
              action: `completed subtask on task`,
              taskTitle: randomTask.title,
              taskId: randomTask.id,
              timestamp: 'Just now',
            },
            ...prev,
          ]);
        }
      },
    ];

    const chosenAction = actions[Math.floor(Math.random() * actions.length)];
    chosenAction();
  };

  // Collect all unique tags for filter dropdown
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => (t.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter.search) {
        const query = filter.search.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = (task.description || '').toLowerCase().includes(query);
        const matchTags = (task.tags || []).some((t) => t.toLowerCase().includes(query));
        const matchId = task.id.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchTags && !matchId) return false;
      }

      if (filter.priority && task.priority !== filter.priority) {
        return false;
      }

      if (filter.tag && !(task.tags || []).includes(filter.tag)) {
        return false;
      }

      if (filter.assigneeId && task.assigneeId !== filter.assigneeId) {
        return false;
      }

      if (filter.onlyMyTasks && task.assigneeId !== currentUser.id) {
        return false;
      }

      return true;
    });
  }, [tasks, filter, currentUser.id]);

  // Overall sprint metrics
  const todayStr = '2026-09-30';
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const overdueCount = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status !== 'done').length;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50/70 text-neutral-900 font-sans">
      {/* 3-Zone Top Navigation */}
      <TopNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewTask={() => {
          setDefaultNewTaskColumn('todo');
          setNewTaskOpen(true);
        }}
        onOpenDailySummary={() => setDailySummaryOpen(true)}
        onToggleTeamDrawer={() => setTeamDrawerOpen(!teamDrawerOpen)}
        teamDrawerOpen={teamDrawerOpen}
        activeMemberCount={team.length}
      />

      {/* Filter and Telemetry Strip */}
      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        team={team}
        availableTags={availableTags}
        totalTasks={tasks.length}
        inProgressCount={inProgressCount}
        overdueCount={overdueCount}
        completedCount={completedCount}
      />

      {/* Main View Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {currentView === 'board' && (
          <BoardView
            columns={columns}
            tasks={filteredTasks}
            team={team}
            onTaskClick={setSelectedTask}
            onMoveTask={handleMoveTask}
            onQuickAddTask={handleQuickAddTask}
          />
        )}

        {currentView === 'list' && (
          <ListView
            tasks={filteredTasks}
            columns={columns}
            team={team}
            onTaskClick={setSelectedTask}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePriority={handleUpdatePriority}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            tasks={filteredTasks}
            team={team}
            onTaskClick={setSelectedTask}
          />
        )}

        {currentView === 'workload' && (
          <WorkloadView
            tasks={tasks}
            team={team}
            onTaskClick={setSelectedTask}
          />
        )}
      </main>

      {/* Task Detail Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        columns={columns}
        team={team}
        currentUser={currentUser}
      />

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        onAddTask={handleAddTask}
        columns={columns}
        team={team}
        defaultColumnId={defaultNewTaskColumn}
      />

      {/* Automated Daily Summary Modal (Gemini 3.8 Flash) */}
      <DailySummaryModal
        isOpen={dailySummaryOpen}
        onClose={() => setDailySummaryOpen(false)}
        tasks={tasks}
        team={team}
      />

      {/* Team Roster & Collaboration Drawer */}
      <TeamDrawer
        isOpen={teamDrawerOpen}
        onClose={() => setTeamDrawerOpen(false)}
        team={team}
        activities={activities}
        tasks={tasks}
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        onSimulateCollaboration={handleSimulateCollaboration}
      />
    </div>
  );
}
