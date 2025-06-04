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
  Grid,
  Alert,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getWallets, getInventories } from '../data/mockData';

function WalletInventory() {
  const wallets = getWallets();
  const inventories = getInventories();

  // Подготовка данных для графика
  const chartData = inventories.map(inventory => {
    const totalByWallets = inventory.walletBalances.reduce((sum, wb) => sum + wb.balance, 0);
    const totalByTransactions = inventory.totalBalance; // Упрощенно
    
    return {
      date: inventory.date,
      walletBalance: totalByWallets,
      transactionBalance: totalByTransactions,
      difference: totalByWallets - totalByTransactions,
    };
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Инвентаризация и соответствие баланса кошельков
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Сравнение баланса по транзакциям с балансом по кошелькам из инвентаризации.
        Расхождения помогают выявить неучтенные операции.
      </Typography>

      {/* Текущее состояние кошельков */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Текущие балансы кошельков
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Кошелек</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell align="right">Баланс</TableCell>
                      <TableCell align="right">Коэффициент</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {wallets.map((wallet) => (
                      <TableRow key={wallet.id}>
                        <TableCell>{wallet.name}</TableCell>
                        <TableCell>
                          {wallet.type === 'card' ? 'Карта' : 
                           wallet.type === 'cash' ? 'Наличные' : 'Счет'}
                        </TableCell>
                        <TableCell align="right">
                          {wallet.balance.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          {wallet.coefficient}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                История инвентаризаций
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell align="right">Баланс кошельков</TableCell>
                      <TableCell align="right">Расчетный баланс</TableCell>
                      <TableCell align="right">Расхождение</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chartData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell align="right">
                          {item.walletBalance.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell align="right">
                          {item.transactionBalance.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            color: item.difference === 0 ? 'success.main' : 
                                   item.difference > 0 ? 'warning.main' : 'error.main'
                          }}
                        >
                          {item.difference > 0 ? '+' : ''}{item.difference.toLocaleString('ru-RU')} ₽
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

      {/* График динамики балансов */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Динамика балансов
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, '']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="walletBalance" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Баланс кошельков"
                />
                <Line 
                  type="monotone" 
                  dataKey="transactionBalance" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Расчетный баланс"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Анализ расхождений */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Анализ расхождений
          </Typography>
          
          {chartData.some(item => item.difference !== 0) ? (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Обнаружены расхождения между балансами кошельков и расчетными данными!
              </Alert>
              
              <Typography variant="body1" gutterBottom>
                Возможные причины расхождений:
              </Typography>
              <ul>
                <li>Неучтенные операции (транзакции не внесены в систему)</li>
                <li>Ошибки при проведении инвентаризации</li>
                <li>Комиссии банков, которые не были учтены</li>
                <li>Курсовые разности для валютных счетов</li>
              </ul>
            </>
          ) : (
            <Alert severity="success">
              Все балансы сходятся! Учет ведется корректно.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default WalletInventory; 