import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Schedule,
  Warning,
  CheckCircle,
  Edit,
  MoreVert,
} from '@mui/icons-material';
import { format, parseISO, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getPlannedExpenses } from '../data/mockData';

function PlannedExpenses() {
  const plannedExpenses = getPlannedExpenses();
  
  // Разделяем расходы на просроченные, сегодняшние и будущие
  const today = new Date();
  const overdue = plannedExpenses.filter(expense => 
    isBefore(parseISO(expense.nextDate), today) && expense.status !== 'completed'
  );
  const upcoming = plannedExpenses.filter(expense => 
    !isBefore(parseISO(expense.nextDate), today) || expense.status === 'completed'
  );

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue) return 'error';
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status, isOverdue) => {
    if (isOverdue) return 'Просрочено';
    switch (status) {
      case 'completed': return 'Выполнено';
      case 'pending': return 'Ожидает';
      case 'overdue': return 'Просрочено';
      default: return 'Неизвестно';
    }
  };

  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case 'daily': return 'Ежедневно';
      case 'weekly': return 'Еженедельно';
      case 'monthly': return 'Ежемесячно';
      case 'yearly': return 'Ежегодно';
      default: return 'Разово';
    }
  };

  const ExpenseTable = ({ expenses, title, showAlert = false }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Schedule sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {expenses.length > 0 && (
            <Chip 
              label={expenses.length} 
              size="small" 
              sx={{ ml: 2 }}
              color={showAlert ? 'error' : 'primary'}
            />
          )}
        </Box>
        
        {showAlert && expenses.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            У вас есть {expenses.length} просроченных платежей!
          </Alert>
        )}

        {expenses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {showAlert ? 'Нет просроченных платежей' : 'Нет запланированных расходов'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Периодичность</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={expense.isOverdue ? 600 : 400}>
                        {expense.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={500}>
                        {expense.amount.toLocaleString('ru-RU')} ₽
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={expense.isOverdue ? 'error.main' : 'text.primary'}
                      >
                        {format(parseISO(expense.nextDate), 'dd MMMM yyyy', { locale: ru })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {getFrequencyText(expense.frequency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(expense.status, expense.isOverdue)}
                        size="small"
                        color={getStatusColor(expense.status, expense.isOverdue)}
                        icon={expense.status === 'completed' ? <CheckCircle /> : 
                              expense.isOverdue ? <Warning /> : undefined}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Планируемые расходы
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Отображаются только те планы расходов, на которые есть фактические средства.
        Данные отсортированы по дате: сначала просроченные, затем ближайшие будущие.
      </Typography>

      {/* Просроченные расходы */}
      <ExpenseTable 
        expenses={overdue}
        title="Просроченные платежи"
        showAlert={true}
      />

      {/* Предстоящие расходы */}
      <ExpenseTable 
        expenses={upcoming}
        title="Предстоящие платежи"
      />

      {/* Общая статистика */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Статистика
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography variant="h4" color="error.main">
                {overdue.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Просроченных
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="primary.main">
                {upcoming.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Предстоящих
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="success.main">
                {overdue.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('ru-RU')} ₽
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Сумма просроченных
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="info.main">
                {upcoming.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('ru-RU')} ₽
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Сумма предстоящих
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default PlannedExpenses; 