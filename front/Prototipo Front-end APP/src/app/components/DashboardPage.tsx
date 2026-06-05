import { Paper, Card, CardContent, Chip, Button } from '@mui/material';
import {
  People,
  CheckCircle,
  PendingActions,
  AccessTime,
  TrendingUp,
  Print,
} from '@mui/icons-material';

export function DashboardPage() {
  const stats = {
    totalInterns: 12,
    activeToday: 8,
    pendingApprovals: 3,
    avgWorkHours: '7h 45min',
  };

  const recentActivity = [
    {
      intern: 'Maria Silva',
      action: 'Registrou saída',
      time: '17:30',
      status: 'success',
    },
    {
      intern: 'João Santos',
      action: 'Solicitou desbloqueio de horário',
      time: '16:45',
      status: 'pending',
    },
    {
      intern: 'Ana Costa',
      action: 'Adicionou evento ao calendário',
      time: '15:20',
      status: 'pending',
    },
    {
      intern: 'Pedro Oliveira',
      action: 'Registrou entrada',
      time: '08:30',
      status: 'success',
    },
  ];

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório - Bate Ponto</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #1976d2;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #1976d2;
              font-size: 32px;
              margin-bottom: 10px;
            }
            .header p {
              color: #666;
              font-size: 14px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 40px;
            }
            .stat-card {
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
            }
            .stat-card h3 {
              color: #666;
              font-size: 14px;
              margin-bottom: 10px;
            }
            .stat-card .value {
              font-size: 36px;
              font-weight: bold;
              color: #1976d2;
            }
            .section {
              margin-bottom: 40px;
            }
            .section h2 {
              color: #1976d2;
              font-size: 20px;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }
            .activity-item {
              padding: 15px;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .activity-item .name {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .activity-item .action {
              color: #666;
              font-size: 14px;
            }
            .activity-item .status {
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }
            .status.success {
              background-color: #dcfce7;
              color: #16a34a;
            }
            .status.pending {
              background-color: #fef3c7;
              color: #ca8a04;
            }
            .weekly-stats {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }
            .weekly-stat {
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }
            .weekly-stat.blue { background-color: #dbeafe; }
            .weekly-stat.green { background-color: #dcfce7; }
            .weekly-stat.orange { background-color: #fed7aa; }
            .weekly-stat .value {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .weekly-stat.blue .value { color: #2563eb; }
            .weekly-stat.green .value { color: #16a34a; }
            .weekly-stat.orange .value { color: #ea580c; }
            .weekly-stat .label {
              font-size: 13px;
              color: #666;
            }
            .footer {
              margin-top: 60px;
              text-align: center;
              color: #999;
              font-size: 12px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            @media print {
              body { padding: 20px; }
              .stat-card, .activity-item { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Bate Ponto</h1>
            <p>Relatório de Gestão de Estagiários</p>
            <p>Gerado em: ${currentDate}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total de Estagiários</h3>
              <div class="value">${stats.totalInterns}</div>
            </div>
            <div class="stat-card">
              <h3>Ativos Hoje</h3>
              <div class="value" style="color: #22c55e;">${stats.activeToday}</div>
            </div>
            <div class="stat-card">
              <h3>Aprovações Pendentes</h3>
              <div class="value" style="color: #f97316;">${stats.pendingApprovals}</div>
            </div>
            <div class="stat-card">
              <h3>Média de Horas</h3>
              <div class="value" style="font-size: 24px;">${stats.avgWorkHours}</div>
            </div>
          </div>

          <div class="section">
            <h2>Atividades Recentes</h2>
            ${recentActivity
              .map(
                (activity) => `
              <div class="activity-item">
                <div>
                  <div class="name">${activity.intern}</div>
                  <div class="action">${activity.action} - ${activity.time}</div>
                </div>
                <div class="status ${activity.status}">
                  ${activity.status === 'success' ? 'Concluído' : 'Pendente'}
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          <div class="section">
            <h2>Relatório Semanal</h2>
            <div class="weekly-stats">
              <div class="weekly-stat blue">
                <div class="value">256</div>
                <div class="label">Horas Trabalhadas</div>
              </div>
              <div class="weekly-stat green">
                <div class="value">94%</div>
                <div class="label">Taxa de Presença</div>
              </div>
              <div class="weekly-stat orange">
                <div class="value">7</div>
                <div class="label">Justificativas Aprovadas</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Documento gerado automaticamente pelo sistema Bate Ponto</p>
            <p>Universidade Católica do Salvador - Processos de Negócios - 2026.1</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard - Supervisor</h2>
        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={handlePrintReport}
          sx={{ bgcolor: '#1976d2' }}
        >
          Imprimir Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card elevation={3}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Estagiários</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalInterns}</p>
              </div>
              <People sx={{ fontSize: 48, color: '#1976d2' }} />
            </div>
          </CardContent>
        </Card>

        <Card elevation={3}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ativos Hoje</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeToday}</p>
              </div>
              <CheckCircle sx={{ fontSize: 48, color: '#22c55e' }} />
            </div>
          </CardContent>
        </Card>

        <Card elevation={3}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Aprovações Pendentes</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingApprovals}</p>
              </div>
              <PendingActions sx={{ fontSize: 48, color: '#f97316' }} />
            </div>
          </CardContent>
        </Card>

        <Card elevation={3}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Média de Horas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.avgWorkHours}</p>
              </div>
              <AccessTime sx={{ fontSize: 48, color: '#6366f1' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Paper elevation={3} className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp /> Atividades Recentes
        </h3>

        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <Card key={index} variant="outlined">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{activity.intern}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">{activity.time}</p>
                    <Chip
                      label={activity.status === 'success' ? 'Concluído' : 'Pendente'}
                      color={activity.status === 'success' ? 'success' : 'warning'}
                      size="small"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Paper>

      <Paper elevation={3} className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Relatório Semanal</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">256</p>
            <p className="text-sm text-gray-600 mt-1">Horas Trabalhadas</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">94%</p>
            <p className="text-sm text-gray-600 mt-1">Taxa de Presença</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">7</p>
            <p className="text-sm text-gray-600 mt-1">Justificativas Aprovadas</p>
          </div>
        </div>
      </Paper>
    </div>
  );
}
