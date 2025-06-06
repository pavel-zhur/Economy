import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, Box, Grid, Chip, Alert, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import { TrendingUp, TrendingDown, Timeline, FlagOutlined, History, Visibility } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import { getFutureDistributionData, getPreviousForecasts, getMinimalGoals } from '../data/mockData';

function FutureDistribution() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1year');
  const [showPreviousForecasts, setShowPreviousForecasts] = useState(false);
  const [selectedFund, setSelectedFund] = useState('all');

  const distributionData = getFutureDistributionData(selectedTimeframe);
  const previousForecasts = getPreviousForecasts();
  const minimalGoals = getMinimalGoals();

  const timeframes = [
    { value: '6months', label: '6 месяцев' },
    { value: '1year', label: '1 год' },
    { value: '2years', label: '2 года' },
    { value: '5years', label: '5 лет' }
  ];

  const funds = [
    { value: 'all', label: 'Все фонды' },
    { value: 'emergency', label: 'Резервный фонд' },
    { value: 'vacation', label: 'Отпуск' },
    { value: 'apartment', label: 'Квартира' },
    { value: 'education', label: 'Образование' }
  ];

  const currentData = distributionData.current;
  const forecastData = distributionData.forecast;
  const totalCurrent = Object.values(currentData).reduce((sum, val) => sum + val, 0);
  const totalForecast = Object.values(forecastData[forecastData.length - 1] || {}).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Будущее распределение по фондам и накоплениям
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Прогноз распределения средств по накопительным планам и сравнение 
        с предыдущими прогнозами и целями.
      </Typography>

      {/* Контролы */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Период прогноза</InputLabel>
                <Select
                  value={selectedTimeframe}
                  label="Период прогноза"
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                >
                  {timeframes.map(tf => (
                    <MenuItem key={tf.value} value={tf.value}>{tf.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Фонд</InputLabel>
                <Select
                  value={selectedFund}
                  label="Фонд"
                  onChange={(e) => setSelectedFund(e.target.value)}
                >
                  {funds.map(fund => (
                    <MenuItem key={fund.value} value={fund.value}>{fund.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={() => setShowPreviousForecasts(!showPreviousForecasts)}
                  color={showPreviousForecasts ? 'primary' : 'default'}
                >
                  <History />
                </IconButton>
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                  История прогнозов
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Текущее состояние vs прогноз */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💰 Текущее распределение
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary.main">
                  {totalCurrent.toLocaleString('ru-RU')} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Общий размер накоплений
                </Typography>
              </Box>
              {Object.entries(currentData).map(([fund, amount]) => (
                <Box key={fund} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{fund}</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {amount.toLocaleString('ru-RU')} ₽
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    height: 4, 
                    backgroundColor: 'grey.200', 
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      height: '100%', 
                      backgroundColor: 'primary.main',
                      width: `${(amount / totalCurrent) * 100}%`
                    }} />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Прогноз на {timeframes.find(tf => tf.value === selectedTimeframe)?.label}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="success.main">
                  {totalForecast.toLocaleString('ru-RU')} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Прогнозируемый размер накоплений
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <TrendingUp color="success" />
                  <Typography variant="body2" color="success.main">
                    +{((totalForecast - totalCurrent) / totalCurrent * 100).toFixed(1)}% рост
                  </Typography>
                </Box>
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>
                Прогноз учитывает текущие правила распределения доходов 
                и запланированные переводы между планами.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* График прогноза */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Динамика накоплений
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k ₽`}
                />
                <Tooltip 
                  formatter={(value, name) => [`${value.toLocaleString('ru-RU')} ₽`, name]}
                  labelFormatter={(label) => `Месяц: ${label}`}
                />
                <ReferenceLine 
                  x="Сейчас" 
                  stroke="#666" 
                  strokeDasharray="5 5" 
                />
                <Area
                  type="monotone"
                  dataKey="emergency"
                  stackId="1"
                  stroke="#FF8042"
                  fill="#FF8042"
                  fillOpacity={0.6}
                  name="Резервный фонд"
                />
                <Area
                  type="monotone"
                  dataKey="vacation"
                  stackId="1"
                  stroke="#FFBB28"
                  fill="#FFBB28"
                  fillOpacity={0.6}
                  name="Отпуск"
                />
                <Area
                  type="monotone"
                  dataKey="apartment"
                  stackId="1"
                  stroke="#00C49F"
                  fill="#00C49F"
                  fillOpacity={0.6}
                  name="Квартира"
                />
                <Area
                  type="monotone"
                  dataKey="education"
                  stackId="1"
                  stroke="#0088FE"
                  fill="#0088FE"
                  fillOpacity={0.6}
                  name="Образование"
                />
                
                {/* Минимальные цели */}
                {Object.entries(minimalGoals).map(([fund, goal]) => (
                  <ReferenceLine 
                    key={`goal-${fund}`}
                    y={goal.amount} 
                    stroke={goal.color}
                    strokeDasharray="10 5"
                    label={{ value: `Мин. цель: ${fund}`, position: "insideTopRight" }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Сравнение с предыдущими прогнозами */}
      {showPreviousForecasts && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📈 Сравнение с предыдущими прогнозами
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Дата прогноза</TableCell>
                    <TableCell align="right">Прогноз на сейчас</TableCell>
                    <TableCell align="right">Факт сейчас</TableCell>
                    <TableCell align="right">Отклонение</TableCell>
                    <TableCell align="center">Точность</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previousForecasts.map((forecast, index) => {
                    const deviation = totalCurrent - forecast.predictedNow;
                    const accuracy = ((1 - Math.abs(deviation) / forecast.predictedNow) * 100).toFixed(1);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{forecast.date}</TableCell>
                        <TableCell align="right">
                          {forecast.predictedNow.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          {totalCurrent.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          <Typography color={deviation >= 0 ? 'success.main' : 'error.main'}>
                            {deviation >= 0 ? '+' : ''}{deviation.toLocaleString('ru-RU')} ₽
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${accuracy}%`}
                            color={parseFloat(accuracy) >= 90 ? 'success' : parseFloat(accuracy) >= 70 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Минимальные цели и точки достижения */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Минимальные цели и контрольные точки
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(minimalGoals).map(([fund, goal]) => {
              const currentAmount = currentData[fund] || 0;
              const progress = (currentAmount / goal.amount) * 100;
              const isAchieved = currentAmount >= goal.amount;
              
              return (
                <Grid item xs={12} md={6} key={fund}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">{fund}</Typography>
                        <Chip 
                          icon={isAchieved ? <FlagOutlined /> : <Timeline />}
                          label={isAchieved ? 'Достигнуто' : 'В процессе'}
                          color={isAchieved ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="h6" color={isAchieved ? 'success.main' : 'text.primary'}>
                        {currentAmount.toLocaleString('ru-RU')} ₽ / {goal.amount.toLocaleString('ru-RU')} ₽
                      </Typography>
                      <Box sx={{ 
                        mt: 1, 
                        height: 8, 
                        backgroundColor: 'grey.200', 
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          height: '100%', 
                          backgroundColor: isAchieved ? 'success.main' : 'primary.main',
                          width: `${Math.min(progress, 100)}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {progress.toFixed(1)}% от минимальной цели
                      </Typography>
                      {goal.deadline && (
                        <Typography variant="body2" color="text.secondary">
                          Срок: {goal.deadline}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ℹ️ Об этом прогнозе
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Прогноз учитывает только накопительные планы и фонды
            <br />
            • Планируемые расходы считаются полностью выполненными
            <br />
            • Транзитные планы с автоматическим расходованием исключены
            <br />
            • Минимальные цели показывают пессимистичные сценарии
            <br />
            • Сравнение с предыдущими прогнозами помогает оценить точность планирования
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default FutureDistribution; 