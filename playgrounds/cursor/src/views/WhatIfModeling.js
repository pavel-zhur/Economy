import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, Box, Grid, Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Alert, Chip, Divider, Switch, FormControlLabel, Slider
} from '@mui/material';
import { PlayArrow, Refresh, Compare, TrendingUp, TrendingDown, Calculate } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { getBaseScenario, calculateWhatIfScenario } from '../data/mockData';

function WhatIfModeling() {
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState({
    name: 'Новый сценарий',
    incomeChange: 0,
    expenseChange: 0,
    newIncome: { type: '', amount: 0, frequency: 'monthly' },
    newExpense: { type: '', amount: 0, frequency: 'monthly' },
    savingsGoalChange: 0,
    timeframe: 12
  });

  const baseScenario = getBaseScenario();

  const handleScenarioChange = (field, value) => {
    setCurrentScenario(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setCurrentScenario(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const runScenario = () => {
    const result = calculateWhatIfScenario(currentScenario);
    const newScenario = {
      ...currentScenario,
      id: Date.now(),
      result,
      createdAt: new Date().toLocaleString('ru-RU')
    };
    setScenarios(prev => [...prev, newScenario]);
  };

  const clearScenarios = () => {
    setScenarios([]);
  };

  const deleteScenario = (id) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  };

  const scenarioTypes = [
    { value: 'salary_increase', label: 'Повышение зарплаты' },
    { value: 'side_income', label: 'Дополнительный доход' },
    { value: 'expense_reduction', label: 'Сокращение расходов' },
    { value: 'new_goal', label: 'Новая цель накоплений' },
    { value: 'major_purchase', label: 'Крупная покупка' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Ежедневно' },
    { value: 'weekly', label: 'Еженедельно' },
    { value: 'monthly', label: 'Ежемесячно' },
    { value: 'quarterly', label: 'Ежеквартально' },
    { value: 'yearly', label: 'Ежегодно' },
    { value: 'once', label: 'Разово' }
  ];

  // Подготовка данных для графика
  const chartData = [];
  for (let i = 0; i <= currentScenario.timeframe; i++) {
    const basePoint = baseScenario.forecast[i] || baseScenario.forecast[baseScenario.forecast.length - 1];
    chartData.push({
      month: i,
      base: basePoint?.total || 0,
      ...scenarios.reduce((acc, scenario) => {
        const point = scenario.result.forecast[i] || scenario.result.forecast[scenario.result.forecast.length - 1];
        acc[`scenario_${scenario.id}`] = point?.total || 0;
        return acc;
      }, {})
    });
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Моделирование "Что если"
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Интерактивный анализ финансовых последствий различных изменений 
        в доходах, расходах и финансовых целях.
      </Typography>

      <Grid container spacing={3}>
        {/* Панель настройки сценария */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎛️ Настройка сценария
              </Typography>
              
              <TextField
                fullWidth
                label="Название сценария"
                value={currentScenario.name}
                onChange={(e) => handleScenarioChange('name', e.target.value)}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Изменения в доходах
              </Typography>
              <Box sx={{ px: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Изменение текущих доходов: {currentScenario.incomeChange >= 0 ? '+' : ''}{currentScenario.incomeChange}%
                </Typography>
                <Slider
                  value={currentScenario.incomeChange}
                  onChange={(e, value) => handleScenarioChange('incomeChange', value)}
                  min={-50}
                  max={100}
                  step={5}
                  marks={[
                    { value: -50, label: '-50%' },
                    { value: 0, label: '0%' },
                    { value: 50, label: '+50%' },
                    { value: 100, label: '+100%' }
                  ]}
                />
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Новый источник дохода
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel>Тип дохода</InputLabel>
                <Select
                  value={currentScenario.newIncome.type}
                  label="Тип дохода"
                  onChange={(e) => handleNestedChange('newIncome', 'type', e.target.value)}
                >
                  {scenarioTypes.filter(t => t.value.includes('income') || t.value === 'salary_increase').map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Сумма"
                    type="number"
                    size="small"
                    value={currentScenario.newIncome.amount}
                    onChange={(e) => handleNestedChange('newIncome', 'amount', parseInt(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Частота</InputLabel>
                    <Select
                      value={currentScenario.newIncome.frequency}
                      label="Частота"
                      onChange={(e) => handleNestedChange('newIncome', 'frequency', e.target.value)}
                    >
                      {frequencies.map(freq => (
                        <MenuItem key={freq.value} value={freq.value}>{freq.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Изменения в расходах
              </Typography>
              <Box sx={{ px: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Изменение текущих расходов: {currentScenario.expenseChange >= 0 ? '+' : ''}{currentScenario.expenseChange}%
                </Typography>
                <Slider
                  value={currentScenario.expenseChange}
                  onChange={(e, value) => handleScenarioChange('expenseChange', value)}
                  min={-50}
                  max={50}
                  step={5}
                  marks={[
                    { value: -50, label: '-50%' },
                    { value: 0, label: '0%' },
                    { value: 25, label: '+25%' },
                    { value: 50, label: '+50%' }
                  ]}
                />
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Новый расход
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel>Тип расхода</InputLabel>
                <Select
                  value={currentScenario.newExpense.type}
                  label="Тип расхода"
                  onChange={(e) => handleNestedChange('newExpense', 'type', e.target.value)}
                >
                  {scenarioTypes.filter(t => t.value.includes('expense') || t.value === 'major_purchase').map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Сумма"
                    type="number"
                    size="small"
                    value={currentScenario.newExpense.amount}
                    onChange={(e) => handleNestedChange('newExpense', 'amount', parseInt(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Частота</InputLabel>
                    <Select
                      value={currentScenario.newExpense.frequency}
                      label="Частота"
                      onChange={(e) => handleNestedChange('newExpense', 'frequency', e.target.value)}
                    >
                      {frequencies.map(freq => (
                        <MenuItem key={freq.value} value={freq.value}>{freq.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Период анализа
              </Typography>
              <Box sx={{ px: 1, mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Период: {currentScenario.timeframe} месяцев
                </Typography>
                <Slider
                  value={currentScenario.timeframe}
                  onChange={(e, value) => handleScenarioChange('timeframe', value)}
                  min={6}
                  max={60}
                  step={6}
                  marks={[
                    { value: 6, label: '6м' },
                    { value: 12, label: '1г' },
                    { value: 24, label: '2г' },
                    { value: 60, label: '5л' }
                  ]}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={runScenario}
                size="large"
              >
                Запустить сценарий
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Результаты и графики */}
        <Grid item xs={12} lg={8}>
          {/* График сравнения */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  📊 Сравнение сценариев
                </Typography>
                <Button
                  startIcon={<Refresh />}
                  onClick={clearScenarios}
                  disabled={scenarios.length === 0}
                >
                  Очистить
                </Button>
              </Box>

              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => `${value}м`}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k ₽`}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value.toLocaleString('ru-RU')} ₽`, 
                        name === 'base' ? 'Базовый сценарий' : scenarios.find(s => s.id === parseInt(name.split('_')[1]))?.name || name
                      ]}
                      labelFormatter={(value) => `Месяц: ${value}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="base" 
                      stroke="#999" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      name="Базовый сценарий"
                    />
                    {scenarios.map((scenario, index) => (
                      <Line 
                        key={scenario.id}
                        type="monotone" 
                        dataKey={`scenario_${scenario.id}`} 
                        stroke={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]}
                        strokeWidth={3}
                        name={scenario.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Список сценариев */}
          {scenarios.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 Результаты сценариев
                </Typography>
                
                {scenarios.map((scenario) => (
                  <Card key={scenario.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {scenario.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {scenario.createdAt}
                          </Typography>
                          <Button 
                            size="small" 
                            color="error"
                            onClick={() => deleteScenario(scenario.id)}
                          >
                            Удалить
                          </Button>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="h6">
                              {scenario.result.finalBalance.toLocaleString('ru-RU')} ₽
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Итоговый баланс
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 2, 
                            bgcolor: scenario.result.totalChange >= 0 ? 'success.lighter' : 'error.lighter', 
                            borderRadius: 1 
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              {scenario.result.totalChange >= 0 ? <TrendingUp /> : <TrendingDown />}
                              <Typography 
                                variant="h6" 
                                color={scenario.result.totalChange >= 0 ? 'success.main' : 'error.main'}
                              >
                                {scenario.result.totalChange >= 0 ? '+' : ''}{scenario.result.totalChange.toLocaleString('ru-RU')} ₽
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Изменение vs базового
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                            <Typography variant="h6" color="info.main">
                              {scenario.result.monthlyImpact >= 0 ? '+' : ''}{scenario.result.monthlyImpact.toLocaleString('ru-RU')} ₽
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ежемесячное влияние
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {scenario.result.goalImpact && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>Влияние на цели:</strong> {scenario.result.goalImpact}
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {scenarios.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Calculate sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Настройте и запустите сценарий
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Измените параметры слева и нажмите "Запустить сценарий" 
                  для анализа финансовых последствий
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default WhatIfModeling; 