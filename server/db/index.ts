import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });


// Función para crear las tablas
const createTables = () => {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('ADMIN', 'MANAGER', 'DEVELOPER')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;
  
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('PLANNING', 'IN_PROGRESS', 'COMPLETED')),
        start_date TEXT NOT NULL,
        end_date TEXT,
        manager_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES users(id)
      );
    `;
  
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')),
        priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
        project_id INTEGER,
        assignee_id INTEGER,
        due_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (assignee_id) REFERENCES users(id)
      );
    `;
  
    const createTaskHistoryTable = `
      CREATE TABLE IF NOT EXISTS task_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        user_id INTEGER,
        action TEXT NOT NULL CHECK(action IN ('ASSIGNED', 'UPDATED', 'COMPLETED', 'ABANDONED')),
        previous_status TEXT,
        new_status TEXT,
        comment TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;
  
    // Ejecutar las sentencias para crear las tablas
    sqlite.prepare(createUsersTable).run();
    sqlite.prepare(createProjectsTable).run();
    sqlite.prepare(createTasksTable).run();
    sqlite.prepare(createTaskHistoryTable).run();
  
    console.log('Tables created successfully!');
  };
  
  // Llamar la función para crear las tablas
  createTables();