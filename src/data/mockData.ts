import { Task, TeamMember, ColumnDefinition, ActivityLog } from '../types/task';

export const INITIAL_COLUMNS: ColumnDefinition[] = [
  { id: 'backlog', title: 'Backlog', description: 'Candidate items for upcoming sprint', color: 'border-neutral-300' },
  { id: 'todo', title: 'To Do', description: 'Committed tasks for this cycle', color: 'border-blue-400' },
  { id: 'in_progress', title: 'In Progress', description: 'Currently active work items', color: 'border-amber-400' },
  { id: 'in_review', title: 'In Review', description: 'Code review, design QA, or peer verification', color: 'border-purple-400' },
  { id: 'done', title: 'Done', description: 'Shipped, tested, and accepted', color: 'border-emerald-400' },
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'user_sarah',
    name: 'Sarah Lin',
    email: 'sarah.lin@team.internal',
    role: 'Staff Tech Lead',
    initials: 'SL',
    avatarColor: 'bg-indigo-600 text-white',
    status: 'active',
    department: 'Engineering'
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    email: 'marcus.v@team.internal',
    role: 'Senior Backend Engineer',
    initials: 'MV',
    avatarColor: 'bg-emerald-600 text-white',
    status: 'active',
    department: 'Engineering'
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena.r@team.internal',
    role: 'Principal Product Designer',
    initials: 'ER',
    avatarColor: 'bg-rose-600 text-white',
    status: 'in-meeting',
    department: 'Design'
  },
  {
    id: 'user_david',
    name: 'David Kalu',
    email: 'david.k@team.internal',
    role: 'Product Manager',
    initials: 'DK',
    avatarColor: 'bg-amber-600 text-white',
    status: 'active',
    department: 'Product'
  },
  {
    id: 'user_alex',
    name: 'Alex Chen',
    email: 'alex.chen@team.internal',
    role: 'DevOps & Site Reliability',
    initials: 'AC',
    avatarColor: 'bg-cyan-600 text-white',
    status: 'offline',
    department: 'Operations'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'TASK-101',
    title: 'Migrate PostgreSQL replication pool to Multi-AZ read replicas',
    description: 'Enhance high-availability failover latency under peak load by provisioning read-replicas with automatic heartbeat health probes and connection pooling.',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2026-09-30', // Due today
    estimatedHours: 8,
    tags: ['Infrastructure', 'Database', 'P0'],
    assigneeId: 'user_alex',
    subtasks: [
      { id: 'sub-1', title: 'Benchmark current replication lag under write spikes', completed: true, estimatedHours: 2 },
      { id: 'sub-2', title: 'Provision target replica instances in secondary AZ', completed: true, estimatedHours: 3 },
      { id: 'sub-3', title: 'Configure PgBouncer connection pools with automated failover', completed: false, estimatedHours: 2 },
      { id: 'sub-4', title: 'Run chaos switchover simulation in staging', completed: false, estimatedHours: 1 }
    ],
    comments: [
      {
        id: 'c-1',
        authorId: 'user_sarah',
        authorName: 'Sarah Lin',
        text: 'Alex, make sure we test DNS TTL propagation before the cutover this evening.',
        createdAt: '2026-09-29T14:32:00Z'
      },
      {
        id: 'c-2',
        authorId: 'user_alex',
        authorName: 'Alex Chen',
        text: 'Confirmed. TTL is lowered to 30 seconds across the cluster.',
        createdAt: '2026-09-30T09:15:00Z'
      }
    ],
    createdAt: '2026-09-26T10:00:00Z',
    updatedAt: '2026-09-30T09:15:00Z',
    order: 0
  },
  {
    id: 'TASK-102',
    title: 'Design high-density Kanban card micro-interactions and touch targets',
    description: 'Refine desktop and tablet drag-and-drop feedback, keyboard shortcuts (Cmd+K, J/K navigation), and accessible ARIA attributes.',
    priority: 'high',
    status: 'in_review',
    dueDate: '2026-10-01',
    estimatedHours: 6,
    tags: ['Design System', 'UI/UX'],
    assigneeId: 'user_elena',
    subtasks: [
      { id: 'sub-201', title: 'Audit contrast ratios for priority indicators', completed: true, estimatedHours: 2 },
      { id: 'sub-202', title: 'Spec drop target indicator states and smooth transitions', completed: true, estimatedHours: 2 },
      { id: 'sub-203', title: 'Export Figma token specs to Tailwind theme config', completed: true, estimatedHours: 2 }
    ],
    comments: [
      {
        id: 'c-3',
        authorId: 'user_david',
        authorName: 'David Kalu',
        text: 'Looks super clean! Reviewing the micro-copy for the drag affordances now.',
        createdAt: '2026-09-30T10:00:00Z'
      }
    ],
    createdAt: '2026-09-27T11:20:00Z',
    updatedAt: '2026-09-30T10:00:00Z',
    order: 0
  },
  {
    id: 'TASK-103',
    title: 'Build automated daily team standup generator with Gemini 3.8',
    description: 'Develop executive summary endpoints that ingest sprint status, highlight overdue blockers, and produce morning/evening actionable briefings.',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2026-10-02',
    estimatedHours: 6,
    tags: ['AI Intelligence', 'Backend'],
    assigneeId: 'user_marcus',
    subtasks: [
      { id: 'sub-301', title: 'Implement Express API route /api/daily-summary', completed: true, estimatedHours: 2 },
      { id: 'sub-302', title: 'Draft prompt chain with schema validation', completed: true, estimatedHours: 2 },
      { id: 'sub-303', title: 'Add heuristic fallback algorithm for offline execution', completed: true, estimatedHours: 1 },
      { id: 'sub-304', title: 'Connect front-end modal with copy and export features', completed: false, estimatedHours: 1 }
    ],
    comments: [],
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-09-30T08:45:00Z',
    order: 1
  },
  {
    id: 'TASK-104',
    title: 'Implement OAuth 2.0 PKCE client flow for external integrations',
    description: 'Ensure secure client authentication with third-party webhooks without exposing client secrets in browser bundles.',
    priority: 'urgent',
    status: 'todo',
    dueDate: '2026-09-28', // Overdue
    estimatedHours: 5,
    tags: ['Security', 'API'],
    assigneeId: 'user_sarah',
    subtasks: [
      { id: 'sub-401', title: 'Generate code verifier and SHA-256 code challenge', completed: true, estimatedHours: 2 },
      { id: 'sub-402', title: 'Implement state CSRF validation storage in sessionStorage', completed: false, estimatedHours: 2 },
      { id: 'sub-403', title: 'Handle authorization token exchange callback', completed: false, estimatedHours: 1 }
    ],
    comments: [
      {
        id: 'c-4',
        authorId: 'user_sarah',
        authorName: 'Sarah Lin',
        text: 'Flagging this as overdue from Monday. Will finalize state verification today.',
        createdAt: '2026-09-30T08:00:00Z'
      }
    ],
    createdAt: '2026-09-25T14:15:00Z',
    updatedAt: '2026-09-30T08:00:00Z',
    order: 0
  },
  {
    id: 'TASK-105',
    title: 'Write comprehensive integration test suite for sprint state updates',
    description: 'Cover optimistic UI updates, drag-and-drop state reconciliation, and undo/redo history stacks.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-10-04',
    estimatedHours: 4,
    tags: ['QA', 'Testing'],
    assigneeId: 'user_marcus',
    subtasks: [
      { id: 'sub-501', title: 'Write tests for column reordering', completed: false, estimatedHours: 1 },
      { id: 'sub-502', title: 'Simulate concurrent task updates and edge cases', completed: false, estimatedHours: 3 }
    ],
    comments: [],
    createdAt: '2026-09-29T16:00:00Z',
    updatedAt: '2026-09-29T16:00:00Z',
    order: 1
  },
  {
    id: 'TASK-106',
    title: 'Conduct user interviews on enterprise sprint reporting workflow',
    description: 'Interview 4 engineering managers to validate daily summary formats, notification thresholds, and weekly metrics.',
    priority: 'medium',
    status: 'done',
    dueDate: '2026-09-29',
    estimatedHours: 6,
    tags: ['Product', 'Research'],
    assigneeId: 'user_david',
    subtasks: [
      { id: 'sub-601', title: 'Draft interview questions and scenario prompts', completed: true, estimatedHours: 2 },
      { id: 'sub-602', title: 'Conduct interviews with engineering leaders', completed: true, estimatedHours: 3 },
      { id: 'sub-603', title: 'Synthesize key insights and feature backlog matrix', completed: true, estimatedHours: 1 }
    ],
    comments: [
      {
        id: 'c-5',
        authorId: 'user_david',
        authorName: 'David Kalu',
        text: 'Summary synthesized and shared in team docs. Strong demand for one-click morning briefings.',
        createdAt: '2026-09-29T17:30:00Z'
      }
    ],
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: '2026-09-29T17:30:00Z',
    order: 0
  },
  {
    id: 'TASK-107',
    title: 'Refactor telemetry exporter to support OpenTelemetry Protocol (OTLP)',
    description: 'Standardize distributed tracing and log propagation across microservices using OpenTelemetry Go SDK.',
    priority: 'low',
    status: 'backlog',
    dueDate: '2026-10-10',
    estimatedHours: 12,
    tags: ['Infrastructure', 'Observability'],
    assigneeId: 'user_alex',
    subtasks: [
      { id: 'sub-701', title: 'Review OTLP spec v1.2', completed: false, estimatedHours: 2 },
      { id: 'sub-702', title: 'Configure collector sidecar daemonset', completed: false, estimatedHours: 6 },
      { id: 'sub-703', title: 'Verify trace propagation headers', completed: false, estimatedHours: 4 }
    ],
    comments: [],
    createdAt: '2026-09-28T15:00:00Z',
    updatedAt: '2026-09-28T15:00:00Z',
    order: 0
  },
  {
    id: 'TASK-108',
    title: 'Redesign empty states and zero-data onboard walkthroughs',
    description: 'Ensure new workspaces have clear guiding hints, sample starter templates, and visual hierarchy.',
    priority: 'low',
    status: 'backlog',
    dueDate: '2026-10-08',
    estimatedHours: 4,
    tags: ['Design System', 'Onboarding'],
    assigneeId: 'user_elena',
    subtasks: [],
    comments: [],
    createdAt: '2026-09-29T11:00:00Z',
    updatedAt: '2026-09-29T11:00:00Z',
    order: 1
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    taskId: 'TASK-101',
    taskTitle: 'Migrate PostgreSQL replication pool to Multi-AZ read replicas',
    userId: 'user_alex',
    userName: 'Alex Chen',
    action: 'completed subtask "Provision target replica instances in secondary AZ"',
    timestamp: '15 minutes ago'
  },
  {
    id: 'act-2',
    taskId: 'TASK-102',
    taskTitle: 'Design high-density Kanban card micro-interactions',
    userId: 'user_elena',
    userName: 'Elena Rostova',
    action: 'moved task to "In Review"',
    timestamp: '42 minutes ago'
  },
  {
    id: 'act-3',
    taskId: 'TASK-106',
    taskTitle: 'Conduct user interviews on enterprise sprint reporting workflow',
    userId: 'user_david',
    userName: 'David Kalu',
    action: 'marked task as "Done"',
    timestamp: '2 hours ago'
  },
  {
    id: 'act-4',
    taskId: 'TASK-104',
    taskTitle: 'Implement OAuth 2.0 PKCE client flow',
    userId: 'user_sarah',
    userName: 'Sarah Lin',
    action: 'added a note on deadline status',
    timestamp: '4 hours ago'
  }
];
