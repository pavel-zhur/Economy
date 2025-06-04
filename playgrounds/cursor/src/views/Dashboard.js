import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  FlagOutlined,
  Warning,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {
  getPlans,
  getGoals,
  calculateTotalBalance,
  calculatePlansWithNegativeBalance,
  calculateUnlinkedTransactions,
  getForecastData,
} from '../data/mockData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function StatCard({ title, value, subtitle, icon, color = 'primary', trend }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TrendingUp sx={{ mr: 0.5, fontSize: 16, color: trend > 0 ? 'success.main' : 'error.main' }} />
            <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
              {trend > 0 ? '+' : ''}{trend}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const plans = getPlans();
  const goals = getGoals();
  const totalBalance = calculateTotalBalance();
  const negativePlans = calculatePlansWithNegativeBalance();
  const unlinkedTransactions = calculateUnlinkedTransactions();
  const forecastData = getForecastData();

  // Подготовка данных для графика распределения
  const distributionData = plans
    .filter(plan => plan.balance > 0 && !plan.parentId)
    .map(plan => ({
      name: plan.name,
      value: plan.balance,
    }));

  // Подготовка данных для графика прогресса целей
  const goalsProgressData = goals.map(goal => ({
    name: goal.name,
    current: goal.currentAmount,
    target: goal.targetAmount,
    progress: (goal.currentAmount / goal.targetAmount) * 100,
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Финансовый дашборд
      </Typography>

      {/* Основные показатели */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Общий баланс"
            value={totalBalance}
            subtitle="₽ на всех счетах"
            icon={<AccountBalance />}
            color="primary"
            trend={8.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Активные планы"
            value={plans.length}
            subtitle="планов в работе"
            icon={<FlagOutlined />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Проблемные планы"
            value={negativePlans.length}
            subtitle="с отрицательным балансом"
            icon={<Warning />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Неучтенные операции"
            value={unlinkedTransactions.length}
            subtitle="транзакций без планов"
            icon={<Warning />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Графики */}
      <Grid container spacing={3}>
        {/* Распределение средств по планам */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Распределение средств по планам
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString('ru-RU')} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Прогресс по целям */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Прогресс по целям
              </Typography>
              <Box sx={{ mt: 2 }}>
                {goalsProgressData.map((goal, index) => (
                  <Box key={goal.name} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {goal.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {goal.current.toLocaleString('ru-RU')} / {goal.target.toLocaleString('ru-RU')} ₽
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(goal.progress, 100)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Chip
                        label={`${goal.progress.toFixed(1)}%`}
                        size="small"
                        color={goal.progress >= 100 ? 'success' : goal.progress >= 75 ? 'primary' : 'default'}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Прогноз накоплений */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Прогноз накоплений на 6 месяцев
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, '']} />
                    <Legend />
                    <Bar dataKey="savings" stackId="a" fill="#0088FE" name="Основной фонд" />
                    <Bar dataKey="vacation" stackId="a" fill="#00C49F" name="Отпуск" />
                    <Bar dataKey="laptop" stackId="a" fill="#FFBB28" name="Ноутбук" />
                    <Bar dataKey="emergency" stackId="a" fill="#FF8042" name="Резерв" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 