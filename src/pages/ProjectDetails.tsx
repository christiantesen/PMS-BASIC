import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Calendar, Clock, Users } from 'lucide-react';
import { projects, tasks } from '../api';
import { Card, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import TaskCard from '../components/tasks/TaskCard';
import TaskHistory from '../components/tasks/TaskHistory';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isCreatingTask, setIsCreatingTask] = React.useState(false);
  const [selectedTaskId, setSelectedTaskId] = React.useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projects.getAll().then(projects => 
      projects.find(p => p.id === parseInt(id!))
    ),
  });

  const { data: projectTasks } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasks.getByProject(parseInt(id!)),
    enabled: !!id,
  });

  const { data: taskHistory } = useQuery({
    queryKey: ['taskHistory', selectedTaskId],
    queryFn: () => selectedTaskId ? tasks.getHistory(selectedTaskId) : null,
    enabled: !!selectedTaskId,
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData: Omit<Task, 'id' | 'createdAt' | 'projectId'>) =>
      tasks.create(parseInt(id!), taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      setIsCreatingTask(false);
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status, comment }: { taskId: number; status: Task['status']; comment: string }) =>
      tasks.updateStatus(taskId, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['taskHistory', selectedTaskId] });
    },
  });

  const abandonTaskMutation = useMutation({
    mutationFn: ({ taskId, comment }: { taskId: number; comment: string }) =>
      tasks.abandon(taskId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['taskHistory', selectedTaskId] });
    },
  });

  const assignTaskMutation = useMutation({
    mutationFn: ({ taskId, userId, comment }: { taskId: number; userId: number; comment: string }) =>
      tasks.assign(taskId, userId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['taskHistory', selectedTaskId] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createTaskMutation.mutate({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: 'TODO',
      priority: formData.get('priority') as Task['priority'],
      assigneeId: null,
      dueDate: formData.get('dueDate') as string || null,
    });
  };

  const canManageTask = (task: Task) => {
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') return true;
    return user?.role === 'DEVELOPER' && task.assigneeId === user.id;
  };

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{project.description}</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <Button onClick={() => setIsCreatingTask(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Tarea
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha de Inicio</p>
              <p className="text-sm text-gray-900">
                {format(new Date(project.startDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha de Fin</p>
              <p className="text-sm text-gray-900">
                {project.endDate 
                  ? format(new Date(project.endDate), 'MMM d, yyyy')
                  : 'No definida'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Tareas</p>
              <p className="text-sm text-gray-900">
                {projectTasks?.length || 0} total
              </p>
            </div>
          </div>
        </Card>
      </div>

      {isCreatingTask && (
        <Card>
          <CardTitle>Crear Nueva Tarea</CardTitle>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Titulo de la Tarea"
              name="title"
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="description"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Prioridad
                </label>
                <select
                  name="priority"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>
              <Input
                label="Fecha de Vencimiento (Opcional)"
                name="dueDate"
                type="date"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCreatingTask(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? 'Creando...' : 'Crear Tarea'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as Task['status'][]).map(status => (
          <div key={status} className="space-y-4">
            <h3 className="font-medium text-gray-900">
              {status.replace('_', ' ')}
            </h3>
            <div className="space-y-3">
              {projectTasks
                ?.filter(task => task.status === status)
                .map(task => (
                  <div key={task.id} onClick={() => setSelectedTaskId(task.id)}>
                    <TaskCard
                      task={task}
                      canManage={canManageTask(task)}
                      onStatusChange={(newStatus, comment) => {
                        updateTaskStatusMutation.mutate({
                          taskId: task.id,
                          status: newStatus,
                          comment,
                        });
                      }}
                      onAbandon={(comment) => {
                        abandonTaskMutation.mutate({
                          taskId: task.id,
                          comment,
                        });
                      }}
                      onAssign={(userId, comment) => {
                        assignTaskMutation.mutate({
                          taskId: task.id,
                          userId,
                          comment,
                        });
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTaskId && taskHistory && (
        <TaskHistory history={taskHistory} />
      )}
    </div>
  );
}