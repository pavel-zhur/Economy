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
  FlagOutlined,
  TrendingUp,
  Schedule,
} from '@mui/icons-material';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getGoals } from '../data/mockData';

function GoalsProgress() {
  const goals = getGoals();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Не указан';
    }
  };

  const calculateRequiredMonthlyAmount = (goal) => {
    const today = new Date();
    const targetDate = parseISO(goal.targetDate);
    const daysLeft = differenceInDays(targetDate, today);
    const monthsLeft = Math.max(daysLeft / 30, 1);
    const amountLeft = goal.targetAmount - goal.currentAmount;
    
    return Math.max(amountLeft / monthsLeft, 0);
  };

  const GoalCard = ({ goal }) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const requiredMonthly = calculateRequiredMonthlyAmount(goal);
    const daysLeft = differenceInDays(parseISO(goal.targetDate), new Date());
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: `${getPriorityColor(goal.priority)}.main`, mr: 2 }}>
              <FlagOutlined />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div">
                {goal.name}
              </Typography>
              <Chip 
                label={getPriorityText(goal.priority)}
                size="small"
                color={getPriorityColor(goal.priority)}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>

          {/* Прогресс */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Прогресс
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progress.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progress >= 100 ? 'success.main' : 
                                   progress >= 75 ? 'primary.main' : 
                                   progress >= 50 ? 'warning.main' : 'error.main'
                }
              }}
            />
          </Box>

          {/* Суммы */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Накоплено
              </Typography>
              <Typography variant="h6" color="success.main">
                {goal.currentAmount.toLocaleString('ru-RU')} ₽
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Цель
              </Typography>
              <Typography variant="h6" color="primary.main">
                {goal.targetAmount.toLocaleString('ru-RU')} ₽
              </Typography>
            </Grid>
          </Grid>

          {/* Дата и расчеты */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Schedule sx={{ mr: 1, fontSize: 16 }} />
              <Typography variant="body2" color="text.secondary">
                Дата цели: {format(parseISO(goal.targetDate), 'dd MMMM yyyy', { locale: ru })}
              </Typography>
            </Box>
            
            <Typography variant="body2" color={daysLeft > 0 ? 'success.main' : 'error.main'}>
              {daysLeft > 0 ? `Осталось ${daysLeft} дней` : `Просрочено на ${Math.abs(daysLeft)} дней`}
            </Typography>
          </Box>

          {/* Требуемый темп накоплений */}
          {progress < 100 && daysLeft > 0 && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'info.light', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              <TrendingUp sx={{ mr: 1, color: 'info.main' }} />
              <Box>
                <Typography variant="body2" color="info.dark">
                  Нужно откладывать:
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="info.dark">
                  {requiredMonthly.toLocaleString('ru-RU')} ₽/мес
                </Typography>
              </Box>
            </Box>
          )}

          {/* Статус достижения */}
          {progress >= 100 && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'success.light', 
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="body1" fontWeight="bold" color="success.dark">
                🎉 Цель достигнута!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Прогресс по целям накоплений
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Текущий прогресс по достижению накопительных целей и динамика накоплений.
      </Typography>

      {/* Общая статистика */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Общая статистика по целям
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary.main">
                  {goals.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего целей
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {goals.filter(g => (g.currentAmount / g.targetAmount) >= 1).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Достигнуто
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="info.main">
                  {goals.reduce((sum, g) => sum + g.currentAmount, 0).toLocaleString('ru-RU')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Накоплено, ₽
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  {goals.reduce((sum, g) => sum + g.targetAmount, 0).toLocaleString('ru-RU')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Общая цель, ₽
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Карточки целей */}
      {goals.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Цели не заданы
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Добавьте финансовые цели для отслеживания прогресса
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => (
            <Grid item xs={12} md={6} lg={4} key={goal.id}>
              <GoalCard goal={goal} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default GoalsProgress; 