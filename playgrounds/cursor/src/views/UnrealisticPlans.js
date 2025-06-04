import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function UnrealisticPlans() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Анализ нереалистичных планов
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Выявление планов, основанных на чрезмерно оптимистичных прогнозах.
            Здесь будет отображаться:
          </Typography>
          <ul>
            <li>Сравнение прошлых корректировок с первоначальными планами</li>
            <li>Таблица с процентным отклонением от планов</li>
            <li>График разрыва между фактом и амбициозными планами</li>
            <li>Индикаторы проблемных планов</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UnrealisticPlans; 