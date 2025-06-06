import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, Box, Grid, Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Alert, Chip, Slider, Switch, FormControlLabel, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { 
  Compare, Refresh, PlayArrow, TrendingUp, TrendingDown, Calculate, 
  ExpandMore, SwapHoriz, Timeline, Savings
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, BarChart, Bar } from 'recharts';
import { getYearForecastData, calculateModifiedYearForecast, getLifestyleChangeTemplates } from '../data/mockData';

function YearForecastWithChanges() {
  const [activeTab, setActiveTab] = useState(0);
  const [modifications, setModifications] = useState({
    income: {
      salaryIncrease: 0,
      bonusIncrease: 0,
      sideIncome: 0,
      freelanceIncome: 0
    },
    expenses: {
      rentChange: 0,
      foodChange: 0,
      transportChange: 0,
      entertainmentChange: 0,
      utilitiesChange: 0,
      newExpenses: []
    },
    savings: {
      emergencyFundIncrease: 0,
      investmentIncrease: 0,
      goalSavingsIncrease: 0
    },
    lifestyle: {
      template: 'none',
      customChanges: []
    }
  });

  const [showComparison, setShowComparison] = useState(false);
  const baselineForecast = getYearForecastData();
  const modifiedForecast = calculateModifiedYearForecast(modifications);
  const templates = getLifestyleChangeTemplates();

  const handleModificationChange = (category, field, value) => {
    setModifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const applyTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setModifications(prev => ({
        ...prev,
        ...template.changes
      }));
    }
  };

  const resetChanges = () => {
    setModifications({
      income: {
        salaryIncrease: 0,
        bonusIncrease: 0,
        sideIncome: 0,
        freelanceIncome: 0
      },
      expenses: {
        rentChange: 0,
        foodChange: 0,
        transportChange: 0,
        entertainmentChange: 0,
        utilitiesChange: 0,
        newExpenses: []
      },
      savings: {
        emergencyFundIncrease: 0,
        investmentIncrease: 0,
        goalSavingsIncrease: 0
      },
      lifestyle: {
        template: 'none',
        customChanges: []
      }
    });
  };

  // Подготовка данных для сравнения
  const comparisonData = [];
  for (let i = 0; i < 12; i++) {
    comparisonData.push({
      month: `Месяц ${i + 1}`,
      baseline: baselineForecast[i]?.total || 0,
      modified: modifiedForecast[i]?.total || 0,
      difference: (modifiedForecast[i]?.total || 0) - (baselineForecast[i]?.total || 0)
    });
  }

  const totalDifference = comparisonData[11]?.difference || 0;
  const monthlyImpact = totalDifference / 12;

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Прогноз на год с изменениями
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Интерактивный анализ того, как изменения в доходах, расходах и образе жизни 
        повлияют на ваше финансовое состояние через год.
      </Typography>

      {/* Быстрые шаблоны */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Быстрые сценарии изменений
          </Typography>
          <Grid container spacing={2}>
            {templates.map(template => (
              <Grid item xs={12} md={4} key={template.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      boxShadow: 2,
                      borderColor: 'primary.main'
                    }
                  }}
                  onClick={() => applyTemplate(template.id)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {template.icon} {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {template.description}
                    </Typography>
                    <Typography variant="h6" color={template.impact >= 0 ? 'success.main' : 'error.main'}>
                      {template.impact >= 0 ? '+' : ''}{template.impact.toLocaleString('ru-RU')} ₽/год
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Панель изменений */}
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  ⚙️ Настройка изменений
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<Refresh />}
                    onClick={resetChanges}
                    size="small"
                  >
                    Сбросить
                  </Button>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showComparison}
                        onChange={(e) => setShowComparison(e.target.checked)}
                      />
                    }
                    label="Сравнение"
                  />
                </Box>
              </Box>

              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Доходы" />
                <Tab label="Расходы" />
                <Tab label="Накопления" />
              </Tabs>

              {/* Доходы */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Изменение зарплаты
                  </Typography>
                  <Box sx={{ px: 1, mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {modifications.income.salaryIncrease >= 0 ? '+' : ''}{modifications.income.salaryIncrease}%
                    </Typography>
                    <Slider
                      value={modifications.income.salaryIncrease}
                      onChange={(e, value) => handleModificationChange('income', 'salaryIncrease', value)}
                      min={-50}
                      max={100}
                      step={5}
                      marks={[
                        { value: -25, label: '-25%' },
                        { value: 0, label: '0%' },
                        { value: 25, label: '+25%' },
                        { value: 50, label: '+50%' }
                      ]}
                    />
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Дополнительный доход (₽/месяц)
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={modifications.income.sideIncome}
                    onChange={(e) => handleModificationChange('income', 'sideIncome', parseInt(e.target.value) || 0)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle2" gutterBottom>
                    Фриланс доход (₽/месяц)
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={modifications.income.freelanceIncome}
                    onChange={(e) => handleModificationChange('income', 'freelanceIncome', parseInt(e.target.value) || 0)}
                    sx={{ mb: 2 }}
                  />
                </Box>
              </TabPanel>

              {/* Расходы */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Изменение аренды
                  </Typography>
                  <Box sx={{ px: 1, mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {modifications.expenses.rentChange >= 0 ? '+' : ''}{modifications.expenses.rentChange}%
                    </Typography>
                    <Slider
                      value={modifications.expenses.rentChange}
                      onChange={(e, value) => handleModificationChange('expenses', 'rentChange', value)}
                      min={-50}
                      max={50}
                      step={5}
                      marks={[
                        { value: -25, label: '-25%' },
                        { value: 0, label: '0%' },
                        { value: 25, label: '+25%' }
                      ]}
                    />
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Изменение трат на еду
                  </Typography>
                  <Box sx={{ px: 1, mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {modifications.expenses.foodChange >= 0 ? '+' : ''}{modifications.expenses.foodChange}%
                    </Typography>
                    <Slider
                      value={modifications.expenses.foodChange}
                      onChange={(e, value) => handleModificationChange('expenses', 'foodChange', value)}
                      min={-50}
                      max={50}
                      step={5}
                    />
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Изменение трат на транспорт
                  </Typography>
                  <Box sx={{ px: 1, mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {modifications.expenses.transportChange >= 0 ? '+' : ''}{modifications.expenses.transportChange}%
                    </Typography>
                    <Slider
                      value={modifications.expenses.transportChange}
                      onChange={(e, value) => handleModificationChange('expenses', 'transportChange', value)}
                      min={-50}
                      max={100}
                      step={5}
                    />
                  </Box>
                </Box>
              </TabPanel>

              {/* Накопления */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Увеличение резервного фонда (₽/месяц)
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={modifications.savings.emergencyFundIncrease}
                    onChange={(e) => handleModificationChange('savings', 'emergencyFundIncrease', parseInt(e.target.value) || 0)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle2" gutterBottom>
                    Увеличение инвестиций (₽/месяц)
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={modifications.savings.investmentIncrease}
                    onChange={(e) => handleModificationChange('savings', 'investmentIncrease', parseInt(e.target.value) || 0)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle2" gutterBottom>
                    Дополнительные накопления на цели (₽/месяц)
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={modifications.savings.goalSavingsIncrease}
                    onChange={(e) => handleModificationChange('savings', 'goalSavingsIncrease', parseInt(e.target.value) || 0)}
                    sx={{ mb: 2 }}
                  />
                </Box>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>

        {/* Результаты */}
        <Grid item xs={12} lg={7}>
          {/* Сводка изменений */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Итоговое влияние изменений
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="h6">
                      {comparisonData[11]?.baseline.toLocaleString('ru-RU')} ₽
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Базовый прогноз
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary.main">
                      {comparisonData[11]?.modified.toLocaleString('ru-RU')} ₽
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      С изменениями
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    bgcolor: totalDifference >= 0 ? 'success.lighter' : 'error.lighter', 
                    borderRadius: 1 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {totalDifference >= 0 ? <TrendingUp /> : <TrendingDown />}
                      <Typography 
                        variant="h6" 
                        color={totalDifference >= 0 ? 'success.main' : 'error.main'}
                      >
                        {totalDifference >= 0 ? '+' : ''}{totalDifference.toLocaleString('ru-RU')} ₽
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Разница
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* График сравнения */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Сравнение прогнозов
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k ₽`}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value.toLocaleString('ru-RU')} ₽`, 
                        name === 'baseline' ? 'Базовый прогноз' : 'С изменениями'
                      ]}
                      labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="baseline" 
                      stroke="#999" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      name="Базовый прогноз"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="modified" 
                      stroke="#0088FE" 
                      strokeWidth={3}
                      name="С изменениями"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Анализ влияния на цели */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Влияние на достижение целей
              </Typography>
              
              {totalDifference > 100000 && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Отличный результат!</strong> Ваши изменения значительно ускоряют 
                    достижение финансовых целей. При таких темпах вы сможете достичь 
                    большинства целей на 3-6 месяцев раньше запланированного.
                  </Typography>
                </Alert>
              )}

              {totalDifference > 0 && totalDifference <= 100000 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Положительная динамика.</strong> Изменения помогают улучшить 
                    финансовое положение, но эффект умеренный. Рассмотрите дополнительные 
                    способы оптимизации.
                  </Typography>
                </Alert>
              )}

              {totalDifference < 0 && totalDifference >= -50000 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Небольшое снижение.</strong> Изменения незначительно замедляют 
                    достижение целей. Проанализируйте возможности компенсации.
                  </Typography>
                </Alert>
              )}

              {totalDifference < -50000 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Значительное ухудшение.</strong> Такие изменения серьезно 
                    влияют на ваши финансовые планы. Рекомендуется пересмотреть стратегию.
                  </Typography>
                </Alert>
              )}

              <Typography variant="body2" color="text.secondary">
                Ежемесячное влияние: {monthlyImpact >= 0 ? '+' : ''}{monthlyImpact.toLocaleString('ru-RU')} ₽
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default YearForecastWithChanges; 