import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function YearForecast() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Прогноз на год при текущем образе жизни
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Прогноз финансового состояния через год при сохранении текущих привычек.
            Здесь будет отображаться:
          </Typography>
          <ul>
            <li>Анализ текущих средних доходов и расходов</li>
            <li>Прогнозирование баланса на основе текущих привычек</li>
            <li>График траектории изменения баланса</li>
            <li>Выделение потенциальных проблем и положительной динамики</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
}

export default YearForecast; 