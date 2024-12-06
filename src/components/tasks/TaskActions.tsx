import { useState } from 'react';
import { Task } from '../../types';
import Button from '../Button';
import { Dialog } from '../Dialog';
import AssignTaskDialog from './AssignTaskDialog';
import { useAuth } from '../../context/AuthContext';

interface TaskActionsProps {
  task: Task;
  onStatusChange: (status: Task['status'], comment: string) => void;
  onAbandon: (comment: string) => void;
  onAssign: (userId: number, comment: string) => void;
}

export default function TaskActions({
  task,
  onStatusChange,
  onAbandon,
  onAssign,
}: TaskActionsProps) {
  const { user } = useAuth();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [comment, setComment] = useState('');

  const nextStatus: Record<Task['status'], Task['status']> = {
    TODO: 'IN_PROGRESS',
    IN_PROGRESS: 'REVIEW',
    REVIEW: 'DONE',
    DONE: 'DONE',
  };

  const handleStatusChange = () => {
    onStatusChange(nextStatus[task.status], comment);
    setShowStatusDialog(false);
    setComment('');
  };

  const handleAbandon = () => {
    onAbandon(comment);
    setShowAbandonDialog(false);
    setComment('');
  };

  const canAssignTasks = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="flex flex-wrap justify-end gap-2 mt-4">
      {canAssignTasks && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowAssignDialog(true)}
        >
          {task.assigneeId ? 'Volver a Asignar' : 'Asignar'} Tarea
        </Button>
      )}

      {task.status !== 'DONE' && (
        <Button size="sm" onClick={() => setShowStatusDialog(true)}>
          Mover a {nextStatus[task.status].replace('_', ' ')}
        </Button>
      )}

      <Button
        size="sm"
        variant="danger"
        onClick={() => setShowAbandonDialog(true)}
      >
        Abandonar Tarea
      </Button>

      <AssignTaskDialog
        isOpen={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        onAssign={onAssign}
        currentAssigneeId={task.assigneeId}
      />

      <Dialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        title="Update Task Status"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Comentario (Opcional)
            </label>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Agregue cualquier detalle relevante sobre este cambio de estado..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleStatusChange}>
              Actualizar Estado
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={showAbandonDialog}
        onClose={() => setShowAbandonDialog(false)}
        title="Abandon Task"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Este seguro de abandonar esta tarea? Por favor proporcione una razón:
          </p>
          <div className="space-y-2">
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explica por qué estás abandonando esta tarea..."
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowAbandonDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleAbandon}
              disabled={!comment}
            >
              Abandonar Tarea
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}