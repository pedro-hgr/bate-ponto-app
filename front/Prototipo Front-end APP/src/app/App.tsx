import { useState } from 'react';
import { FrequencyPage } from './components/FrequencyPage';
import { CalendarPage } from './components/CalendarPage';
import { DashboardPage } from './components/DashboardPage';
import { LoginPage } from './components/LoginPage';
import { SignInPage } from './components/SignInPage';
import { AppBar, Tabs, Tab, Box, Container, IconButton, Menu, MenuItem, Avatar, Divider, ListItemIcon, Button } from '@mui/material';
import { AccessTime, CalendarMonth, Dashboard as DashboardIcon, Logout } from '@mui/icons-material';

export default function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [user, setUser] = useState<{ id: number; name: string; role: 'intern' | 'supervisor' } | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setUser(null);
    setAnchorEl(null);
    setCurrentTab(0);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

 if (!user) {
  return showSignIn ? (
    <div>
      <SignInPage />

      <div className="text-center mt-4">
        <Button
          onClick={() => setShowSignIn(false)}
          variant="contained"
          color="primary"
          size="large"
          sx={{     
            textTransform: 'none',
            px: 4,
            py: 1.5,
            minWidth: 200,
            bgcolor: '#6b7280',
            color: '#ffffff',
            '&:hover': {
            bgcolor: '#4b5563',
          }, 
        }}
        >
          Voltar para Login
        </Button>
      </div>
    </div>
  ) : (
    <div>
      <LoginPage onLogin={setUser} />

      <div className="text-center mt-4">
        <Button
          onClick={() => setShowSignIn(true)}
          variant="contained"
          color="primary"
          size="large"
          sx={{ textTransform: 'none', px: 4, py: 1.5, minWidth: 200 }}
        >
          Criar Conta
        </Button>
      </div>
    </div>
  );
}

  return (
    <div className="size-full bg-gray-50">
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Container maxWidth="lg">
          <div className="flex items-center justify-between py-2">
            <h1 className="text-2xl font-bold text-white">Bate Ponto</h1>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={menuOpen ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? 'true' : undefined}
            >
              <Avatar sx={{ width: 40, height: 40, bgcolor: '#fff', color: '#1976d2', fontWeight: 'bold' }}>
                {getInitials(user.name)}
              </Avatar>
            </IconButton>
          </div>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ '& .MuiTab-root': { color: 'white' } }}
          >
            <Tab icon={<AccessTime />} label="Frequência" />
            <Tab icon={<CalendarMonth />} label="Calendário" />
            {user.role === 'supervisor' && (
              <Tab icon={<DashboardIcon />} label="Dashboard" />
            )}
          </Tabs>
        </Container>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            mt: 1.5,
          },
        }}
      >
        <div className="px-4 py-3">
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-600">
            {user.role === 'supervisor' ? 'Supervisor' : 'Estagiário'}
          </p>
        </div>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>

      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
        <Box hidden={currentTab !== 0}>
          <FrequencyPage userRole={user.role} userId={user.id} />
        </Box>
        <Box hidden={currentTab !== 1}>
          <CalendarPage userRole={user.role} userId={user.id} />
        </Box>
        {user.role === 'supervisor' && (
          <Box hidden={currentTab !== 2}>
            <DashboardPage />
          </Box>
        )}
      </Container>
    </div>
  );
}