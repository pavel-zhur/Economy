import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Warning,
  CheckCircle,
  Error,
  ArrowForward,
  AutoAwesome,
  SwapHoriz,
  Receipt,
  CompareArrows,
  FlagOutlined,
  Schedule,
  AccountTree,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function DashboardView() {
  const navigate = useNavigate();

  // Ключевые метрики
  const keyMetrics = {
    totalBalance: 230000,
    monthlyIncome: 105000,
    monthlyExpenses: 78000,
    savingsRate: 26,
    goalsProgress: 68,
    plansWithVariance: 4,
    unlinkedTransactions: 2,
    balanceDiscrepancy: 1500,
  };

  // Статус сходимости
  const reconciliationStatus = {
    wallets: 230000,
    transactions: 228500,
    plans: 230000,
    status: 'warning',
  };

  // Ближайшие цели
  const upcomingGoals = [
    { name: 'Отпуск', target: 150000, current: 75000, deadline: '2024-07-01' },
    { name: 'Новый ноутбук', target: 80000, current: 25000, deadline: '2024-09-01' },
    { name: 'Резервный фонд', target: 300000, current: 50000, deadline: '2025-01-01' },
  ];

  // Планы требующие внимания
  const plansNeedingAttention = [
    { name: 'Продукты', variance: -5000, type: 'under' },
    { name: 'Развлечения', variance: 3000, type: 'over' },
    { name: 'Новый ноутбук', variance: -5000, type: 'under' },
  ];

  // График баланса за последние 7 дней
  const balanceHistory = [
    { date: '14.03', balance: 215000 },
    { date: '15.03', balance: 218000 },
    { date: '16.03', balance: 220000 },
    { date: '17.03', balance: 245000 },
    { date: '18.03', balance: 240000 },
    { date: '19.03', balance: 235000 },
    { date: '20.03', balance: 230000 },
  ];

  // Распределение средств
  const distributionData = [
    { name: 'Накопления', value: 100000, color: '#8884d8' },
    { name: 'Цели', value: 75000, color: '#82ca9d' },
    { name: 'Расходы', value: 45000, color: '#ffc658' },
    { name: 'Резерв', value: 10000, color: '#ff7c7c' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Финансовый дашборд
      </Typography>

      {/* Алерты и уведомления */}
      {keyMetrics.balanceDiscrepancy > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => navigate('/balance-reconciliation')}
            >
              Проверить
            </Button>
          }
        >
          Обнаружено расхождение в {keyMetrics.balanceDiscrepancy.toLocaleString('ru-RU')} ₽ между балансами
        </Alert>
      )}

      {/* Быстрые действия */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={() => navigate('/quick-planning')}
            sx={{ py: 2 }}
          >
            Распределить доход
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SwapHoriz />}
            onClick={() => navigate('/plan-actualization')}
            sx={{ py: 2 }}
          >
            Актуализировать планы
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Receipt />}
            onClick={() => navigate('/transactions')}
            sx={{ py: 2 }}
          >
            Добавить транзакцию
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<CompareArrows />}
            onClick={() => navigate('/balance-reconciliation')}
            sx={{ py: 2 }}
          >
            Сверить балансы
          </Button>
        </Grid>
      </Grid>

      {/* Ключевые метрики */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Общий баланс
              </Typography>
              <Typography variant="h4">
                {keyMetrics.totalBalance.toLocaleString('ru-RU')} ₽
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="success.main">
                  +15% за месяц
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Норма сбережений
              </Typography>
              <Typography variant="h4">
                {keyMetrics.savingsRate}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={keyMetrics.savingsRate} 
                sx={{ mt: 2 }}
                color={keyMetrics.savingsRate >= 20 ? 'success' : 'warning'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Прогресс по целям
              </Typography>
              <Typography variant="h4">
                {keyMetrics.goalsProgress}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <FlagOutlined sx={{ mr: 1 }} />
                <Typography variant="body2">
                  3 активные цели
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Требуют внимания
              </Typography>
              <Typography variant="h4">
                {keyMetrics.plansWithVariance + keyMetrics.unlinkedTransactions}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={`${keyMetrics.plansWithVariance} планов`} 
                  size="small" 
                  color="warning"
                />
                <Chip 
                  label={`${keyMetrics.unlinkedTransactions} транз.`} 
                  size="small" 
                  color="info"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* График баланса */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Динамика баланса
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Баланс']} />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Распределение средств */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Распределение средств
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString('ru-RU')} ₽`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <List dense>
                {distributionData.map((item) => (
                  <ListItem key={item.name}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        backgroundColor: item.color,
                        borderRadius: '50%',
                        mr: 1
                      }} 
                    />
                    <ListItemText 
                      primary={item.name}
                      secondary={`${item.value.toLocaleString('ru-RU')} ₽`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Статус сходимости */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Сходимость балансов
                </Typography>
                {getStatusIcon(reconciliationStatus.status)}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <AccountBalance color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Кошельки
                    </Typography>
                    <Typography variant="h6">
                      {reconciliationStatus.wallets.toLocaleString('ru-RU')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Receipt color="success" />
                    <Typography variant="body2" color="text.secondary">
                      Транзакции
                    </Typography>
                    <Typography variant="h6">
                      {reconciliationStatus.transactions.toLocaleString('ru-RU')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <AccountTree color="info" />
                    <Typography variant="body2" color="text.secondary">
                      Планы
                    </Typography>
                    <Typography variant="h6">
                      {reconciliationStatus.plans.toLocaleString('ru-RU')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/balance-reconciliation')}
              >
                Подробнее
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Планы требующие внимания */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Планы с расхождениями
              </Typography>
              
              <List>
                {plansNeedingAttention.map((plan, index) => (
                  <React.Fragment key={plan.name}>
                    <ListItem>
                      <ListItemIcon>
                        {plan.type === 'over' ? 
                          <TrendingUp color="success" /> : 
                          <TrendingDown color="error" />
                        }
                      </ListItemIcon>
                      <ListItemText 
                        primary={plan.name}
                        secondary={
                          plan.type === 'over' ? 
                          `Экономия ${Math.abs(plan.variance).toLocaleString('ru-RU')} ₽` :
                          `Перерасход ${Math.abs(plan.variance).toLocaleString('ru-RU')} ₽`
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => navigate('/plan-actualization')}
                        >
                          <SwapHoriz />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < plansNeedingAttention.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/plan-actualization')}
              >
                Актуализировать все
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Ближайшие цели */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Прогресс по целям
              </Typography>
              
              <Grid container spacing={2}>
                {upcomingGoals.map((goal) => {
                  const progress = (goal.current / goal.target) * 100;
                  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Grid item xs={12} md={4} key={goal.name}>
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1">
                            {goal.name}
                          </Typography>
                          <Chip 
                            label={`${daysLeft} дней`} 
                            size="small"
                            color={daysLeft < 60 ? 'warning' : 'default'}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              {goal.current.toLocaleString('ru-RU')} ₽
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {goal.target.toLocaleString('ru-RU')} ₽
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ height: 8, borderRadius: 4 }}
                            color={progress >= 75 ? 'success' : progress >= 50 ? 'warning' : 'error'}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          Прогресс: {progress.toFixed(0)}%
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/goals-progress')}
                endIcon={<ArrowForward />}
              >
                Все цели
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardView; 