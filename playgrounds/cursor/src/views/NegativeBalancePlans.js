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
  Alert,
  Grid,
} from '@mui/material';
import { calculatePlansWithNegativeBalance, calculateUnlinkedTransactions } from '../data/mockData';

function NegativeBalancePlans() {
  const negativePlans = calculatePlansWithNegativeBalance();
  const unlinkedTransactions = calculateUnlinkedTransactions();
  
  const totalNegativeBalance = negativePlans.reduce((sum, plan) => sum + Math.abs(plan.balance), 0);
  const totalUnlinkedAmount = unlinkedTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Планы с отрицательным балансом и неподкрепленные транзакции
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Проблемные зоны в финансовом планировании: планы с отрицательным балансом и транзакции без привязки к планам.
      </Typography>

      <Grid container spacing={3}>
        {/* Планы с отрицательным балансом */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Планы с отрицательным балансом
              </Typography>
              
              {negativePlans.length === 0 ? (
                <Alert severity="success">
                  Нет планов с отрицательным балансом!
                </Alert>
              ) : (
                <>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Обнаружено {negativePlans.length} планов с отрицательным балансом
                  </Alert>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Название плана</TableCell>
                          <TableCell align="right">Отрицательный баланс</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {negativePlans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell>{plan.name}</TableCell>
                            <TableCell 
                              align="right"
                              sx={{ color: 'error.main', fontWeight: 'bold' }}
                            >
                              {plan.balance.toLocaleString('ru-RU')} ₽
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Общий отрицательный баланс: {totalNegativeBalance.toLocaleString('ru-RU')} ₽
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Неподкрепленные транзакции */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Неподкрепленные транзакции
              </Typography>
              
              {unlinkedTransactions.length === 0 ? (
                <Alert severity="success">
                  Все транзакции привязаны к планам!
                </Alert>
              ) : (
                <>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Найдено {unlinkedTransactions.length} транзакций без привязки к планам
                  </Alert>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Дата</TableCell>
                          <TableCell>Описание</TableCell>
                          <TableCell align="right">Сумма</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {unlinkedTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {transaction.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {transaction.category}
                              </Typography>
                            </TableCell>
                            <TableCell 
                              align="right"
                              sx={{ 
                                color: transaction.amount > 0 ? 'success.main' : 'error.main',
                                fontWeight: 'bold'
                              }}
                            >
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('ru-RU')} ₽
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Общая сумма неподкрепленных транзакций: {totalUnlinkedAmount.toLocaleString('ru-RU')} ₽
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Общая сводка */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Общая сводка проблем
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="error.main">
                      {negativePlans.length}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Планов с отрицательным балансом
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="warning.main">
                      {unlinkedTransactions.length}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Неподкрепленных транзакций
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="info.main">
                      {(totalNegativeBalance + totalUnlinkedAmount).toLocaleString('ru-RU')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Общая сумма проблем, ₽
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {(negativePlans.length > 0 || unlinkedTransactions.length > 0) && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    Рекомендации по решению проблем:
                  </Typography>
                  <ul>
                    <li>Привяжите неподкрепленные транзакции к соответствующим планам</li>
                    <li>Проверьте корректность балансов планов с отрицательными значениями</li>
                    <li>Рассмотрите возможность перераспределения средств между планами</li>
                    <li>Проведите актуализацию планов для устранения расхождений</li>
                  </ul>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default NegativeBalancePlans; 