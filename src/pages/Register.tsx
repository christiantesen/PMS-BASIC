import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { auth } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card, CardTitle } from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { User } from '../types';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<User['role']>('DEVELOPER');

  const mutation = useMutation({
    mutationFn: () => auth.register(email, password, name, role),
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardTitle>Crear Nueva Cuenta</CardTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Rol de Usuario
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as User['role'])}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="DEVELOPER">Desarrollador</option>
              <option value="MANAGER">Gerente</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creando Cuenta...' : 'Registrarse'}
          </Button>
          {mutation.isError && (
            <p className="text-sm text-red-600">Hubo un error al crear la cuenta. Por favor, inténtelo de nuevo.</p>
          )}
        </form>
      </Card>
    </div>
  );
}