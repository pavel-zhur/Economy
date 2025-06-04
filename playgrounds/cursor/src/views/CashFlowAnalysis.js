import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Warning, CheckCircle, Info } from '@mui/icons-material';

function CashFlowAnalysis() {
  // Данные о текущих остатках
  const currentBalance = 45000;
  const nextIncomeDate = '2024-06-15';
  const nextIncomeAmount = 80000;
  const daysUntilIncome = 11;

  // Прогнозируемые расходы до следующего дохода
  const upcomingExpenses = [
    { name: 'Аренда', amount: 25000, date: '2024-06-05', category: 'Обязательные', status: 'scheduled' },
    { name: 'Коммунальные', amount: 8000, date: '2024-06-08', category: 'Обязательные', status: 'scheduled' },
    { name: 'Продукты', amount: 6000, date: '2024-06-10', category: 'Необходимые', status: 'estimated' },
    { name: 'Транспорт', amount: 3000, date: '2024-06-12', category: 'Необходимые', status: 'estimated' },
    { name: 'Развлечения', amount: 4000, date: '2024-06-14', category: 'Желательные', status: 'optional' },
  ];

  const totalPlannedExpenses = upcomingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const obligatoryExpenses = upcomingExpenses
    .filter(exp => exp.category === 'Обязательные')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const necessaryExpenses = upcomingExpenses
    .filter(exp => exp.category === 'Необходимые')
    .reduce((sum, expense) => sum + expense.amount, 0);

  const remainingBalance = currentBalance - totalPlannedExpenses;
  const criticalBalance = currentBalance - obligatoryExpenses - necessaryExpenses;
  
  // Данные для графика cash flow
  const cashFlowData = [
    { date: '2024-06-04', balance: currentBalance, type: 'Текущий остаток' },
    { date: '2024-06-05', balance: currentBalance - 25000, type: 'После аренды' },
    { date: '2024-06-08', balance: currentBalance - 33000, type: 'После коммунальных' },
    { date: '2024-06-10', balance: currentBalance - 39000, type: 'После продуктов' },
    { date: '2024-06-12', balance: currentBalance - 42000, type: 'После транспорта' },
    { date: '2024-06-14', balance: remainingBalance, type: 'Перед доходом' },
    { date: '2024-06-15', balance: remainingBalance + nextIncomeAmount, type: 'После дохода' },
  ];

  // Данные для pie chart категорий расходов
  const expensesByCategory = [
    { name: 'Обязательные', value: obligatoryExpenses, color: '#FF6B6B' },
    { name: 'Необходимые', value: necessaryExpenses, color: '#4ECDC4' },
    { name: 'Желательные', value: upcomingExpenses
        .filter(exp => exp.category === 'Желательные')
        .reduce((sum, expense) => sum + expense.amount, 0), color: '#45B7D1' },
    { name: 'Остаток', value: Math.max(0, remainingBalance), color: '#96CEB4' },
  ];

  const getBalanceStatus = () => {
    if (remainingBalance < 0) return 'deficit';
    if (remainingBalance < 5000) return 'critical';
    if (remainingBalance < 15000) return 'warning';
    return 'good';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'deficit': return 'error';
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'good': return 'success';
      default: return 'info';
    }
  };

  const getStatusMessage = () => {
    const status = getBalanceStatus();
    switch (status) {
      case 'deficit':
        return 'Недостаток средств! Необходимо пересмотреть расходы или найти дополнительные источники дохода.';
      case 'critical':
        return 'Критически низкий остаток. Рекомендуется отложить необязательные расходы.';
      case 'warning':
        return 'Небольшой запас. Следите за расходами до следующего дохода.';
      case 'good':
        return 'Достаточный запас средств до следующего поступления.';
      default:
        return '';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Анализ остатка средств до следующего дохода
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Анализ достаточности текущих средств для покрытия расходов до следующего поступления дохода.
      </Typography>

      {/* Статус и предупреждения */}
      <Alert 
        severity={getStatusColor(getBalanceStatus())} 
        icon={getBalanceStatus() === 'good' ? <CheckCircle /> : <Warning />}
        sx={{ mb: 3 }}
      >
        <Typography variant="body1">
          <strong>{getStatusMessage()}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          До следующего дохода ({nextIncomeDate}): {daysUntilIncome} дней
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Основные показатели */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Финансовое состояние
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {currentBalance.toLocaleString('ru-RU')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Текущий остаток (₽)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color={getStatusColor(getBalanceStatus()) + '.main'}>
                      {remainingBalance.toLocaleString('ru-RU')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Прогноз остатка (₽)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Прогресс до следующего дохода
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={((15 - daysUntilIncome) / 15) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {daysUntilIncome} дней до поступления {nextIncomeAmount.toLocaleString('ru-RU')} ₽
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Структура расходов */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Структура планируемых расходов
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toLocaleString('ru-RU')}₽`}
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString('ru-RU')} ₽`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* График динамики баланса */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Прогнозируемая динамика баланса
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}.${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Баланс']}
                      labelFormatter={(value) => `Дата: ${value}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#0088FE" 
                      fill="#0088FE" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Детальная таблица расходов */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Планируемые расходы
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell>Расход</TableCell>
                      <TableCell align="right">Сумма</TableCell>
                      <TableCell>Категория</TableCell>
                      <TableCell>Статус</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingExpenses.map((expense, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(expense.date).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell>{expense.name}</TableCell>
                        <TableCell align="right">
                          {expense.amount.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={expense.category}
                            size="small"
                            color={
                              expense.category === 'Обязательные' ? 'error' :
                              expense.category === 'Необходимые' ? 'warning' : 'info'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              expense.status === 'scheduled' ? 'Запланировано' :
                              expense.status === 'estimated' ? 'Оценка' : 'Опционально'
                            }
                            size="small"
                            variant={expense.status === 'optional' ? 'outlined' : 'filled'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Рекомендации */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Рекомендации
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Критический минимум:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {criticalBalance.toLocaleString('ru-RU')} ₽ (без развлечений)
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Ежедневный лимит:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.floor(remainingBalance / daysUntilIncome).toLocaleString('ru-RU')} ₽/день
                </Typography>
              </Box>

              {getBalanceStatus() === 'deficit' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Рекомендуется отложить расходы на {Math.abs(remainingBalance).toLocaleString('ru-RU')} ₽
                  </Typography>
                </Alert>
              )}

              {getBalanceStatus() === 'warning' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Рассмотрите отказ от необязательных трат на {upcomingExpenses
                      .filter(exp => exp.category === 'Желательные')
                      .reduce((sum, expense) => sum + expense.amount, 0)
                      .toLocaleString('ru-RU')} ₽
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CashFlowAnalysis; 