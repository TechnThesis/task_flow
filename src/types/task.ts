export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type ColumnId = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedHours?: number;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: ColumnId;
  dueDate: string; // YYYY-MM-DD
  estimatedHours: number;
  tags: string[];
  assigneeId: string;
  subtasks: Subtask[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarColor: string;
  status: 'active' | 'in-meeting' | 'offline';
  department: 'Engineering' | 'Design' | 'Product' | 'Operations';
}

export interface ActivityLog {
  id: string;
  taskId?: string;
  taskTitle?: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface ColumnDefinition {
  id: ColumnId;
  title: string;
  description: string;
  color: string;
}

export interface BoardFilter {
  search: string;
  priority: string;
  tag: string;
  assigneeId: string;
  onlyMyTasks: boolean;
}
