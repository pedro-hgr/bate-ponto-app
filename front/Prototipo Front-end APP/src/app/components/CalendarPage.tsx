import { useEffect, useState } from 'react';
import {
  Paper,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Add,
  AttachFile,
  Delete,
  Edit,
  Event,
  Check,
  Close,
} from '@mui/icons-material';
import {
  createEvento,
  deleteEvento,
  Evento,
  getEventos,
  updateEvento,
} from '@/lib/api';

interface CalendarPageProps {
  userRole: 'intern' | 'supervisor';
  userId: number;
}

interface CalendarEventItem {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  attachment?: string | null;
  attachmentUrl?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  type: 'exam' | 'event' | 'appointment' | 'other';
}

function mapEvento(event: Evento): CalendarEventItem {
  return {
    id: event.id,
    date: event.data,
    startTime: event.horaInicio,
    endTime: event.horaFim,
    title: event.titulo,
    description: event.descricao,
    attachment: event.attachmentUrl ? event.attachmentUrl.split('/').pop() : null,
    attachmentUrl: event.attachmentUrl ?? null,
    status: event.status as CalendarEventItem['status'],
    type: event.tipo as CalendarEventItem['type'],
  };
}

export function CalendarPage({ userRole, userId }: CalendarPageProps) {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventItem | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    title: '',
    description: '',
    type: 'other' as CalendarEventItem['type'],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEvents() {
      setError('');
      try {
        const result = await getEventos(userId);
        setEvents(result.map(mapEvento));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar eventos.');
      }
    }

    if (userId) {
      loadEvents();
    }
  }, [userId]);

  const handleOpenDialog = (event?: CalendarEventItem) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        title: event.title,
        description: event.description,
        type: event.type,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        title: '',
        description: '',
        type: 'other',
      });
    }
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    setSelectedFile(null);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    try {
      if (editingEvent) {
        const updated = await updateEvento(editingEvent.id, {
          usuarioId: userId,
          titulo: formData.title,
          descricao: formData.description,
          data: formData.date,
          horaInicio: formData.startTime,
          horaFim: formData.endTime,
          tipo: formData.type,
          status: editingEvent.status,
        }, selectedFile || undefined);

        setEvents((prev) =>
          prev.map((event) => (event.id === updated.id ? mapEvento(updated) : event))
        );
      } else {
        const created = await createEvento(
          {
            usuarioId: userId,
            titulo: formData.title,
            descricao: formData.description,
            data: formData.date,
            horaInicio: formData.startTime,
            horaFim: formData.endTime,
            tipo: formData.type,
            status: 'pending',
          },
          selectedFile || undefined
        );

        setEvents((prev) => [mapEvento(created), ...prev]);
      }
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar evento.');
    }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try {
      await deleteEvento(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir evento.');
    }
  };

  const handleApprove = async (id: number) => {
    setError('');
    const event = events.find((item) => item.id === id);
    if (!event) return;

    try {
      const updated = await updateEvento(event.id, {
        usuarioId: userId,
        titulo: event.title,
        descricao: event.description,
        data: event.date,
        horaInicio: event.startTime,
        horaFim: event.endTime,
        tipo: event.type,
        status: 'approved',
      });
      setEvents((prev) => prev.map((item) => (item.id === updated.id ? mapEvento(updated) : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar evento.');
    }
  };

  const handleReject = async (id: number) => {
    setError('');
    const event = events.find((item) => item.id === id);
    if (!event) return;

    try {
      const updated = await updateEvento(event.id, {
        usuarioId: userId,
        titulo: event.title,
        descricao: event.description,
        data: event.date,
        horaInicio: event.startTime,
        horaFim: event.endTime,
        tipo: event.type,
        status: 'rejected',
      });
      setEvents((prev) => prev.map((item) => (item.id === updated.id ? mapEvento(updated) : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rejeitar evento.');
    }
  };

  const getEventTypeLabel = (type: CalendarEventItem['type']) => {
    const labels = {
      exam: 'Prova',
      event: 'Evento',
      appointment: 'Compromisso',
      other: 'Outro',
    };
    return labels[type];
  };

  const getStatusColor = (status: CalendarEventItem['status']) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
    };
    return colors[status] as 'warning' | 'success' | 'error';
  };

  const getStatusLabel = (status: CalendarEventItem['status']) => {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
    };
    return labels[status];
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Event /> Calendário de Eventos
        </h2>
        {userRole === 'intern' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Novo Evento
          </Button>
        )}
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      {userRole === 'intern' && (
        <Alert severity="info">
          Registre aqui provas, eventos acadêmicos ou compromissos que afetarão seu horário de
          trabalho. Não esqueça de anexar documentos comprobatórios.
        </Alert>
      )}

      <div className="space-y-4">
        {sortedEvents.map((event) => (
          <Card key={event.id} elevation={3}>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                    <Chip
                      label={getEventTypeLabel(event.type)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p>
                      <strong>Data:</strong>{' '}
                      {new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p>
                      <strong>Horário:</strong> {event.startTime} - {event.endTime}
                    </p>
                    <p>
                      <strong>Descrição:</strong> {event.description}
                    </p>
                    {event.attachment && (
                      <p className="flex items-center gap-1">
                        <AttachFile sx={{ fontSize: 16 }} />
                        <strong>Anexo:</strong>{' '}
                        {event.attachmentUrl ? (
                          <a
                            href={event.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {event.attachment}
                          </a>
                        ) : (
                          event.attachment
                        )}
                      </p>
                    )}
                  </div>

                  <Chip
                    label={getStatusLabel(event.status)}
                    color={getStatusColor(event.status)}
                    size="small"
                  />
                </div>

                <div className="flex gap-2">
                  {userRole === 'supervisor' && event.status === 'pending' && (
                    <>
                      <IconButton
                        color="success"
                        onClick={() => handleApprove(event.id)}
                        title="Aprovar"
                      >
                        <Check />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleReject(event.id)}
                        title="Rejeitar"
                      >
                        <Close />
                      </IconButton>
                    </>
                  )}

                  {userRole === 'intern' && event.status === 'pending' && (
                    <>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(event)}
                        title="Editar"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(event.id)}
                        title="Excluir"
                      >
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedEvents.length === 0 && (
          <Paper className="p-12 text-center">
            <Event sx={{ fontSize: 64, color: 'gray', mb: 2 }} />
            <p className="text-gray-600">Nenhum evento registrado</p>
          </Paper>
        )}
      </div>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <TextField
              fullWidth
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <TextField
              fullWidth
              select
              label="Tipo"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as CalendarEventItem['type'] })
              }
              SelectProps={{ native: true }}
            >
              <option value="exam">Prova</option>
              <option value="event">Evento Acadêmico</option>
              <option value="appointment">Compromisso</option>
              <option value="other">Outro</option>
            </TextField>

            <TextField
              fullWidth
              type="date"
              label="Data"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                type="time"
                label="Hora Início"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />

              <TextField
                fullWidth
                type="time"
                label="Hora Fim"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </div>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explique o motivo deste compromisso..."
              required
            />

            <div>
              <Button variant="outlined" component="label" startIcon={<AttachFile />}>
                {selectedFile ? selectedFile.name : 'Anexar Comprovante'}
                <input
                  type="file"
                  hidden
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </Button>
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !formData.title ||
              !formData.date ||
              !formData.startTime ||
              !formData.endTime ||
              !formData.description
            }
          >
            {editingEvent ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
