import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, Box, Grid, Chip, Alert, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';
import { TrendingUp, TrendingDown, Info } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getYearForecastData, getCurrentFinancialHabits } from '../data/mockData';

function YearForecast() {
  const [selectedMetric, setSelectedMetric] = useState('total');
  const forecastData = getYearForecastData();
  const currentHabits = getCurrentFinancialHabits();

  const metrics = [
    { key: 'total', label: 'Общий баланс', color: '#0088FE' },
    { key: 'savings', label: 'Накопления', color: '#00C49F' },
    { key: 'emergency', label: 'Резервный фонд', color: '#FFBB28' },
    { key: 'goals', label: 'Целевые фонды', color: '#FF8042' }
  ];

  const currentMetric = metrics.find(m => m.key === selectedMetric);
  const currentValue = forecastData[0]?.[selectedMetric] || 0;
  const futureValue = forecastData[forecastData.length - 1]?.[selectedMetric] || 0;
  const yearGrowth = futureValue - currentValue;
  const monthlyGrowth = yearGrowth / 12;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Прогноз на год при текущем образе жизни
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Анализ того, как будет выглядеть ваше финансовое состояние через год, 
        если вы продолжите придерживаться текущих финансовых привычек.
      </Typography>

      {/* Анализ текущих привычек */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Анализ текущих финансовых привычек
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                <Typography variant="h5" color="success.main">
                  +{currentHabits.averageIncome.toLocaleString('ru-RU')} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Средний ежемесячный доход
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
                <Typography variant="h5" color="error.main">
                  -{currentHabits.averageExpenses.toLocaleString('ru-RU')} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Средние ежемесячные расходы
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                <Typography variant="h5" color="primary.main">
                  {currentHabits.monthlySavings >= 0 ? '+' : ''}{currentHabits.monthlySavings.toLocaleString('ru-RU')} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ежемесячные накопления
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            * Данные основаны на анализе последних {currentHabits.periodMonths} месяцев
          </Typography>
        </CardContent>
      </Card>

      {/* Основной прогноз */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              📈 Прогноз финансового состояния
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {metrics.map(metric => (
                <Chip
                  key={metric.key}
                  label={metric.label}
                  onClick={() => setSelectedMetric(metric.key)}
                  variant={selectedMetric === metric.key ? 'filled' : 'outlined'}
                  sx={{ 
                    borderColor: metric.color,
                    backgroundColor: selectedMetric === metric.key ? metric.color : 'transparent',
                    color: selectedMetric === metric.key ? 'white' : metric.color
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k ₽`}
                />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, currentMetric.label]}
                  labelFormatter={(label) => `Месяц: ${label}`}
                />
                <ReferenceLine 
                  x="Сейчас" 
                  stroke="#666" 
                  strokeDasharray="5 5" 
                  label={{ value: "Текущий момент", position: "topLeft" }}
                />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke={currentMetric.color} 
                  strokeWidth={3}
                  dot={{ fill: currentMetric.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: currentMetric.color, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* Прогнозные показатели */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6">
                  {currentValue.toLocaleString('ru-RU')} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Текущее значение
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                <Typography variant="h6" color="primary.main">
                  {futureValue.toLocaleString('ru-RU')} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Через год
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 2, 
                bgcolor: yearGrowth >= 0 ? 'success.lighter' : 'error.lighter', 
                borderRadius: 1 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  {yearGrowth >= 0 ? <TrendingUp /> : <TrendingDown />}
                  <Typography variant="h6" color={yearGrowth >= 0 ? 'success.main' : 'error.main'}>
                    {yearGrowth >= 0 ? '+' : ''}{yearGrowth.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Изменение за год
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Детальный анализ по категориям */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Детальный прогноз по категориям
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Категория</TableCell>
                  <TableCell align="right">Сейчас</TableCell>
                  <TableCell align="right">Через год</TableCell>
                  <TableCell align="right">Ежемесячный рост</TableCell>
                  <TableCell align="center">Тренд</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.map(metric => {
                  const current = forecastData[0]?.[metric.key] || 0;
                  const future = forecastData[forecastData.length - 1]?.[metric.key] || 0;
                  const growth = future - current;
                  const monthlyGrowth = growth / 12;
                  
                  return (
                    <TableRow key={metric.key}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              backgroundColor: metric.color 
                            }} 
                          />
                          {metric.label}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {current.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell align="right">
                        {future.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell align="right">
                        <Typography color={monthlyGrowth >= 0 ? 'success.main' : 'error.main'}>
                          {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {growth >= 0 ? 
                          <TrendingUp color="success" /> : 
                          <TrendingDown color="error" />
                        }
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Предупреждения и рекомендации */}
      {monthlyGrowth < 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            ⚠️ Отрицательная динамика
          </Typography>
          При текущих финансовых привычках ваши накопления сокращаются на{' '}
          {Math.abs(monthlyGrowth).toLocaleString('ru-RU')} ₽ в месяц. 
          Рассмотрите возможность оптимизации расходов или увеличения доходов.
        </Alert>
      )}

      {monthlyGrowth > 0 && monthlyGrowth < 10000 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            💡 Возможности для роста
          </Typography>
          Ваши накопления растут умеренными темпами. Рассмотрите стратегии ускорения 
          накоплений для достижения финансовых целей быстрее.
        </Alert>
      )}

      {monthlyGrowth >= 10000 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            🎉 Отличная динамика!
          </Typography>
          При текущих привычках вы стабильно увеличиваете свои накопления. 
          Продолжайте в том же духе!
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ℹ️ Как использовать этот прогноз
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Этот прогноз основан на анализе ваших реальных финансовых привычек за последние месяцы
            <br />
            • Он показывает вероятное развитие событий при сохранении текущего образа жизни
            <br />
            • Используйте его как отправную точку для планирования изменений
            <br />
            • Сравните результат с вашими целями и при необходимости скорректируйте стратегию
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default YearForecast; 