import { format } from 'date-fns';
import { Clock, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { Card } from '../Card';
import TaskActions from './TaskActions';

interface TaskCardProps {
  task: Task;
  onStatusChange: (status: Task['status'], comment: string) => void;
  onAbandon: (comment: string) => void;
  onAssign: (userId: number, comment: string) => void;
  canManage: boolean;
}

export default function TaskCard({
  task,
  onStatusChange,
  onAbandon,
  onAssign,
  canManage
}: TaskCardProps) {
  const priorityColors = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800',
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-900">{task.title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      
      <p className="text-sm text-gray-500">{task.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        {task.dueDate && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>Vencimiento: {format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        )}
        {task.assigneeId === null && (
          <div className="flex items-center text-yellow-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>Sin Asignar</span>
          </div>
        )}
      </div>

      {canManage && (
        <TaskActions
          task={task}
          onStatusChange={onStatusChange}
          onAbandon={onAbandon}
          onAssign={onAssign}
        />
      )}
    </Card>
  );
}