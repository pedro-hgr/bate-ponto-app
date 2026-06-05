const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_URL = `${API_BASE_URL}/api`;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const text = await response.text();
  if (!response.ok) {
    const errorMessage = text || response.statusText;
    throw new Error(errorMessage);
  }

  if (!text) {
    return null as unknown as T;
  }

  return JSON.parse(text) as T;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'intern' | 'supervisor';
}

export interface RegistroPonto {
  id: number;
  data: string;
  checkIn: string;
  checkOut: string | null;
  observacao?: string | null;
  usuario: { id: number };
}

export interface RegistroPontoRequest {
  usuarioId: number;
  data: string;
  checkIn: string;
  checkOut?: string | null;
  observacao?: string | null;
}

export interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: string;
  status: string;
  attachmentUrl?: string | null;
  usuario: { id: number };
}

export interface EventoRequest {
  usuarioId: number;
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: string;
  status: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  role: 'intern' | 'supervisor';
}

export async function login(payload: LoginRequest): Promise<Usuario> {
  return request<Usuario>('/usuarios/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterRequest): Promise<Usuario> {
  return request<Usuario>('/usuarios/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function getRegistroPontos(usuarioId: number): Promise<RegistroPonto[]> {
  return request<RegistroPonto[]>(`/registro-pontos?usuarioId=${usuarioId}`);
}

export async function createRegistroPonto(payload: RegistroPontoRequest): Promise<RegistroPonto> {
  return request<RegistroPonto>('/registro-pontos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function updateRegistroPonto(id: number, payload: RegistroPontoRequest): Promise<RegistroPonto> {
  return request<RegistroPonto>(`/registro-pontos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function getEventos(usuarioId: number): Promise<Evento[]> {
  return request<Evento[]>(`/eventos?usuarioId=${usuarioId}`);
}

export async function createEvento(payload: EventoRequest, attachment?: File): Promise<Evento> {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  if (attachment) {
    formData.append('attachment', attachment);
  }
  return request<Evento>('/eventos', {
    method: 'POST',
    body: formData,
  });
}

export async function updateEvento(id: number, payload: EventoRequest, attachment?: File): Promise<Evento> {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  if (attachment) {
    formData.append('attachment', attachment);
  }
  return request<Evento>(`/eventos/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

export async function deleteEvento(id: number): Promise<void> {
  await request<void>(`/eventos/${id}`, {
    method: 'DELETE',
  });
}
