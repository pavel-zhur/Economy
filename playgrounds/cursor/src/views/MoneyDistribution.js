import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Savings,
  ShoppingCart,
  AccountBalance,
  TrendingUp,
} from '@mui/icons-material';
import { getPlans, calculateTotalBalance } from '../data/mockData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

function MoneyDistribution() {
  const plans = getPlans();
  const totalBalance = calculateTotalBalance();

  // Фильтруем планы для отображения
  const activePlans = plans.filter(plan => 
    plan.balance > 0 && 
    !plan.parentId // Показываем только корневые планы
  );

  // Подготавливаем данные для графиков
  const distributionData = activePlans.map(plan => ({
    id: plan.id,
    name: plan.name,
    value: plan.balance,
    type: plan.type,
    percentage: ((plan.balance / totalBalance) * 100).toFixed(1),
  }));

  // Группируем по типам планов
  const plansByType = {
    savings: plans.filter(plan => plan.type === 'savings' && plan.balance > 0),
    expense: plans.filter(plan => plan.type === 'expense' && plan.balance > 0),
    fund: plans.filter(plan => plan.type === 'fund' && plan.balance > 0),
  };

  const typeData = Object.entries(plansByType).map(([type, planList]) => ({
    type: type === 'savings' ? 'Накопления' : type === 'expense' ? 'Расходы' : 'Фонды',
    value: planList.reduce((sum, plan) => sum + plan.balance, 0),
    count: planList.length,
  }));

  const getTypeIcon = (type) => {
    switch (type) {
      case 'savings': return <Savings />;
      case 'expense': return <ShoppingCart />;
      case 'fund': return <AccountBalance />;
      default: return <TrendingUp />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'savings': return 'success';
      case 'expense': return 'warning';
      case 'fund': return 'primary';
      default: return 'default';
    }
  };

  const PlanCard = ({ plan }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${getTypeColor(plan.type)}.main`, mr: 2 }}>
            {getTypeIcon(plan.type)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              {plan.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {plan.type === 'savings' ? 'Накопления' : 
               plan.type === 'expense' ? 'Расходы' : 'Фонд'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" color="primary.main">
              {plan.balance.toLocaleString('ru-RU')} ₽
            </Typography>
            <Chip 
              label={`${((plan.balance / totalBalance) * 100).toFixed(1)}%`}
              size="small"
              color={getTypeColor(plan.type)}
            />
          </Box>
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={(plan.balance / totalBalance) * 100}
          sx={{ 
            height: 8, 
            borderRadius: 4,
            bgcolor: 'grey.200',
          }}
        />
        
        {plan.targetAmount && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Цель: {plan.targetAmount.toLocaleString('ru-RU')} ₽
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min((plan.balance / plan.targetAmount) * 100, 100)}
              sx={{ 
                height: 4, 
                borderRadius: 2,
                mt: 0.5,
              }}
              color="secondary"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Распределение фактических денег по планам
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Текущее распределение всех фактических средств между активными планами.
        Показывается в виде процента от общего баланса.
      </Typography>

      <Grid container spacing={3}>
        {/* Общая статистика */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Общая статистика
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      {totalBalance.toLocaleString('ru-RU')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Общий баланс, ₽
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {activePlans.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Активных планов
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {plansByType.savings.reduce((sum, plan) => sum + plan.balance, 0).toLocaleString('ru-RU')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      В накоплениях, ₽
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {plansByType.expense.reduce((sum, plan) => sum + plan.balance, 0).toLocaleString('ru-RU')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      На расходы, ₽
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Круговая диаграмма распределения */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Распределение по планам
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString('ru-RU')} ₽`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Столбчатая диаграмма по типам */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Распределение по типам планов
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Сумма']} />
                    <Bar dataKey="value" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Детальная информация по планам */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Детализация по планам
          </Typography>
          <Grid container spacing={2}>
            {activePlans.map((plan) => (
              <Grid item xs={12} md={6} lg={4} key={plan.id}>
                <PlanCard plan={plan} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MoneyDistribution; 