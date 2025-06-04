import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Slider,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  TrendingDown,
  TrendingFlat,
  TrendingUp,
  Edit,
  Save,
  Cancel,
  Info,
  Timeline,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function ScenarioManagement() {
  const [selectedScenario, setSelectedScenario] = useState('realistic');
  const [editingPlan, setEditingPlan] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Планы с воронкой оценок
  const plansWithScenarios = [
    {
      id: '1',
      name: 'Отпуск в Европе',
      type: 'goal',
      currentBalance: 75000,
      scenarios: {
        pessimistic: { monthly: 5000, total: 120000, months: 9 },
        realistic: { monthly: 10000, total: 150000, months: 8 },
        optimistic: { monthly: 15000, total: 180000, months: 6 },
      },
      confidence: 75,
    },
    {
      id: '2',
      name: 'Новый автомобиль',
      type: 'goal',
      currentBalance: 200000,
      scenarios: {
        pessimistic: { monthly: 20000, total: 800000, months: 30 },
        realistic: { monthly: 30000, total: 1000000, months: 27 },
        optimistic: { monthly: 50000, total: 1200000, months: 20 },
      },
      confidence: 60,
    },
    {
      id: '3',
      name: 'Резервный фонд',
      type: 'savings',
      currentBalance: 50000,
      scenarios: {
        pessimistic: { monthly: 5000, total: 200000, months: 30 },
        realistic: { monthly: 10000, total: 300000, months: 25 },
        optimistic: { monthly: 15000, total: 400000, months: 23 },
      },
      confidence: 90,
    },
    {
      id: '4',
      name: 'Ремонт квартиры',
      type: 'goal',
      currentBalance: 100000,
      scenarios: {
        pessimistic: { monthly: 10000, total: 300000, months: 20 },
        realistic: { monthly: 15000, total: 350000, months: 17 },
        optimistic: { monthly: 25000, total: 400000, months: 12 },
      },
      confidence: 45,
    },
  ];

  // История сужения воронки
  const funnelHistory = [
    { date: '2024-01', plan: 'Отпуск в Европе', range: [100000, 250000], actual: 175000 },
    { date: '2024-02', plan: 'Отпуск в Европе', range: [120000, 200000], actual: 160000 },
    { date: '2024-03', plan: 'Отпуск в Европе', range: [120000, 180000], actual: 150000 },
  ];

  // Данные для графика прогноза
  const generateForecastData = () => {
    const months = 12;
    const data = [];
    const currentDate = new Date();
    
    for (let i = 0; i <= months; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() + i);
      
      const monthData = {
        month: date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }),
      };
      
      plansWithScenarios.forEach(plan => {
        const pessimistic = plan.currentBalance + (plan.scenarios.pessimistic.monthly * i);
        const realistic = plan.currentBalance + (plan.scenarios.realistic.monthly * i);
        const optimistic = plan.currentBalance + (plan.scenarios.optimistic.monthly * i);
        
        monthData[`${plan.name}_min`] = Math.min(pessimistic, plan.scenarios[selectedScenario].total);
        monthData[`${plan.name}_max`] = Math.min(optimistic, plan.scenarios[selectedScenario].total);
        monthData[`${plan.name}`] = Math.min(realistic, plan.scenarios[selectedScenario].total);
      });
      
      data.push(monthData);
    }
    
    return data;
  };

  const forecastData = generateForecastData();

  const handleScenarioChange = (event, newScenario) => {
    if (newScenario !== null) {
      setSelectedScenario(newScenario);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan.id);
    setEditValues({
      pessimistic: plan.scenarios.pessimistic.monthly,
      realistic: plan.scenarios.realistic.monthly,
      optimistic: plan.scenarios.optimistic.monthly,
    });
  };

  const handleSave = () => {
    // Здесь будет логика сохранения
    console.log('Saving values:', editValues);
    setEditingPlan(null);
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditValues({});
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  const getScenarioIcon = (scenario) => {
    switch (scenario) {
      case 'pessimistic': return <TrendingDown />;
      case 'realistic': return <TrendingFlat />;
      case 'optimistic': return <TrendingUp />;
      default: return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Управление сценариями
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Управление воронкой оценок для планов. По мере получения информации диапазон оценок сужается,
        повышая точность прогнозов.
      </Typography>

      {/* Выбор сценария */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Активный сценарий
          </Typography>
          
          <ToggleButtonGroup
            value={selectedScenario}
            exclusive
            onChange={handleScenarioChange}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="pessimistic">
              <TrendingDown sx={{ mr: 1 }} />
              Пессимистичный
            </ToggleButton>
            <ToggleButton value="realistic">
              <TrendingFlat sx={{ mr: 1 }} />
              Реалистичный
            </ToggleButton>
            <ToggleButton value="optimistic">
              <TrendingUp sx={{ mr: 1 }} />
              Оптимистичный
            </ToggleButton>
          </ToggleButtonGroup>

          <Alert severity="info">
            <Typography variant="body2">
              Выбранный сценарий влияет на все прогнозы и расчеты в системе.
              Используйте пессимистичный сценарий для консервативного планирования.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Таблица планов с воронкой */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Планы и их сценарии
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>План</TableCell>
                  <TableCell align="center">Текущий баланс</TableCell>
                  <TableCell align="center">Пессимистичный</TableCell>
                  <TableCell align="center">Реалистичный</TableCell>
                  <TableCell align="center">Оптимистичный</TableCell>
                  <TableCell align="center">Уверенность</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plansWithScenarios.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {plan.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {plan.type === 'goal' ? 'Цель' : 'Накопления'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {plan.currentBalance.toLocaleString('ru-RU')} ₽
                    </TableCell>
                    <TableCell align="center">
                      {editingPlan === plan.id ? (
                        <TextField
                          size="small"
                          value={editValues.pessimistic}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            pessimistic: e.target.value
                          })}
                          sx={{ width: 100 }}
                        />
                      ) : (
                        <Box>
                          <Typography variant="body2">
                            {plan.scenarios.pessimistic.monthly.toLocaleString('ru-RU')} ₽/мес
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {plan.scenarios.pessimistic.total.toLocaleString('ru-RU')} ₽ за {plan.scenarios.pessimistic.months} мес
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingPlan === plan.id ? (
                        <TextField
                          size="small"
                          value={editValues.realistic}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            realistic: e.target.value
                          })}
                          sx={{ width: 100 }}
                        />
                      ) : (
                        <Box>
                          <Typography variant="body2">
                            {plan.scenarios.realistic.monthly.toLocaleString('ru-RU')} ₽/мес
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {plan.scenarios.realistic.total.toLocaleString('ru-RU')} ₽ за {plan.scenarios.realistic.months} мес
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingPlan === plan.id ? (
                        <TextField
                          size="small"
                          value={editValues.optimistic}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            optimistic: e.target.value
                          })}
                          sx={{ width: 100 }}
                        />
                      ) : (
                        <Box>
                          <Typography variant="body2">
                            {plan.scenarios.optimistic.monthly.toLocaleString('ru-RU')} ₽/мес
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {plan.scenarios.optimistic.total.toLocaleString('ru-RU')} ₽ за {plan.scenarios.optimistic.months} мес
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: 60, mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={plan.confidence} 
                            color={getConfidenceColor(plan.confidence)}
                          />
                        </Box>
                        <Typography variant="body2">
                          {plan.confidence}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {editingPlan === plan.id ? (
                        <Box>
                          <IconButton size="small" onClick={handleSave}>
                            <Save />
                          </IconButton>
                          <IconButton size="small" onClick={handleCancel}>
                            <Cancel />
                          </IconButton>
                        </Box>
                      ) : (
                        <IconButton size="small" onClick={() => handleEdit(plan)}>
                          <Edit />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* График прогноза с воронкой */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Прогноз накоплений с учетом сценариев
          </Typography>
          
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <RechartsTooltip formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, '']} />
                <Legend />
                
                {plansWithScenarios.map((plan, index) => {
                  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];
                  const color = colors[index % colors.length];
                  
                  return (
                    <React.Fragment key={plan.id}>
                      <Area
                        type="monotone"
                        dataKey={`${plan.name}_min`}
                        stackId={plan.id}
                        stroke={color}
                        fill={color}
                        fillOpacity={0.2}
                        name={`${plan.name} (мин)`}
                      />
                      <Area
                        type="monotone"
                        dataKey={`${plan.name}_max`}
                        stackId={plan.id}
                        stroke={color}
                        fill={color}
                        fillOpacity={0.2}
                        name={`${plan.name} (макс)`}
                      />
                      <Line
                        type="monotone"
                        dataKey={plan.name}
                        stroke={color}
                        strokeWidth={2}
                        name={plan.name}
                      />
                    </React.Fragment>
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* История сужения воронки */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
            История уточнения оценок
          </Typography>
          
          <Grid container spacing={2}>
            {funnelHistory.map((record, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {record.plan}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {record.date}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Диапазон: {record.range[0].toLocaleString('ru-RU')} - {record.range[1].toLocaleString('ru-RU')} ₽
                    </Typography>
                    <Typography variant="body2" color="primary">
                      Уточнено: {record.actual.toLocaleString('ru-RU')} ₽
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={((record.actual - record.range[0]) / (record.range[1] - record.range[0])) * 100}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Тренд:</strong> Воронка оценок сужается по мере приближения к цели.
              Точность прогнозов повысилась на 40% за последние 3 месяца.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ScenarioManagement; 