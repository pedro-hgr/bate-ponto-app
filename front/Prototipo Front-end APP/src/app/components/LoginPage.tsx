import { useState, FormEvent } from 'react';
import { Paper, TextField, Button, Alert } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { login, Usuario } from '@/lib/api';

interface LoginPageProps {
  onLogin: (user: { id: number; name: string; role: 'intern' | 'supervisor' }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Digite seu e-mail.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const user: Usuario = await login({ email: email.trim(), password });
      onLogin({ id: user.id, name: user.nome, role: user.role });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <Paper elevation={8} className="p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <LoginIcon sx={{ fontSize: 32, color: '#1976d2' }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Bate Ponto</h1>
          <p className="text-gray-600 mt-2">Sistema de Controle de Horários e Demandas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
              label="E-mail"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              sx={{ mt: 3, py: 1.5 }}
              disabled={loading}
            >
              Entrar
            </Button>
          </form>
          <p>Processos de Negócios - 2026.1</p>
      </Paper>
    </div>
  );
}
