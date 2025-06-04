import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Area,
  AreaChart,
} from 'recharts';
import { getPlans } from '../data/mockData';

function PlanBalanceOverTime() {
  const [selectedPlan, setSelectedPlan] = useState('all');
  const plans = getPlans();

  // Данные для балансов планов во времени
  const timeSeriesData = [
    {
      date: '2024-01-01',
      'Основной фонд': 120000,
      'Резервный фонд': 30000,
      'Отпуск': 50000,
      'Новый ноутбук': 15000,
      'Ежемесячные расходы': 40000,
    },
    {
      date: '2024-01-15',
      'Основной фонд': 135000,
      'Резервный фонд': 35000,
      'Отпуск': 60000,
      'Новый ноутбук': 20000,
      'Ежемесячные расходы': 35000,
    },
    {
      date: '2024-02-01',
      'Основной фонд': 150000,
      'Резервный фонд': 40000,
      'Отпуск': 70000,
      'Новый ноутбук': 25000,
      'Ежемесячные расходы': 45000,
    },
    {
      date: '2024-02-15',
      'Основной фонд': 165000,
      'Резервный фонд': 45000,
      'Отпуск': 75000,
      'Новый ноутбук': 25000,
      'Ежемесячные расходы': 40000,
    },
    {
      date: '2024-03-01',
      'Основной фонд': 180000,
      'Резервный фонд': 50000,
      'Отпуск': 80000,
      'Новый ноутбук': 25000,
      'Ежемесячные расходы': 45000,
    },
    {
      date: '2024-03-15',
      'Основной фонд': 195000,
      'Резервный фонд': 55000,
      'Отпуск': 85000,
      'Новый ноутбук': 25000,
      'Ежемесячные расходы': 35000,
    },
  ];

  // Прогнозные данные
  const forecastData = [
    {
      date: '2024-04-01',
      'Основной фонд': 210000,
      'Резервный фонд': 60000,
      'Отпуск': 90000,
      'Новый ноутбук': 30000,
      'Ежемесячные расходы': 40000,
    },
    {
      date: '2024-04-15',
      'Основной фонд': 225000,
      'Резервный фонд': 65000,
      'Отпуск': 95000,
      'Новый ноутбук': 35000,
      'Ежемесячные расходы': 35000,
    },
    {
      date: '2024-05-01',
      'Основной фонд': 240000,
      'Резервный фонд': 70000,
      'Отпуск': 100000,
      'Новый ноутбук': 40000,
      'Ежемесячные расходы': 40000,
    },
  ];

  const combinedData = [...timeSeriesData, ...forecastData];

  const getLineColor = (planName) => {
    const colors = {
      'Основной фонд': '#0088FE',
      'Резервный фонд': '#FF8042',
      'Отпуск': '#00C49F',
      'Новый ноутбук': '#FFBB28',
      'Ежемесячные расходы': '#8884D8',
    };
    return colors[planName] || '#82ca9d';
  };

  const getVisiblePlans = () => {
    if (selectedPlan === 'all') {
      return Object.keys(timeSeriesData[0]).filter(key => key !== 'date');
    }
    return [selectedPlan];
  };

  const hasNegativeBalances = () => {
    return forecastData.some(dataPoint => 
      Object.values(dataPoint).some(value => typeof value === 'number' && value < 0)
    );
  };

  const getLowestBalance = () => {
    let lowest = { plan: '', value: Infinity, date: '' };
    
    forecastData.forEach(dataPoint => {
      Object.entries(dataPoint).forEach(([key, value]) => {
        if (key !== 'date' && typeof value === 'number' && value < lowest.value) {
          lowest = { plan: key, value, date: dataPoint.date };
        }
      });
    });
    
    return lowest.value === Infinity ? null : lowest;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Баланс планов во времени
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Динамика балансов планов во времени для выявления потенциальных кассовых разрывов 
        и отслеживания тенденций роста или снижения балансов.
      </Typography>

      {/* Предупреждения */}
      {hasNegativeBalances() && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            ⚠️ Обнаружены планы, которые могут уйти в отрицательный баланс в будущем!
          </Typography>
        </Alert>
      )}

      {/* Фильтр планов */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Выберите план</InputLabel>
            <Select
              value={selectedPlan}
              label="Выберите план"
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              <MenuItem value="all">Все планы</MenuItem>
              {Object.keys(timeSeriesData[0])
                .filter(key => key !== 'date')
                .map(planName => (
                <MenuItem key={planName} value={planName}>
                  {planName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {getVisiblePlans().map(planName => (
              <Chip
                key={planName}
                label={planName}
                sx={{ 
                  backgroundColor: getLineColor(planName),
                  color: 'white',
                }}
                size="small"
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Основной график */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Динамика балансов планов
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}.${date.getMonth() + 1}`;
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, '']}
                  labelFormatter={(value) => `Дата: ${value}`}
                />
                <Legend />
                
                {getVisiblePlans().map(planName => (
                  <Line
                    key={planName}
                    type="monotone"
                    dataKey={planName}
                    stroke={getLineColor(planName)}
                    strokeWidth={2}
                    strokeDasharray={timeSeriesData.length < combinedData.length ? 
                      (dataPoint, index) => index >= timeSeriesData.length ? "5 5" : "0"
                      : "0"}
                    dot={{ r: 3 }}
                  />
                ))}
                
                {/* Линия нуля для выявления отрицательных балансов */}
                <ReferenceLine 
                  y={0} 
                  stroke="#ff0000" 
                  strokeDasharray="3 3" 
                  label="Критический уровень"
                />
                
                {/* Разделитель между фактом и прогнозом */}
                <ReferenceLine 
                  x={timeSeriesData[timeSeriesData.length - 1].date}
                  stroke="#999999"
                  strokeDasharray="8 4"
                  label="Прогноз"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 2, bgcolor: '#666' }} />
              <span>Фактические данные</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 2, bgcolor: '#666', borderTop: '2px dashed #666' }} />
              <span>Прогнозные данные</span>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Анализ рисков */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Анализ рисков
              </Typography>
              
              {getLowestBalance() ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="warning.main" gutterBottom>
                    <strong>Минимальный баланс:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {getLowestBalance().plan}: {getLowestBalance().value.toLocaleString('ru-RU')} ₽
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Дата: {getLowestBalance().date}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="success.main">
                  Все планы показывают положительную динамику
                </Typography>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Рекомендации:</strong>
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Мониторить планы с убывающими балансами</li>
                  <li>Рассмотреть перераспределение средств</li>
                  <li>Корректировать планы при приближении к нулю</li>
                </ul>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Тренды */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Анализ трендов
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      ↗️
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Растущие планы: 3
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      ↘️
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Убывающие планы: 1
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" color="info.dark">
                  <strong>Прогноз:</strong> Основные накопительные планы показывают 
                  стабильный рост. План "Ежемесячные расходы" имеет волатильность, 
                  что нормально для текущих трат.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PlanBalanceOverTime; 