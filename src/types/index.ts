export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER';
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate: string;
  endDate: string | null;
  createdAt: string;
  managerId: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  projectId: number;
  assigneeId: number | null;
  dueDate: string | null;
  createdAt: string;
}

export interface TaskHistory {
  id: number;
  taskId: number;
  userId: number;
  action: 'ASSIGNED' | 'UPDATED' | 'COMPLETED' | 'ABANDONED';
  previousStatus?: string;
  newStatus?: string;
  comment?: string;
  createdAt: string;
  user?: User;
}