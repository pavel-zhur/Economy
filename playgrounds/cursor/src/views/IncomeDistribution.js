import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getPlannedIncomes, getTransactions, getPlans } from '../data/mockData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

function IncomeDistribution() {
  const [viewMode, setViewMode] = useState('plans');
  const plannedIncomes = getPlannedIncomes();
  const transactions = getTransactions();
  const plans = getPlans();

  // Данные по распределению доходов по планам
  const incomeByPlans = [
    { name: 'Основной фонд', amount: 60000, percentage: 75 },
    { name: 'Резервный фонд', amount: 8000, percentage: 10 },
    { name: 'Отпуск', amount: 8000, percentage: 10 },
    { name: 'Ноутбук', amount: 4000, percentage: 5 },
  ];

  // Данные по расходам (факт)
  const actualExpenses = [
    { category: 'Продукты', amount: 15000, percentage: 35 },
    { category: 'Коммунальные услуги', amount: 12000, percentage: 28 },
    { category: 'Транспорт', amount: 5000, percentage: 12 },
    { category: 'Развлечения', amount: 8000, percentage: 19 },
    { category: 'Прочее', amount: 2500, percentage: 6 },
  ];

  // Данные по категориям доходов
  const incomeCategories = [
    { category: 'Зарплата', amount: 80000, percentage: 76 },
    { category: 'Фриланс', amount: 25000, percentage: 24 },
  ];

  // Исторические данные распределения
  const historicalData = [
    { month: 'Дек 2023', savings: 45000, expenses: 35000, reserve: 8000 },
    { month: 'Янв 2024', savings: 50000, expenses: 40000, reserve: 10000 },
    { month: 'Фев 2024', savings: 55000, expenses: 38000, reserve: 12000 },
  ];

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const getCurrentData = () => {
    switch (viewMode) {
      case 'plans':
        return incomeByPlans;
      case 'expenses':
        return actualExpenses;
      case 'categories':
        return incomeCategories;
      default:
        return incomeByPlans;
    }
  };

  const getCurrentTitle = () => {
    switch (viewMode) {
      case 'plans':
        return 'Распределение доходов по планам';
      case 'expenses':
        return 'Фактические расходы по категориям';
      case 'categories':
        return 'Доходы по категориям';
      default:
        return 'Распределение доходов по планам';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Распределение доходов по планам, расходам и категориям
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Анализ того, как доходы распределяются по планам в прошлом и будущем, 
        а также фактические расходы по категориям.
      </Typography>

      {/* Переключатель режимов */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="режим просмотра"
        >
          <ToggleButton value="plans" aria-label="по планам">
            По планам
          </ToggleButton>
          <ToggleButton value="expenses" aria-label="по расходам">
            По расходам
          </ToggleButton>
          <ToggleButton value="categories" aria-label="по категориям">
            По категориям
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Основной график */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {getCurrentTitle()}
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCurrentData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {getCurrentData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString('ru-RU')} ₽`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Детальная таблица */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Детализация
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Категория</TableCell>
                      <TableCell align="right">Сумма</TableCell>
                      <TableCell align="right">Доля</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCurrentData().map((item) => (
                      <TableRow key={item.name || item.category}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                bgcolor: COLORS[getCurrentData().indexOf(item) % COLORS.length],
                                borderRadius: '50%',
                                mr: 1,
                              }}
                            />
                            {item.name || item.category}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {item.amount.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${item.percentage}%`}
                            size="small"
                            color={item.percentage >= 50 ? 'primary' : 
                                   item.percentage >= 25 ? 'success' : 'default'}
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

        {/* История распределения */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                История распределения доходов
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, '']} />
                    <Legend />
                    <Bar dataKey="savings" stackId="a" fill="#0088FE" name="Накопления" />
                    <Bar dataKey="expenses" stackId="a" fill="#FF8042" name="Расходы" />
                    <Bar dataKey="reserve" stackId="a" fill="#00C49F" name="Резерв" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Планируемые доходы */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Планируемые доходы
              </Typography>
              {plannedIncomes.map((income) => (
                <Box key={income.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {income.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {income.amount.toLocaleString('ru-RU')} ₽ - {
                      income.frequency === 'monthly' ? 'ежемесячно' :
                      income.frequency === 'weekly' ? 'еженедельно' : 'разово'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Следующее поступление: {income.nextDate}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Анализ эффективности */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Анализ эффективности распределения
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      75%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      В накопления
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      25%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      На текущие расходы
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" color="info.dark">
                  <strong>Рекомендация:</strong> Текущее распределение соответствует принципу 
                  "сначала заплати себе". Высокая доля накоплений (75%) обеспечивает 
                  быстрое достижение финансовых целей.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default IncomeDistribution; 