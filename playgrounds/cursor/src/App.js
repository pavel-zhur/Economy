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
  Divider,
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
  AccountTree,
  Receipt,
  CompareArrows,
  SwapHoriz,
  AutoAwesome,
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
import WhatIfAnalysis from './views/WhatIfAnalysis';
import VarianceHistory from './views/VarianceHistory';
import CashFlowAnalysis from './views/CashFlowAnalysis';
import PlanningEfficiency from './views/PlanningEfficiency';
import IrregularTransactions from './views/IrregularTransactions';
import FinancialCalendar from './views/FinancialCalendar';
import UnrealisticPlans from './views/UnrealisticPlans';
import YearForecast from './views/YearForecast';
import YearForecastWithChanges from './views/YearForecastWithChanges';
import PlanTreeView from './views/PlanTreeView';
import TransactionManagement from './views/TransactionManagement';
import BalanceReconciliation from './views/BalanceReconciliation';
import PlanActualization from './views/PlanActualization';
import ScenarioManagement from './views/ScenarioManagement';
import QuickPlanning from './views/QuickPlanning';

const drawerWidth = 280;

const menuItems = [
  { id: 'dashboard', label: 'Дашборд', icon: <Dashboard />, path: '/' },
  { id: 'divider-1', divider: true },
  { id: 'quick-planning', label: 'Быстрое планирование', icon: <AutoAwesome />, path: '/quick-planning' },
  { id: 'plan-tree', label: 'Структура планов', icon: <AccountTree />, path: '/plan-tree' },
  { id: 'transactions', label: 'Транзакции', icon: <Receipt />, path: '/transactions' },
  { id: 'divider-2', divider: true },
  { id: 'balance-reconciliation', label: 'Сверка балансов', icon: <CompareArrows />, path: '/balance-reconciliation' },
  { id: 'plan-actualization', label: 'Актуализация планов', icon: <SwapHoriz />, path: '/plan-actualization' },
  { id: 'scenario-management', label: 'Управление сценариями', icon: <Timeline />, path: '/scenario-management' },
  { id: 'divider-3', divider: true },
  { id: 'planned-expenses', label: 'Планируемые расходы', icon: <Schedule />, path: '/planned-expenses' },
  { id: 'money-distribution', label: 'Распределение денег', icon: <PieChart />, path: '/money-distribution' },
  { id: 'future-distribution', label: 'Будущие накопления', icon: <TrendingUp />, path: '/future-distribution' },
  { id: 'income-distribution', label: 'Распределение доходов', icon: <MonetizationOn />, path: '/income-distribution' },
  { id: 'divider-4', divider: true },
  { id: 'wallet-inventory', label: 'Инвентаризация кошельков', icon: <AccountBalance />, path: '/wallet-inventory' },
  { id: 'money-delay', label: 'Время задержки средств', icon: <Timeline />, path: '/money-delay' },
  { id: 'negative-plans', label: 'Планы с отриц. балансом', icon: <Assessment />, path: '/negative-plans' },
  { id: 'plan-balance', label: 'Баланс планов во времени', icon: <Analytics />, path: '/plan-balance' },
  { id: 'divider-5', divider: true },
  { id: 'goals-progress', label: 'Прогресс по целям', icon: <FlagOutlined />, path: '/goals-progress' },
  { id: 'what-if', label: 'Что если', icon: <Settings />, path: '/what-if' },
  { id: 'variance-history', label: 'История отклонений', icon: <CalendarToday />, path: '/variance-history' },
  { id: 'cash-flow-analysis', label: 'Анализ остатка', icon: <Analytics />, path: '/cash-flow-analysis' },
  { id: 'planning-efficiency', label: 'Эффективность', icon: <TrendingUp />, path: '/planning-efficiency' },
  { id: 'divider-6', divider: true },
  { id: 'irregular-transactions', label: 'Нерегулярные операции', icon: <MonetizationOn />, path: '/irregular-transactions' },
  { id: 'financial-calendar', label: 'Календарь', icon: <CalendarToday />, path: '/financial-calendar' },
  { id: 'unrealistic-plans', label: 'Нереалистичные планы', icon: <Settings />, path: '/unrealistic-plans' },
  { id: 'year-forecast', label: 'Прогноз на год', icon: <Assessment />, path: '/year-forecast' },
  { id: 'year-forecast-changes', label: 'Прогноз с изменениями', icon: <TrendingUp />, path: '/year-forecast-changes' },
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
        {menuItems.map((item) => {
          if (item.divider) {
            return <Divider key={item.id} sx={{ my: 1 }} />;
          }
          
          return (
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
          );
        })}
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
          <Route path="/quick-planning" element={<QuickPlanning />} />
          <Route path="/plan-tree" element={<PlanTreeView />} />
          <Route path="/transactions" element={<TransactionManagement />} />
          <Route path="/balance-reconciliation" element={<BalanceReconciliation />} />
          <Route path="/plan-actualization" element={<PlanActualization />} />
          <Route path="/scenario-management" element={<ScenarioManagement />} />
          <Route path="/planned-expenses" element={<PlannedExpenses />} />
          <Route path="/money-distribution" element={<MoneyDistribution />} />
          <Route path="/future-distribution" element={<FutureDistribution />} />
          <Route path="/income-distribution" element={<IncomeDistribution />} />
          <Route path="/wallet-inventory" element={<WalletInventory />} />
          <Route path="/money-delay" element={<MoneyDelayTime />} />
          <Route path="/negative-plans" element={<NegativeBalancePlans />} />
          <Route path="/plan-balance" element={<PlanBalanceOverTime />} />
          <Route path="/goals-progress" element={<GoalsProgress />} />
          <Route path="/what-if" element={<WhatIfAnalysis />} />
          <Route path="/variance-history" element={<VarianceHistory />} />
          <Route path="/cash-flow-analysis" element={<CashFlowAnalysis />} />
          <Route path="/planning-efficiency" element={<PlanningEfficiency />} />
          <Route path="/irregular-transactions" element={<IrregularTransactions />} />
          <Route path="/financial-calendar" element={<FinancialCalendar />} />
          <Route path="/unrealistic-plans" element={<UnrealisticPlans />} />
          <Route path="/year-forecast" element={<YearForecast />} />
          <Route path="/year-forecast-changes" element={<YearForecastWithChanges />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App; 