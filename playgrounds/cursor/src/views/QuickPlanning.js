import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Slider,
  Chip,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  FormControlLabel,
  Switch,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Add,
  Remove,
  AutoAwesome,
  Calculate,
  TrendingUp,
  AccountBalance,
  ShoppingCart,
  LocalAtm,
  SaveAlt,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

function QuickPlanning() {
  const [income, setIncome] = useState('80000');
  const [activeStep, setActiveStep] = useState(0);
  const [autoDistribute, setAutoDistribute] = useState(true);
  const [distribution, setDistribution] = useState({
    savings: 20,
    goals: 30,
    expenses: 40,
    reserve: 10,
  });

  // Быстрые шаблоны распределения
  const templates = [
    { name: 'Агрессивное накопление', savings: 40, goals: 30, expenses: 25, reserve: 5 },
    { name: 'Сбалансированное', savings: 20, goals: 30, expenses: 40, reserve: 10 },
    { name: 'Консервативное', savings: 10, goals: 20, expenses: 50, reserve: 20 },
    { name: 'Минималистичное', savings: 5, goals: 15, expenses: 60, reserve: 20 },
  ];

  // Текущие планы для быстрого распределения
  const quickPlans = [
    { id: '1', name: 'Резервный фонд', type: 'reserve', icon: <AccountBalance />, amount: 0, color: '#8884d8' },
    { id: '2', name: 'Отпуск', type: 'goal', icon: <TrendingUp />, amount: 0, color: '#82ca9d' },
    { id: '3', name: 'Продукты и быт', type: 'expense', icon: <ShoppingCart />, amount: 0, color: '#ffc658' },
    { id: '4', name: 'Накопления', type: 'savings', icon: <SaveAlt />, amount: 0, color: '#ff7c7c' },
  ];

  // Расчет распределения
  const calculateDistribution = () => {
    const incomeValue = parseFloat(income) || 0;
    return {
      savings: Math.round(incomeValue * distribution.savings / 100),
      goals: Math.round(incomeValue * distribution.goals / 100),
      expenses: Math.round(incomeValue * distribution.expenses / 100),
      reserve: Math.round(incomeValue * distribution.reserve / 100),
    };
  };

  const amounts = calculateDistribution();

  // Данные для круговой диаграммы
  const pieData = [
    { name: 'Накопления', value: amounts.savings, color: '#ff7c7c' },
    { name: 'Цели', value: amounts.goals, color: '#82ca9d' },
    { name: 'Расходы', value: amounts.expenses, color: '#ffc658' },
    { name: 'Резерв', value: amounts.reserve, color: '#8884d8' },
  ];

  const handleSliderChange = (category) => (event, newValue) => {
    if (!autoDistribute) {
      setDistribution({ ...distribution, [category]: newValue });
      return;
    }

    // Автоматическое перераспределение остальных категорий
    const diff = newValue - distribution[category];
    const otherCategories = Object.keys(distribution).filter(k => k !== category);
    const totalOthers = otherCategories.reduce((sum, k) => sum + distribution[k], 0);
    
    const newDistribution = { ...distribution, [category]: newValue };
    
    otherCategories.forEach(k => {
      const proportion = distribution[k] / totalOthers;
      newDistribution[k] = Math.max(0, Math.round(distribution[k] - diff * proportion));
    });
    
    // Корректировка до 100%
    const total = Object.values(newDistribution).reduce((sum, v) => sum + v, 0);
    if (total !== 100) {
      const maxKey = Object.keys(newDistribution).reduce((a, b) => 
        newDistribution[a] > newDistribution[b] ? a : b
      );
      newDistribution[maxKey] += 100 - total;
    }
    
    setDistribution(newDistribution);
  };

  const applyTemplate = (template) => {
    setDistribution({
      savings: template.savings,
      goals: template.goals,
      expenses: template.expenses,
      reserve: template.reserve,
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    console.log('Distribution completed:', { income, distribution, amounts });
    // Здесь будет логика сохранения распределения
  };

  const steps = ['Укажите доход', 'Настройте распределение', 'Подтвердите'];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Быстрое планирование
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Простой способ распределить доход по планам. Используйте шаблоны или настройте вручную.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Введите сумму дохода
                </Typography>
                
                <TextField
                  fullWidth
                  label="Сумма дохода"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  type="number"
                  InputProps={{
                    startAdornment: <LocalAtm sx={{ mr: 1, color: 'text.secondary' }} />,
                    endAdornment: '₽',
                  }}
                  sx={{ mb: 3 }}
                />

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Быстрый ввод:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[50000, 80000, 100000, 150000].map((amount) => (
                    <Chip
                      key={amount}
                      label={`${amount.toLocaleString('ru-RU')} ₽`}
                      onClick={() => setIncome(amount.toString())}
                      color={income === amount.toString() ? 'primary' : 'default'}
                    />
                  ))}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleNext}
                  sx={{ mt: 3 }}
                  disabled={!income || parseFloat(income) <= 0}
                >
                  Далее
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Совет:</strong> Укажите чистый доход после вычета налогов.
                Система поможет оптимально распределить средства между накоплениями,
                целями и текущими расходами.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      )}

      {activeStep === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Распределение дохода
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoDistribute}
                        onChange={(e) => setAutoDistribute(e.target.checked)}
                      />
                    }
                    label="Авто-баланс"
                  />
                </Box>

                {/* Шаблоны */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Быстрые шаблоны:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {templates.map((template) => (
                      <Chip
                        key={template.name}
                        label={template.name}
                        onClick={() => applyTemplate(template)}
                        icon={<AutoAwesome />}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Слайдеры распределения */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Накопления: {distribution.savings}% ({amounts.savings.toLocaleString('ru-RU')} ₽)
                  </Typography>
                  <Slider
                    value={distribution.savings}
                    onChange={handleSliderChange('savings')}
                    valueLabelDisplay="auto"
                    color="error"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Цели: {distribution.goals}% ({amounts.goals.toLocaleString('ru-RU')} ₽)
                  </Typography>
                  <Slider
                    value={distribution.goals}
                    onChange={handleSliderChange('goals')}
                    valueLabelDisplay="auto"
                    color="success"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Текущие расходы: {distribution.expenses}% ({amounts.expenses.toLocaleString('ru-RU')} ₽)
                  </Typography>
                  <Slider
                    value={distribution.expenses}
                    onChange={handleSliderChange('expenses')}
                    valueLabelDisplay="auto"
                    color="warning"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Резервный фонд: {distribution.reserve}% ({amounts.reserve.toLocaleString('ru-RU')} ₽)
                  </Typography>
                  <Slider
                    value={distribution.reserve}
                    onChange={handleSliderChange('reserve')}
                    valueLabelDisplay="auto"
                    color="primary"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button onClick={handleBack}>
                    Назад
                  </Button>
                  <Button variant="contained" onClick={handleNext} sx={{ flexGrow: 1 }}>
                    Далее
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Визуализация
                </Typography>
                
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.value.toLocaleString('ru-RU')} ₽`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Общая сумма: {parseFloat(income).toLocaleString('ru-RU')} ₽
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeStep === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Подтверждение распределения
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Проверьте распределение перед сохранением. 
                    Средства будут виртуально переведены на соответствующие планы.
                  </Typography>
                </Alert>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="Общий доход"
                      secondary={`${parseFloat(income).toLocaleString('ru-RU')} ₽`}
                    />
                  </ListItem>
                  <Divider />
                  
                  {quickPlans.map((plan) => {
                    const categoryMap = {
                      'reserve': 'reserve',
                      'goal': 'goals',
                      'expense': 'expenses',
                      'savings': 'savings',
                    };
                    const amount = amounts[categoryMap[plan.type]];
                    
                    return (
                      <ListItem key={plan.id}>
                        <Box sx={{ mr: 2 }}>{plan.icon}</Box>
                        <ListItemText
                          primary={plan.name}
                          secondary={`${distribution[categoryMap[plan.type]]}%`}
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="h6" color={plan.color}>
                            {amount.toLocaleString('ru-RU')} ₽
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button onClick={handleBack}>
                    Назад
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={handleComplete}
                    sx={{ flexGrow: 1 }}
                    startIcon={<Calculate />}
                  >
                    Применить распределение
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Что дальше?
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="1. Средства будут распределены"
                    secondary="Виртуальные переводы на планы"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="2. Отслеживайте прогресс"
                    secondary="Смотрите балансы планов"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="3. Корректируйте при необходимости"
                    secondary="Используйте актуализацию"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default QuickPlanning; 