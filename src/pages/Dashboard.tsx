import { useQuery } from '@tanstack/react-query';
import { projects } from '../api';
import { Card, CardTitle } from '../components/Card';
import { BarChart3, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { data: projectsList } = useQuery({
    queryKey: ['projects'],
    queryFn: projects.getAll,
  });

  const stats = {
    total: projectsList?.length ?? 0,
    completed: projectsList?.filter((p) => p.status === 'COMPLETED').length ?? 0,
    inProgress: projectsList?.filter((p) => p.status === 'IN_PROGRESS').length ?? 0,
    planning: projectsList?.filter((p) => p.status === 'PLANNING').length ?? 0,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Projectos</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Completos</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">En Progreso</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Planificación</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.planning}</p>
          </div>
        </Card>
      </div>

      {projectsList && projectsList.length > 0 ? (
        <Card>
          <CardTitle>Proyectos Recientes</CardTitle>
          <div className="divide-y divide-gray-200">
            {projectsList.slice(0, 5).map((project) => (
              <div key={project.id} className="py-4">
                <h4 className="text-lg font-medium text-gray-900">{project.name}</h4>
                <p className="text-sm text-gray-500">{project.description}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Estado: {project.status}</span>
                  <span className="text-sm text-gray-500">
                    Fecha de Inicio: {new Date(project.startDate).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    Fecha de Fin: {new Date(project.endDate!).toLocaleDateString() || 'No definida'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-center text-gray-500">No se encontraron proyectos</p>
        </Card>
      )}
    </div>
  );
}