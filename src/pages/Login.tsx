import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { auth } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card, CardTitle } from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const mutation = useMutation({
    mutationFn: () => auth.login(email, password),
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
        <CardTitle>Ingrese a su cuenta</CardTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </Button>
          {mutation.isError && (
            <p className="text-sm text-red-600">Credenciales inválidas. Por favor, inténtelo de nuevo.</p>
          )}
        </form>
      </Card>
    </div>
  );
}