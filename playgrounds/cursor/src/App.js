import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  AccountBalance,
  TrendingUp,
  Schedule,
  Assessment,
  Settings,
  MonetizationOn,
  PieChart,
  Timeline,
  CalendarToday,
  FlagOutlined,
  Analytics,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// Import view components
import DashboardView from './views/Dashboard';
import PlannedExpenses from './views/PlannedExpenses';
import MoneyDistribution from './views/MoneyDistribution';
import FutureDistribution from './views/FutureDistribution';
import IncomeDistribution from './views/IncomeDistribution';
import WalletInventory from './views/WalletInventory';
import MoneyDelayTime from './views/MoneyDelayTime';
import NegativeBalancePlans from './views/NegativeBalancePlans';
import PlanBalanceOverTime from './views/PlanBalanceOverTime';
import GoalsProgress from './views/GoalsProgress';

const drawerWidth = 280;

const menuItems = [
  { id: 'dashboard', label: 'Дашборд', icon: <Dashboard />, path: '/' },
  { id: 'planned-expenses', label: 'Планируемые расходы', icon: <Schedule />, path: '/planned-expenses' },
  { id: 'money-distribution', label: 'Распределение денег', icon: <PieChart />, path: '/money-distribution' },
  { id: 'future-distribution', label: 'Будущие накопления', icon: <TrendingUp />, path: '/future-distribution' },
  { id: 'income-distribution', label: 'Распределение доходов', icon: <MonetizationOn />, path: '/income-distribution' },
  { id: 'wallet-inventory', label: 'Инвентаризация кошельков', icon: <AccountBalance />, path: '/wallet-inventory' },
  { id: 'money-delay', label: 'Время задержки средств', icon: <Timeline />, path: '/money-delay' },
  { id: 'negative-plans', label: 'Планы с отриц. балансом', icon: <Assessment />, path: '/negative-plans' },
  { id: 'plan-balance', label: 'Баланс планов во времени', icon: <Analytics />, path: '/plan-balance' },
  { id: 'goals-progress', label: 'Прогресс по целям', icon: <FlagOutlined />, path: '/goals-progress' },
];

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Финансы
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleMenuClick(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? 'inherit' : 'inherit' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Дашборд'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/planned-expenses" element={<PlannedExpenses />} />
          <Route path="/money-distribution" element={<MoneyDistribution />} />
          <Route path="/future-distribution" element={<FutureDistribution />} />
          <Route path="/income-distribution" element={<IncomeDistribution />} />
          <Route path="/wallet-inventory" element={<WalletInventory />} />
          <Route path="/money-delay" element={<MoneyDelayTime />} />
          <Route path="/negative-plans" element={<NegativeBalancePlans />} />
          <Route path="/plan-balance" element={<PlanBalanceOverTime />} />
          <Route path="/goals-progress" element={<GoalsProgress />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App; 