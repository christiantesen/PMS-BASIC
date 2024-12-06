import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  role: text('role', { enum: ['ADMIN', 'MANAGER', 'DEVELOPER'] }).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  status: text('status', { enum: ['PLANNING', 'IN_PROGRESS', 'COMPLETED'] }).notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  managerId: integer('manager_id').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status', { enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] }).notNull(),
  priority: text('priority', { enum: ['LOW', 'MEDIUM', 'HIGH'] }).notNull(),
  projectId: integer('project_id').references(() => projects.id),
  assigneeId: integer('assignee_id').references(() => users.id),
  dueDate: text('due_date'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const taskHistory = sqliteTable('task_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').references(() => tasks.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action', { enum: ['ASSIGNED', 'UPDATED', 'COMPLETED', 'ABANDONED'] }).notNull(),
  previousStatus: text('previous_status'),
  newStatus: text('new_status'),
  comment: text('comment'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});