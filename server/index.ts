import express from "express";
import { db } from "./db";
import { users, projects, tasks, taskHistory } from "./db/schema";
import { eq, or, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import cors from "cors"; // Importar cors

const app = express();

// Usar CORS
app.use(cors()); // Esto permitirá todas las solicitudes de cualquier origen.

app.use(express.json());

const JWT_SECRET = "your-secret-key";

// Middleware to verify JWT token and attach user role
const auth = asyncHandler(async (req: any, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "Please authenticate" });
  } else {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId));
      if (!user) {
        throw new Error();
      }
      req.userId = decoded.userId;
      req.userRole = user.role;
      next();
    } catch (error) {
      res.status(401).json({ error: "Please authenticate" });
      console.log(error);
    }
  }

  
});

// Role-based middleware
const checkRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.userRole)) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    next();
  };
};

// Auth routes
app.post(
  "/api/auth/register",
  asyncHandler(async (req, res) => {
    const { email, password, name, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        role,
      })
      .returning();

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ user, token });
  })
);

app.post(
  "/api/auth/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ user, token });
  })
);

// Projects routes
app.get(
  "/api/projects",
  auth,
  asyncHandler(async (req: any, res) => {
    // Developers can only see projects they're assigned to
    if (req.userRole === "DEVELOPER") {
      const assignedTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.assigneeId, req.userId));
      const projectIds = [
        ...new Set(assignedTasks.map((t) => t.projectId)),
      ].filter((id) => id !== null);
      if (projectIds.length > 0) {
        const projectsList = await db
          .select()
          .from(projects)
          .where(inArray(projects.id, projectIds));
        res.json(projectsList);
      } else {
        // Si no hay projectIds, devolver una lista vacía
        res.json([]);
      }
    } else {
      const projectsList = await db.select().from(projects);
      res.json(projectsList);
    }
  })
);

app.post(
  "/api/projects",
  auth,
  checkRole(["ADMIN", "MANAGER"]),
  asyncHandler(async (req: any, res) => {
    const { name, description, status, startDate, endDate } = req.body;
    const [project] = await db
      .insert(projects)
      .values({
        name,
        description,
        status,
        startDate,
        endDate,
        managerId: req.userId,
      })
      .returning();
    res.json(project);
  })
);

// Tasks routes
app.get(
  "/api/projects/:projectId/tasks",
  auth,
  asyncHandler(async (req: any, res) => {
    const { projectId } = req.params;
    const tasksList = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, parseInt(projectId)));
    res.json(tasksList);
  })
);

app.post(
  "/api/projects/:projectId/tasks",
  auth,
  checkRole(["ADMIN", "MANAGER"]),
  asyncHandler(async (req: any, res) => {
    const { projectId } = req.params;
    const { title, description, status, priority, assigneeId, dueDate } =
      req.body;
    const [task] = await db
      .insert(tasks)
      .values({
        title,
        description,
        status,
        priority,
        projectId: parseInt(projectId),
        assigneeId,
        dueDate,
      })
      .returning();
    if (assigneeId) {
      const user_data = await db
        .select()
        .from(users)
        .where(eq(users.id, assigneeId));
      await db.insert(taskHistory).values({
        taskId: task.id,
        userId: req.userId,
        action: "ASSIGNED",
        newStatus: status,
        comment: `Tarea asignada al usuario ${user_data[0].name} cumpliendo con el rol de ${user_data[0].role}`,
      });
    }

    res.json(task);
  })
);

// Task assignment and status routes
app.post(
  "/api/tasks/:taskId/assign",
  auth,
  checkRole(["ADMIN", "MANAGER"]),
  asyncHandler(async (req: any, res) => {
    const { taskId } = req.params;
    const { assigneeId } = req.body;

    const [task] = await db
      .update(tasks)
      .set({ assigneeId })
      .where(eq(tasks.id, parseInt(taskId)))
      .returning();

    const user_data = await db
      .select()
      .from(users)
      .where(eq(users.id, assigneeId));
    await db.insert(taskHistory).values({
      taskId: parseInt(taskId),
      userId: req.userId,
      action: "ASSIGNED",
      comment: `Tarea asignada al usuario ${user_data[0].name} cumpliendo con el rol de ${user_data[0].role}`,
    });

    res.json(task);
  })
);

app.post(
  "/api/tasks/:taskId/status",
  auth,
  asyncHandler(async (req: any, res) => {
    const { taskId } = req.params;
    const { status, comment } = req.body;

    const [currentTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(taskId)));

    // Only assigned developer, manager, or admin can update status
    if (req.userRole === "DEVELOPER" && currentTask.assigneeId !== req.userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const [task] = await db
      .update(tasks)
      .set({ status })
      .where(eq(tasks.id, parseInt(taskId)))
      .returning();

    await db.insert(taskHistory).values({
      taskId: parseInt(taskId),
      userId: req.userId,
      action: status === "DONE" ? "COMPLETED" : "UPDATED",
      previousStatus: currentTask.status,
      newStatus: status,
      comment,
    });

    res.json(task);
  })
);

app.post(
  "/api/tasks/:taskId/abandon",
  auth,
  asyncHandler(async (req: any, res) => {
    const { taskId } = req.params;
    const { comment } = req.body;

    const [currentTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(taskId)));

    // Only assigned developer can abandon task
    if (req.userRole === "DEVELOPER" && currentTask.assigneeId !== req.userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const [task] = await db
      .update(tasks)
      .set({ assigneeId: null, status: "TODO" })
      .where(eq(tasks.id, parseInt(taskId)))
      .returning();

    await db.insert(taskHistory).values({
      taskId: parseInt(taskId),
      userId: req.userId,
      action: "ABANDONED",
      previousStatus: currentTask.status,
      newStatus: "TODO",
      comment,
    });

    res.json(task);
  })
);

// Task history routes
app.get(
  "/api/tasks/:taskId/history",
  auth,
  asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const history = await db
      .select()
      .from(taskHistory)
      .where(eq(taskHistory.taskId, parseInt(taskId)));
    res.json(history);
  })
);

// Users routes (MANAGER and ADMIN only)
app.get(
  "/api/users",
  auth,
  checkRole(["MANAGER", "ADMIN"]),
  asyncHandler(async (_, res) => {
    // Returns Manager and Developer roles
    const usersList = await db
      .select()
      .from(users)
      .where(or(eq(users.role, "MANAGER"), eq(users.role, "DEVELOPER")));
    res.json(usersList);
  })
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
