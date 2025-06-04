import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Slider,
  Alert,
  Chip,
  Divider,
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
  BarChart,
  Bar,
} from 'recharts';
import { PlayArrow, Refresh } from '@mui/icons-material';

function WhatIfAnalysis() {
  const [scenario, setScenario] = useState({
    salaryChange: 0,
    expenseChange: 0,
    savingsRateChange: 0,
    oneTimeExpense: 0,
    oneTimeIncome: 0,
  });

  const [selectedScenario, setSelectedScenario] = useState('custom');

  // Базовые данные (текущая ситуация)
  const baselineData = [
    { month: 'Апр 2024', totalBalance: 230000, savings: 150000, goals: 80000 },
    { month: 'Май 2024', totalBalance: 310000, savings: 200000, goals: 110000 },
    { month: 'Июн 2024', totalBalance: 390000, savings: 250000, goals: 140000 },
    { month: 'Июл 2024', totalBalance: 470000, savings: 300000, goals: 170000 },
    { month: 'Авг 2024', totalBalance: 550000, savings: 350000, goals: 200000 },
    { month: 'Сен 2024', totalBalance: 630000, savings: 400000, goals: 230000 },
  ];

  // Расчет сценария
  const calculateScenario = () => {
    const multiplier = 1 + (scenario.salaryChange / 100);
    const expenseMultiplier = 1 + (scenario.expenseChange / 100);
    const savingsMultiplier = 1 + (scenario.savingsRateChange / 100);

    return baselineData.map((item, index) => {
      const monthlyIncrease = 80000 * multiplier / expenseMultiplier;
      const adjustedSavings = item.savings + (monthlyIncrease * savingsMultiplier * index);
      const oneTimeEffect = index === 1 ? scenario.oneTimeExpense - scenario.oneTimeIncome : 0;
      
      return {
        ...item,
        scenarioBalance: item.totalBalance + (monthlyIncrease * index) - oneTimeEffect,
        scenarioSavings: adjustedSavings,
        scenarioGoals: item.goals + (monthlyIncrease * 0.3 * index),
      };
    });
  };

  const scenarioData = calculateScenario();

  const predefinedScenarios = {
    'salary-increase': { salaryChange: 20, expenseChange: 5, savingsRateChange: 15, oneTimeExpense: 0, oneTimeIncome: 0 },
    'job-loss': { salaryChange: -100, expenseChange: -30, savingsRateChange: -100, oneTimeExpense: 0, oneTimeIncome: 0 },
    'big-purchase': { salaryChange: 0, expenseChange: 0, savingsRateChange: 0, oneTimeExpense: 150000, oneTimeIncome: 0 },
    'inheritance': { salaryChange: 0, expenseChange: 0, savingsRateChange: 0, oneTimeExpense: 0, oneTimeIncome: 500000 },
  };

  const handleScenarioChange = (newScenario) => {
    setSelectedScenario(newScenario);
    if (newScenario !== 'custom') {
      setScenario(predefinedScenarios[newScenario]);
    }
  };

  const resetScenario = () => {
    setScenario({
      salaryChange: 0,
      expenseChange: 0,
      savingsRateChange: 0,
      oneTimeExpense: 0,
      oneTimeIncome: 0,
    });
    setSelectedScenario('custom');
  };

  const getImpactColor = (value) => {
    if (value > 10) return 'success';
    if (value > 0) return 'primary';
    if (value > -10) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Моделирование "Что если"
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Интерактивное моделирование финансовых последствий различных жизненных сценариев 
        и изменений в доходах или расходах.
      </Typography>

      <Grid container spacing={3}>
        {/* Панель настроек сценария */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Настройки сценария
              </Typography>

              {/* Предустановленные сценарии */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Готовые сценарии</InputLabel>
                <Select
                  value={selectedScenario}
                  label="Готовые сценарии"
                  onChange={(e) => handleScenarioChange(e.target.value)}
                >
                  <MenuItem value="custom">Пользовательский</MenuItem>
                  <MenuItem value="salary-increase">Повышение зарплаты</MenuItem>
                  <MenuItem value="job-loss">Потеря работы</MenuItem>
                  <MenuItem value="big-purchase">Крупная покупка</MenuItem>
                  <MenuItem value="inheritance">Наследство</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ mb: 2 }} />

              {/* Настройки доходов */}
              <Typography variant="body2" gutterBottom>
                Изменение зарплаты: {scenario.salaryChange}%
              </Typography>
              <Slider
                value={scenario.salaryChange}
                onChange={(e, value) => setScenario({...scenario, salaryChange: value})}
                min={-100}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                sx={{ mb: 3 }}
                color={getImpactColor(scenario.salaryChange)}
              />

              {/* Настройки расходов */}
              <Typography variant="body2" gutterBottom>
                Изменение расходов: {scenario.expenseChange}%
              </Typography>
              <Slider
                value={scenario.expenseChange}
                onChange={(e, value) => setScenario({...scenario, expenseChange: value})}
                min={-50}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                sx={{ mb: 3 }}
                color={getImpactColor(-scenario.expenseChange)}
              />

              {/* Настройки накоплений */}
              <Typography variant="body2" gutterBottom>
                Изменение нормы накоплений: {scenario.savingsRateChange}%
              </Typography>
              <Slider
                value={scenario.savingsRateChange}
                onChange={(e, value) => setScenario({...scenario, savingsRateChange: value})}
                min={-100}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                sx={{ mb: 3 }}
                color={getImpactColor(scenario.savingsRateChange)}
              />

              {/* Разовые операции */}
              <TextField
                fullWidth
                label="Разовый расход"
                type="number"
                value={scenario.oneTimeExpense}
                onChange={(e) => setScenario({...scenario, oneTimeExpense: Number(e.target.value)})}
                sx={{ mb: 2 }}
                InputProps={{ endAdornment: '₽' }}
              />

              <TextField
                fullWidth
                label="Разовый доход"
                type="number"
                value={scenario.oneTimeIncome}
                onChange={(e) => setScenario({...scenario, oneTimeIncome: Number(e.target.value)})}
                sx={{ mb: 3 }}
                InputProps={{ endAdornment: '₽' }}
              />

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Refresh />}
                onClick={resetScenario}
              >
                Сбросить
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Результаты моделирования */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Прогноз финансового состояния
              </Typography>
              
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scenarioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, '']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="totalBalance" 
                      stroke="#0088FE" 
                      strokeDasharray="5 5"
                      name="Базовый сценарий"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="scenarioBalance" 
                      stroke="#FF8042" 
                      strokeWidth={3}
                      name="Новый сценарий"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Анализ влияния */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Анализ влияния изменений
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color={getImpactColor(scenario.salaryChange) + '.main'}>
                      {scenario.salaryChange > 0 ? '+' : ''}{scenario.salaryChange}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Изменение доходов
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color={getImpactColor(-scenario.expenseChange) + '.main'}>
                      {scenario.expenseChange > 0 ? '+' : ''}{scenario.expenseChange}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Изменение расходов
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color={getImpactColor(scenario.savingsRateChange) + '.main'}>
                      {scenario.savingsRateChange > 0 ? '+' : ''}{scenario.savingsRateChange}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Изменение накоплений
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {((scenarioData[scenarioData.length - 1]?.scenarioBalance - scenarioData[scenarioData.length - 1]?.totalBalance) || 0).toLocaleString('ru-RU')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Итоговая разница (₽)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Рекомендации */}
              <Box sx={{ mt: 3 }}>
                {scenario.salaryChange < -50 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Значительное снижение доходов может потребовать кардинального пересмотра 
                    финансовых планов и активации резервного фонда.
                  </Alert>
                )}
                
                {scenario.oneTimeExpense > 100000 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Крупная разовая трата значительно повлияет на достижение финансовых целей. 
                    Рассмотрите растягивание покупки во времени.
                  </Alert>
                )}
                
                {scenario.salaryChange > 20 && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Повышение доходов открывает возможности для ускорения достижения целей 
                    или создания дополнительных финансовых подушек.
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default WhatIfAnalysis; 