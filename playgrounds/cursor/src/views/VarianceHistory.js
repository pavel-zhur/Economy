import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

function VarianceHistory() {
  const [selectedPeriod, setSelectedPeriod] = useState('last6months');

  // Данные отклонений по месяцам
  const varianceData = [
    {
      month: 'Ноя 2023',
      planIncome: 80000,
      actualIncome: 75000,
      planExpense: 35000,
      actualExpense: 38000,
      incomeVariance: -5000,
      expenseVariance: 3000,
      incomeVariancePercent: -6.3,
      expenseVariancePercent: 8.6,
    },
    {
      month: 'Дек 2023',
      planIncome: 80000,
      actualIncome: 82000,
      planExpense: 40000,
      actualExpense: 45000,
      incomeVariance: 2000,
      expenseVariance: 5000,
      incomeVariancePercent: 2.5,
      expenseVariancePercent: 12.5,
    },
    {
      month: 'Янв 2024',
      planIncome: 80000,
      actualIncome: 80000,
      planExpense: 35000,
      actualExpense: 32000,
      incomeVariance: 0,
      expenseVariance: -3000,
      incomeVariancePercent: 0,
      expenseVariancePercent: -8.6,
    },
    {
      month: 'Фев 2024',
      planIncome: 80000,
      actualIncome: 85000,
      planExpense: 35000,
      actualExpense: 36000,
      incomeVariance: 5000,
      expenseVariance: 1000,
      incomeVariancePercent: 6.3,
      expenseVariancePercent: 2.9,
    },
    {
      month: 'Мар 2024',
      planIncome: 80000,
      actualIncome: 78000,
      planExpense: 35000,
      actualExpense: 33000,
      incomeVariance: -2000,
      expenseVariance: -2000,
      incomeVariancePercent: -2.5,
      expenseVariancePercent: -5.7,
    },
  ];

  // Данные по планам
  const planVarianceData = [
    { planName: 'Ежемесячные расходы', planned: 35000, actual: 36800, variance: 1800, variancePercent: 5.1 },
    { planName: 'Резервный фонд', planned: 10000, actual: 8500, variance: -1500, variancePercent: -15.0 },
    { planName: 'Отпуск', planned: 15000, actual: 16200, variance: 1200, variancePercent: 8.0 },
    { planName: 'Ноутбук', planned: 5000, actual: 4800, variance: -200, variancePercent: -4.0 },
  ];

  const getVarianceColor = (variance) => {
    if (Math.abs(variance) <= 5) return 'success';
    if (Math.abs(variance) <= 15) return 'warning';
    return 'error';
  };

  const getVarianceIcon = (variance) => {
    if (variance > 0) return '↗️';
    if (variance < 0) return '↘️';
    return '➡️';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        История отклонений от плана
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Систематический анализ отклонений фактических доходов и расходов от запланированных значений 
        для выявления ошибок планирования и корректировки будущих прогнозов.
      </Typography>

      {/* Фильтр периода */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Период анализа</InputLabel>
            <Select
              value={selectedPeriod}
              label="Период анализа"
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="last3months">Последние 3 месяца</MenuItem>
              <MenuItem value="last6months">Последние 6 месяцев</MenuItem>
              <MenuItem value="last12months">Последний год</MenuItem>
              <MenuItem value="all">Весь период</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* График отклонений во времени */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Динамика отклонений по месяцам
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={varianceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                    <Legend />
                    <Bar 
                      dataKey="incomeVariancePercent" 
                      fill="#0088FE" 
                      name="Отклонение доходов (%)"
                    />
                    <Bar 
                      dataKey="expenseVariancePercent" 
                      fill="#FF8042" 
                      name="Отклонение расходов (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Статистика точности */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика точности
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      94%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Точность доходов
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      87%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Точность расходов
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Среднее отклонение:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Доходы: ±3.2%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Расходы: ±7.8%
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Тенденция:</strong>
                </Typography>
                <Typography variant="body2" color="success.main">
                  Улучшение точности планирования за последние 3 месяца
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Детальная таблица отклонений */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Детальная история отклонений
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Месяц</TableCell>
                      <TableCell align="right">План доходы</TableCell>
                      <TableCell align="right">Факт доходы</TableCell>
                      <TableCell align="right">Отклонение</TableCell>
                      <TableCell align="right">План расходы</TableCell>
                      <TableCell align="right">Факт расходы</TableCell>
                      <TableCell align="right">Отклонение</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {varianceData.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell>{row.month}</TableCell>
                        <TableCell align="right">
                          {row.planIncome.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          {row.actualIncome.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <span>{getVarianceIcon(row.incomeVariancePercent)}</span>
                            <Chip
                              label={`${row.incomeVariancePercent > 0 ? '+' : ''}${row.incomeVariancePercent}%`}
                              size="small"
                              color={getVarianceColor(row.incomeVariancePercent)}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {row.planExpense.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          {row.actualExpense.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <span>{getVarianceIcon(row.expenseVariancePercent)}</span>
                            <Chip
                              label={`${row.expenseVariancePercent > 0 ? '+' : ''}${row.expenseVariancePercent}%`}
                              size="small"
                              color={getVarianceColor(row.expenseVariancePercent)}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Анализ по планам */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Отклонения по планам (последний месяц)
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>План</TableCell>
                      <TableCell align="right">Планируемо</TableCell>
                      <TableCell align="right">Фактически</TableCell>
                      <TableCell align="right">Отклонение</TableCell>
                      <TableCell align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {planVarianceData.map((row) => (
                      <TableRow key={row.planName}>
                        <TableCell>{row.planName}</TableCell>
                        <TableCell align="right">
                          {row.planned.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          {row.actual.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          {row.variance > 0 ? '+' : ''}{row.variance.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${row.variancePercent > 0 ? '+' : ''}${row.variancePercent}%`}
                            size="small"
                            color={getVarianceColor(Math.abs(row.variancePercent))}
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
      </Grid>
    </Box>
  );
}

export default VarianceHistory; 