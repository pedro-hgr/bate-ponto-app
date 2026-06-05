import { useEffect, useState } from 'react';
import {
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Lock,
  LockOpen,
  Schedule,
} from '@mui/icons-material';
import {
  createRegistroPonto,
  getRegistroPontos,
  RegistroPonto,
  updateRegistroPonto,
} from '@/lib/api';

interface FrequencyPageProps {
  userRole: 'intern' | 'supervisor';
  userId: number;
}

interface TimeRecord {
  id: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  observacao?: string | null;
  locked: boolean;
  approved: boolean;
}

function mapRegistroPonto(record: RegistroPonto): TimeRecord {
  return {
    id: record.id,
    date: record.data,
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    observacao: record.observacao ?? null,
    locked: Boolean(record.checkOut),
    approved: true,
  };
}

export function FrequencyPage({ userRole, userId }: FrequencyPageProps) {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [currentCheckIn, setCurrentCheckIn] = useState<string | null>(null);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [unlockReason, setUnlockReason] = useState('');
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = records.find((r) => r.date === today);
  const isTodayOpen = todayRecord ? !todayRecord.checkOut : false;

  useEffect(() => {
    async function loadRecords() {
      setError('');
      try {
        const data = await getRegistroPontos(userId);
        const mapped = data.map(mapRegistroPonto);
        setRecords(mapped);
        const openRecord = mapped.find((r) => r.date === today && !r.checkOut);
        setCurrentCheckIn(openRecord?.checkIn ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar registros.');
      }
    }

    if (userId) {
      loadRecords();
    }
  }, [userId, today]);

  const handleCheckIn = async () => {
    if (todayRecord && !todayRecord.checkOut) {
      setError('Já existe um ponto aberto para hoje.');
      return;
    }

    const now = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      const record = await createRegistroPonto({
        usuarioId: userId,
        data: today,
        checkIn: now,
        checkOut: null,
        observacao: '',
      });
      setRecords((prev) => [mapRegistroPonto(record), ...prev.filter((r) => r.date !== today)]);
      setCurrentCheckIn(now);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar entrada.');
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) return;

    const now = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      const updated = await updateRegistroPonto(todayRecord.id, {
        usuarioId: userId,
        data: todayRecord.date,
        checkIn: todayRecord.checkIn ?? now,
        checkOut: now,
        observacao: todayRecord.observacao ?? '',
      });
      setRecords((prev) =>
        prev.map((r) =>
          r.id === updated.id
            ? { ...mapRegistroPonto(updated), locked: true, approved: true }
            : r
        )
      );
      setCurrentCheckIn(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar saída.');
    }
  };

  const handleUnlockRequest = (index: number) => {
    setSelectedRecord(index);
    setUnlockDialogOpen(true);
  };

  const handleUnlock = () => {
    if (selectedRecord !== null) {
      setRecords((prev) =>
        prev.map((r, i) =>
          i === selectedRecord ? { ...r, locked: false } : r
        )
      );
      setUnlockDialogOpen(false);
      setUnlockReason('');
      setSelectedRecord(null);
    }
  };

  const handleTimeChange = async (index: number, field: 'checkIn' | 'checkOut', value: string) => {
    const record = records[index];
    if (!record || record.locked) return;

    const updated = { ...record, [field]: value };
    setRecords((prev) => prev.map((r, i) => (i === index ? updated : r)));

    try {
      const response = await updateRegistroPonto(record.id, {
        usuarioId: userId,
        data: record.date,
        checkIn: field === 'checkIn' ? value : record.checkIn ?? '',
        checkOut: field === 'checkOut' ? value : record.checkOut,
        observacao: record.observacao ?? '',
      });
      setRecords((prev) => prev.map((r) => (r.id === response.id ? mapRegistroPonto(response) : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar horário.');
    }
  };

  const calculateWorkHours = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return '0h 00min';

    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);

    const totalMinutes = outH * 60 + outM - (inH * 60 + inM);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  };

  return (
    <div className="space-y-6">
      <Card elevation={3}>
        <CardContent>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Schedule /> Registro de Ponto - Hoje
          </h2>

          {!currentCheckIn && !todayRecord ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Você ainda não registrou entrada hoje</p>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={handleCheckIn}
                sx={{ px: 6, py: 2 }}
              >
                Registrar Entrada
              </Button>
            </div>
          ) : currentCheckIn ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <Chip
                  label={`Entrada: ${currentCheckIn}`}
                  color="success"
                  size="medium"
                  sx={{ fontSize: '1.1rem', py: 3, px: 2 }}
                />
              </div>
              <p className="text-gray-600 mb-4">Você está trabalhando</p>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<Stop />}
                onClick={handleCheckOut}
                sx={{ px: 6, py: 2 }}
              >
                Registrar Saída
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Alert severity="success" sx={{ mb: 3 }}>
                Ponto registrado com sucesso!
              </Alert>
              <div className="space-y-2">
                <Chip
                  label={`Entrada: ${todayRecord?.checkIn}`}
                  color="success"
                  size="medium"
                />
                <Chip
                  label={`Saída: ${todayRecord?.checkOut}`}
                  color="error"
                  size="medium"
                />
                <div className="mt-3">
                  <p className="text-lg font-semibold text-gray-700">
                    Total: {calculateWorkHours(todayRecord?.checkIn || null, todayRecord?.checkOut || null)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Paper elevation={3} className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Histórico de Registros</h3>

        <div className="space-y-3">
          {records.map((record, index) => (
            <Card key={record.id} variant="outlined">
              <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr] items-start">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div>
                      <p className="text-sm text-gray-500">Dia</p>
                      <p className="text-lg font-semibold text-gray-900">{record.date}</p>
                    </div>
                    <Chip
                      label={record.locked ? 'Bloqueado' : 'Aberto'}
                      color={record.locked ? 'default' : 'primary'}
                      size="small"
                    />
                  </div>

                  <TextField
                    fullWidth
                    label="Entrada"
                    value={record.checkIn ?? ''}
                    onChange={(e) => handleTimeChange(index, 'checkIn', e.target.value)}
                    disabled={record.locked}
                    type="time"
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    fullWidth
                    label="Saída"
                    value={record.checkOut ?? ''}
                    onChange={(e) => handleTimeChange(index, 'checkOut', e.target.value)}
                    disabled={record.locked}
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mt: 2 }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Horas</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {calculateWorkHours(record.checkIn, record.checkOut)}
                      </p>
                    </div>
                    <Chip
                      label={record.approved ? 'Aprovado' : 'Pendente'}
                      color={record.approved ? 'success' : 'warning'}
                      size="small"
                    />
                  </div>

                  {userRole === 'supervisor' && record.locked && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<LockOpen />}
                      onClick={() => handleUnlockRequest(index)}
                    >
                      Desbloquear Registro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Paper>

      <Dialog open={unlockDialogOpen} onClose={() => setUnlockDialogOpen(false)}>
        <DialogTitle>Solicitar desbloqueio</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Motivo"
            value={unlockReason}
            onChange={(e) => setUnlockReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnlockDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUnlock} disabled={!unlockReason.trim()}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
