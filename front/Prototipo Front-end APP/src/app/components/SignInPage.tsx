"use client";

import { useState } from "react";

import {
  Paper,
  TextField,
  Button,
  Alert,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
} from "@mui/material";

import { PersonAdd } from "@mui/icons-material";
import { register } from "@/lib/api";

export function SignInPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<'intern' | 'supervisor'>('intern');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await register({ nome: name, email, senha: password, role });
      setSuccess("Conta criada com sucesso! Agora faça login.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <Paper elevation={8} className="p-8 max-w-md w-full mx-4">

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <PersonAdd sx={{ fontSize: 32, color: "#1976d2" }} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Criar Conta
          </h1>

          <p className="text-gray-600 mt-2">
            Cadastro de usuário
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <TextField
            fullWidth
            label="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            fullWidth
            label="E-mail Institucional"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TextField
            fullWidth
            label="Confirmar Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            startIcon={<PersonAdd />}
            sx={{ mt: 2, py: 1.5 }}
          >
            Criar Conta
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Protótipo - Atividade Semestral</p>
          <p>Processos de Negócios - 2026.1</p>
        </div>

      </Paper>
    </div>
  );
}