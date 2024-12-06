import axios from 'axios';
import { User, Project, Task, TaskHistory } from '../types';

const api = axios.create({
  baseURL: 'https://pms-basic.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (email: string, password: string, name: string, role: User['role']) => {
    const { data } = await api.post('/auth/register', { email, password, name, role });
    return data;
  },
};

export const users = {
  getAll: async () => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },
};

export const projects = {
  getAll: async () => {
    const { data } = await api.get<Project[]>('/projects');
    return data;
  },
  create: async (project: Omit<Project, 'id' | 'createdAt' | 'managerId'>) => {
    const { data } = await api.post<Project>('/projects', project);
    return data;
  },
};

export const tasks = {
  getByProject: async (projectId: number) => {
    const { data } = await api.get<Task[]>(`/projects/${projectId}/tasks`);
    return data;
  },
  create: async (projectId: number, task: Omit<Task, 'id' | 'createdAt' | 'projectId'>) => {
    const { data } = await api.post<Task>(`/projects/${projectId}/tasks`, task);
    return data;
  },
  assign: async (taskId: number, userId: number, comment?: string) => {
    const { data } = await api.post<Task>(`/tasks/${taskId}/assign`, { assigneeId: userId, comment });
    return data;
  },
  updateStatus: async (taskId: number, status: Task['status'], comment?: string) => {
    const { data } = await api.post<Task>(`/tasks/${taskId}/status`, { status, comment });
    return data;
  },
  abandon: async (taskId: number, comment?: string) => {
    const { data } = await api.post<Task>(`/tasks/${taskId}/abandon`, { comment });
    return data;
  },
  getHistory: async (taskId: number) => {
    const { data } = await api.get<TaskHistory[]>(`/tasks/${taskId}/history`);
    return data;
  },
};