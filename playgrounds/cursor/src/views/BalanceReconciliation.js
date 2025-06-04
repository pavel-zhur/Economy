import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  LinearProgress,
  Divider,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  ExpandMore,
  ExpandLess,
  Refresh,
  AccountBalance,
  Receipt,
  AccountTree,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function BalanceReconciliation() {
  const [expandedSections, setExpandedSections] = useState({
    wallets: true,
    transactions: true,
    plans: true,
  });

  // Данные для сверки
  const reconciliationData = {
    date: '2024-03-20',
    wallets: {
      total: 230000,
      details: [
        { name: 'Основная карта', balance: 65000, lastInventory: '2024-03-20' },
        { name: 'Наличные', balance: 15000, lastInventory: '2024-03-20' },
        { name: 'Сберегательный счет', balance: 150000, lastInventory: '2024-03-15' },
      ],
    },
    transactions: {
      total: 228500,
      income: 385000,
      expense: -156500,
      details: {
        linked: 195000,
        unlinked: 33500,
      },
    },
    plans: {
      total: 230000,
      actualBalance: 215000,
      reservedBalance: 15000,
      details: [
        { name: 'Основной фонд', actual: 150000, reserved: 0, variance: 5000 },
        { name: 'Резервный фонд', actual: 50000, reserved: 0, variance: -5000 },
        { name: 'Отпуск', actual: 75000, reserved: 5000, variance: 5000 },
        { name: 'Новый ноутбук', actual: 25000, reserved: 5000, variance: -5000 },
        { name: 'Ежемесячные расходы', actual: 45000, reserved: 5000, variance: 5000 },
        { name: 'Нераспределенные', actual: -130000, reserved: 0, variance: 0 },
      ],
    },
  };

  // История сходимости
  const convergenceHistory = [
    { date: '2024-01-01', wallets: 180000, transactions: 180000, plans: 180000, discrepancy: 0 },
    { date: '2024-01-15', wallets: 195000, transactions: 194500, plans: 195000, discrepancy: 500 },
    { date: '2024-02-01', wallets: 210000, transactions: 210000, plans: 209500, discrepancy: 500 },
    { date: '2024-02-15', wallets: 220000, transactions: 219000, plans: 220000, discrepancy: 1000 },
    { date: '2024-03-01', wallets: 225000, transactions: 225000, plans: 225000, discrepancy: 0 },
    { date: '2024-03-20', wallets: 230000, transactions: 228500, plans: 230000, discrepancy: 1500 },
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getDiscrepancyStatus = () => {
    const walletTotal = reconciliationData.wallets.total;
    const transactionTotal = reconciliationData.transactions.total;
    const planTotal = reconciliationData.plans.total;
    
    const maxDiscrepancy = Math.max(
      Math.abs(walletTotal - transactionTotal),
      Math.abs(walletTotal - planTotal),
      Math.abs(transactionTotal - planTotal)
    );
    
    if (maxDiscrepancy === 0) return 'perfect';
    if (maxDiscrepancy <= 1000) return 'good';
    if (maxDiscrepancy <= 5000) return 'warning';
    return 'error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'perfect': return 'success';
      case 'good': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'perfect': return <CheckCircle />;
      case 'good': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      default: return null;
    }
  };

  const status = getDiscrepancyStatus();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Сверка балансов
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Проверка сходимости трех взглядов на финансы: инвентаризация кошельков, 
        сумма транзакций и сумма балансов планов.
      </Typography>

      {/* Общий статус */}
      <Alert 
        severity={getStatusColor(status)} 
        icon={getStatusIcon(status)}
        sx={{ mb: 3 }}
      >
        <Typography variant="body1">
          <strong>
            {status === 'perfect' && 'Идеальная сходимость! Все три взгляда совпадают.'}
            {status === 'good' && 'Хорошая сходимость. Небольшие расхождения в пределах нормы.'}
            {status === 'warning' && 'Обнаружены расхождения. Рекомендуется проверить данные.'}
            {status === 'error' && 'Критические расхождения! Требуется немедленная проверка.'}
          </strong>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Дата сверки: {reconciliationData.date}
        </Typography>
      </Alert>

      {/* Три карточки с балансами */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Инвентаризация кошельков
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {reconciliationData.wallets.total.toLocaleString('ru-RU')} ₽
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                По данным последней инвентаризации
              </Typography>
              <Button
                size="small"
                startIcon={expandedSections.wallets ? <ExpandLess /> : <ExpandMore />}
                onClick={() => toggleSection('wallets')}
                sx={{ mt: 2 }}
              >
                Детали
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Receipt sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">
                  Сумма транзакций
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {reconciliationData.transactions.total.toLocaleString('ru-RU')} ₽
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Доходы минус расходы
              </Typography>
              <Button
                size="small"
                startIcon={expandedSections.transactions ? <ExpandLess /> : <ExpandMore />}
                onClick={() => toggleSection('transactions')}
                sx={{ mt: 2 }}
              >
                Детали
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountTree sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">
                  Сумма балансов планов
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {reconciliationData.plans.total.toLocaleString('ru-RU')} ₽
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Фактические + резервированные
              </Typography>
              <Button
                size="small"
                startIcon={expandedSections.plans ? <ExpandLess /> : <ExpandMore />}
                onClick={() => toggleSection('plans')}
                sx={{ mt: 2 }}
              >
                Детали
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Детали кошельков */}
      <Collapse in={expandedSections.wallets}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Детализация по кошелькам
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Кошелек/Счет</TableCell>
                    <TableCell align="right">Баланс</TableCell>
                    <TableCell>Последняя инвентаризация</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reconciliationData.wallets.details.map((wallet) => (
                    <TableRow key={wallet.name}>
                      <TableCell>{wallet.name}</TableCell>
                      <TableCell align="right">
                        {wallet.balance.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={wallet.lastInventory}
                          size="small"
                          color={wallet.lastInventory === reconciliationData.date ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Итого</strong></TableCell>
                    <TableCell align="right">
                      <strong>{reconciliationData.wallets.total.toLocaleString('ru-RU')} ₽</strong>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Collapse>

      {/* Детали транзакций */}
      <Collapse in={expandedSections.transactions}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Детализация по транзакциям
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Общие доходы:
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    +{reconciliationData.transactions.income.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Общие расходы:
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {reconciliationData.transactions.expense.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Привязано к планам:
                  </Typography>
                  <Typography variant="h6">
                    {reconciliationData.transactions.details.linked.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Не привязано:
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {reconciliationData.transactions.details.unlinked.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1">
              <strong>Итого:</strong> {reconciliationData.transactions.total.toLocaleString('ru-RU')} ₽
            </Typography>
          </CardContent>
        </Card>
      </Collapse>

      {/* Детали планов */}
      <Collapse in={expandedSections.plans}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Детализация по планам
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>План</TableCell>
                    <TableCell align="right">Фактический баланс</TableCell>
                    <TableCell align="right">Резерв</TableCell>
                    <TableCell align="right">Расхождение</TableCell>
                    <TableCell align="right">Итого</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reconciliationData.plans.details.map((plan) => (
                    <TableRow key={plan.name}>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell align="right">
                        {plan.actual.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell align="right">
                        {plan.reserved.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${plan.variance > 0 ? '+' : ''}${plan.variance.toLocaleString('ru-RU')} ₽`}
                          size="small"
                          color={plan.variance > 0 ? 'success' : plan.variance < 0 ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <strong>{(plan.actual + plan.reserved).toLocaleString('ru-RU')} ₽</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Итого</strong></TableCell>
                    <TableCell align="right">
                      <strong>{reconciliationData.plans.actualBalance.toLocaleString('ru-RU')} ₽</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{reconciliationData.plans.reservedBalance.toLocaleString('ru-RU')} ₽</strong>
                    </TableCell>
                    <TableCell />
                    <TableCell align="right">
                      <strong>{reconciliationData.plans.total.toLocaleString('ru-RU')} ₽</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Collapse>

      {/* График истории сходимости */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            История сходимости балансов
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={convergenceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}.${date.getMonth() + 1}`;
                  }}
                />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, '']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="wallets" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Кошельки"
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="Транзакции"
                />
                <Line 
                  type="monotone" 
                  dataKey="plans" 
                  stroke="#FFBB28" 
                  strokeWidth={2}
                  name="Планы"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Рекомендация:</strong> Расхождение в 1500 ₽ между суммой транзакций и другими взглядами 
              может быть связано с непривязанными транзакциями или неучтенными виртуальными переводами. 
              Проверьте вкладку "Управление транзакциями" для привязки операций к планам.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}

export default BalanceReconciliation; 