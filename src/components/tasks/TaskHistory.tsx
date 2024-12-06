import { format } from 'date-fns';
import { TaskHistory } from '../../types';
import { Card, CardTitle } from '../Card';

interface TaskHistoryListProps {
  history: TaskHistory[];
}

export default function TaskHistoryList({ history }: TaskHistoryListProps) {
  const getActionColor = (action: TaskHistory['action']) => {
    switch (action) {
      case 'ASSIGNED':
        return 'text-blue-600';
      case 'COMPLETED':
        return 'text-green-600';
      case 'ABANDONED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardTitle>Historia de la Tarea Selecionada</CardTitle>
      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No hay historial disponible</p>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="border-l-2 border-gray-200 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`font-medium ${getActionColor(entry.action)}`}>
                    {entry.action}
                  </span>
                  {entry.previousStatus && entry.newStatus && (
                    <span className="text-sm text-gray-500">
                      : {entry.previousStatus} → {entry.newStatus}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-400">
                  {format(new Date(entry.createdAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              {entry.comment && (
                <p className="mt-1 text-sm text-gray-600">{entry.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}