import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMoneyDelayData } from '../data/mockData';

function MoneyDelayTime() {
  const delayData = getMoneyDelayData();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Время задержки средств
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Показывает, как долго средства задерживаются с момента поступления до момента использования.
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Анализ времени задержки
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={delayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  type="category"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  dataKey="delayDays"
                  label={{ value: 'Дни задержки', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'delayDays' ? `${value} дней` : `${value.toLocaleString('ru-RU')} ₽`,
                    name === 'delayDays' ? 'Задержка' : 'Сумма'
                  ]}
                />
                <Scatter dataKey="delayDays" fill="#0088FE" />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default MoneyDelayTime; 