import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Calendar, Clock } from 'lucide-react';
import { projects } from '../api';
import { Card, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Project } from '../types';

export default function Projects() {
  const [isCreating, setIsCreating] = React.useState(false);
  const queryClient = useQueryClient();
  
  const { data: projectsList, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projects.getAll,
  });

  const createMutation = useMutation({
    mutationFn: projects.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreating(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: 'PLANNING',
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardTitle>Crear Proyecto</CardTitle>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre"
              name="name"
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
              <Input
                label="Fecha de Inicio"
                name="startDate"
                type="date"
                required
              />
              <Input
                label="Fecha de Fin (Opcional)"
                name="endDate"
                type="date"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCreating(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Proyecto'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center">Cargando proyectos...</div>
      ) : projectsList && projectsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsList.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-gray-500">No hay proyectos disponibles</p>
        </Card>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusColors = {
    PLANNING: 'bg-purple-100 text-purple-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
  };

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
              {project.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {format(new Date(project.startDate), 'MMM d, yyyy')}
            </div>
            {project.endDate && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {format(new Date(project.endDate), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}