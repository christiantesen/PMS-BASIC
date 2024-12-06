import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '../Dialog';
import Button from '../Button';
import { users } from '../../api';

interface AssignTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: number, comment: string) => void;
  currentAssigneeId?: number | null;
}

export default function AssignTaskDialog({
  isOpen,
  onClose,
  onAssign,
  currentAssigneeId,
}: AssignTaskDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    currentAssigneeId || undefined
  );
  const [comment, setComment] = useState('');

  const { data: usersList } = useQuery({
    queryKey: ['users'],
    queryFn: users.getAll,
  });

  const handleAssign = () => {
    if (selectedUserId) {
      onAssign(selectedUserId, comment);
      setComment('');
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Assign Task">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Asignar a
          </label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
            required
          >
            <option value="">Seleccione un Usuario</option>
            {usersList?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Comentario (Opcional)
          </label>
          <textarea
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Agregue cualquier detalle relevante sobre esta tarea..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={!selectedUserId}>
            Asignar Tarea
          </Button>
        </div>
      </div>
    </Dialog>
  );
}