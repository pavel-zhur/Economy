import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { getForecastData, getGoals } from '../data/mockData';

function FutureDistribution() {
  const forecastData = getForecastData();
  const goals = getGoals();

  // Данные для сравнения прогнозов
  const comparisonData = [
    { month: 'Янв 2024', planned: 200000, actual: 220000, difference: 20000 },
    { month: 'Фев 2024', planned: 250000, actual: 245000, difference: -5000 },
    { month: 'Мар 2024', planned: 300000, actual: 290000, difference: -10000 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Будущее распределение по фондам и накоплениям
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Прогнозируемое распределение средств по накопительным планам и фондам. 
        Сравнение с предыдущими прогнозами и анализ целей.
      </Typography>

      {/* Основной прогноз накоплений */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Прогноз накоплений по фондам
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, '']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Основной фонд"
                />
                <Line 
                  type="monotone" 
                  dataKey="emergency" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="Резервный фонд"
                />
                <Line 
                  type="monotone" 
                  dataKey="vacation" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Отпуск"
                />
                <Line 
                  type="monotone" 
                  dataKey="laptop" 
                  stroke="#FFBB28" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Ноутбук"
                />
                {/* Минимальные цели */}
                <ReferenceLine y={100000} stroke="#ff0000" strokeDasharray="8 8" label="Мин. цель резерва" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Сравнение с предыдущими прогнозами */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Сравнение прогнозов
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, '']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="planned" 
                      stroke="#0088FE" 
                      strokeDasharray="5 5"
                      name="Прогноз (предыдущий)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                      name="Фактический результат"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Точки целей */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Целевые точки накоплений
              </Typography>
              
              {goals.map((goal) => (
                <Box key={goal.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" fontWeight="bold">
                      {goal.name}
                    </Typography>
                    <Chip 
                      label={`${((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%`}
                      size="small"
                      color={(goal.currentAmount / goal.targetAmount) >= 1 ? 'success' : 
                             (goal.currentAmount / goal.targetAmount) >= 0.75 ? 'primary' : 'warning'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Цель: {goal.targetAmount.toLocaleString('ru-RU')} ₽ к {goal.targetDate}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Текущий прогресс: {goal.currentAmount.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Анализ отклонений */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Анализ точности прогнозов
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      +5%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Превышение прогноза в январе
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      -2%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Недовыполнение в феврале
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      92%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Общая точность прогнозов
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Рекомендации:</strong> Прогнозы показывают стабильный рост накоплений. 
                  Резервный фонд достигнет минимальной цели к концу года. 
                  Рассмотрите увеличение ежемесячных накоплений на отпуск на 10%.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FutureDistribution; 