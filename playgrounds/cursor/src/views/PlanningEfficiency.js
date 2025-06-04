import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  Alert,
} from '@mui/material';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Star, TrendingUp, CheckCircle, Warning } from '@mui/icons-material';

function PlanningEfficiency() {
  // Данные эффективности планирования
  const efficiencyMetrics = [
    { metric: 'Выполнение планов доходов', value: 95, target: 90, status: 'excellent' },
    { metric: 'Соблюдение бюджета расходов', value: 87, target: 85, status: 'good' },
    { metric: 'Достижение целей накоплений', value: 78, target: 80, status: 'warning' },
    { metric: 'Точность прогнозов', value: 92, target: 90, status: 'excellent' },
    { metric: 'Дисциплина планирования', value: 89, target: 85, status: 'good' },
  ];

  // Данные для радиального графика
  const radialData = [
    { name: 'Доходы', value: 95, fill: '#4CAF50' },
    { name: 'Расходы', value: 87, fill: '#2196F3' },
    { name: 'Накопления', value: 78, fill: '#FF9800' },
    { name: 'Прогнозы', value: 92, fill: '#9C27B0' },
    { name: 'Дисциплина', value: 89, fill: '#607D8B' },
  ];

  // Анализ планов
  const planAnalysis = [
    { 
      planName: 'Резервный фонд', 
      targetCompletion: '2024-12-31', 
      actualProgress: 75, 
      targetProgress: 80, 
      efficiency: 94, 
      status: 'on-track',
      adjustments: 2 
    },
    { 
      planName: 'Отпуск', 
      targetCompletion: '2024-08-01', 
      actualProgress: 95, 
      targetProgress: 90, 
      efficiency: 106, 
      status: 'ahead',
      adjustments: 1 
    },
    { 
      planName: 'Новый ноутбук', 
      targetCompletion: '2024-06-30', 
      actualProgress: 65, 
      targetProgress: 85, 
      efficiency: 76, 
      status: 'behind',
      adjustments: 3 
    },
    { 
      planName: 'Ежемесячные расходы', 
      targetCompletion: 'ongoing', 
      actualProgress: 88, 
      targetProgress: 90, 
      efficiency: 98, 
      status: 'on-track',
      adjustments: 0 
    },
  ];

  const monthlyEfficiency = [
    { month: 'Окт 2023', efficiency: 78, plans: 8, achieved: 6 },
    { month: 'Ноя 2023', efficiency: 82, plans: 9, achieved: 7 },
    { month: 'Дек 2023', efficiency: 85, plans: 10, achieved: 8 },
    { month: 'Янв 2024', efficiency: 89, plans: 9, achieved: 8 },
    { month: 'Фев 2024', efficiency: 91, plans: 8, achieved: 7 },
    { month: 'Мар 2024', efficiency: 87, plans: 10, achieved: 9 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'warning': return 'warning';
      case 'poor': return 'error';
      case 'ahead': return 'success';
      case 'on-track': return 'primary';
      case 'behind': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
      case 'ahead': return <CheckCircle />;
      case 'good':
      case 'on-track': return <TrendingUp />;
      case 'warning':
      case 'behind': return <Warning />;
      default: return null;
    }
  };

  const overallEfficiency = Math.round(
    efficiencyMetrics.reduce((sum, metric) => sum + metric.value, 0) / efficiencyMetrics.length
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Эффективность планирования
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Анализ эффективности достижения финансовых целей и качества планирования. 
        Оценка успешности реализации планов и выявление областей для улучшения.
      </Typography>

      <Grid container spacing={3}>
        {/* Общий показатель эффективности */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Общая эффективность
              </Typography>
              
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={overallEfficiency}
                  size={120}
                  thickness={6}
                  sx={{ color: overallEfficiency >= 90 ? 'success.main' : 
                                overallEfficiency >= 80 ? 'primary.main' : 'warning.main' }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" color="text.primary">
                    {overallEfficiency}%
                  </Typography>
                </Box>
              </Box>

              <Rating
                value={Math.floor(overallEfficiency / 20)}
                readOnly
                max={5}
                icon={<Star fontSize="inherit" />}
                emptyIcon={<Star fontSize="inherit" />}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {overallEfficiency >= 90 ? 'Отличная эффективность' :
                 overallEfficiency >= 80 ? 'Хорошая эффективность' :
                 overallEfficiency >= 70 ? 'Средняя эффективность' : 'Требует улучшения'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Визуализация метрик */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Детализация по областям
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={radialData}>
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Эффективность']} />
                    <Legend />
                  </RadialBarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Метрики производительности */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ключевые показатели эффективности
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Метрика</TableCell>
                      <TableCell align="right">Текущий результат</TableCell>
                      <TableCell align="right">Целевой показатель</TableCell>
                      <TableCell align="right">Отклонение</TableCell>
                      <TableCell>Статус</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {efficiencyMetrics.map((metric) => (
                      <TableRow key={metric.metric}>
                        <TableCell>{metric.metric}</TableCell>
                        <TableCell align="right">{metric.value}%</TableCell>
                        <TableCell align="right">{metric.target}%</TableCell>
                        <TableCell align="right">
                          <Typography 
                            color={metric.value >= metric.target ? 'success.main' : 'warning.main'}
                          >
                            {metric.value >= metric.target ? '+' : ''}{metric.value - metric.target}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(metric.status)}
                            label={
                              metric.status === 'excellent' ? 'Отлично' :
                              metric.status === 'good' ? 'Хорошо' :
                              metric.status === 'warning' ? 'Требует внимания' : 'Плохо'
                            }
                            color={getStatusColor(metric.status)}
                            size="small"
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

        {/* Анализ планов */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Эффективность по планам
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>План</TableCell>
                      <TableCell align="right">Прогресс</TableCell>
                      <TableCell align="right">Эффективность</TableCell>
                      <TableCell align="right">Корректировки</TableCell>
                      <TableCell>Статус</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {planAnalysis.map((plan) => (
                      <TableRow key={plan.planName}>
                        <TableCell>{plan.planName}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Box sx={{ width: 100, mr: 1 }}>
                              <CircularProgress
                                variant="determinate"
                                value={plan.actualProgress}
                                size={20}
                                thickness={4}
                              />
                            </Box>
                            {plan.actualProgress}%
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            color={plan.efficiency >= 100 ? 'success.main' : 
                                   plan.efficiency >= 90 ? 'primary.main' : 'warning.main'}
                          >
                            {plan.efficiency}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{plan.adjustments}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              plan.status === 'ahead' ? 'Опережает план' :
                              plan.status === 'on-track' ? 'По плану' : 'Отстает'
                            }
                            color={getStatusColor(plan.status)}
                            size="small"
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

        {/* Тренд эффективности */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Динамика эффективности
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyEfficiency.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="efficiency" fill="#0088FE" name="Эффективность %" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Рекомендации по улучшению */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Рекомендации по повышению эффективности
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Alert severity="info" sx={{ height: '100%' }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Улучшение планирования накоплений:</strong>
                    </Typography>
                    <Typography variant="body2">
                      Рассмотрите автоматическое перераспределение средств для плана "Новый ноутбук". 
                      Текущая эффективность 76% требует корректировки.
                    </Typography>
                  </Alert>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Alert severity="success" sx={{ height: '100%' }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Успешные практики:</strong>
                    </Typography>
                    <Typography variant="body2">
                      План "Отпуск" показывает отличные результаты (106% эффективности). 
                      Примените аналогичный подход к другим накопительным планам.
                    </Typography>
                  </Alert>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Alert severity="warning" sx={{ height: '100%' }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Области внимания:</strong>
                    </Typography>
                    <Typography variant="body2">
                      Частые корректировки планов (3 за месяц для "Ноутбук") указывают на 
                      необходимость более реалистичного первоначального планирования.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PlanningEfficiency; 