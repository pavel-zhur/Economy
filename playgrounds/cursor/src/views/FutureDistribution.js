import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function FutureDistribution() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Будущее распределение по фондам и накоплениям
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Прогнозируемое распределение средств в будущем по накопительным планам и фондам.
            Здесь будет отображаться:
          </Typography>
          <ul>
            <li>Прогнозируемое распределение средств</li>
            <li>Сравнение с предыдущими прогнозами</li>
            <li>Минимальные пессимистичные цели</li>
            <li>Точки целей на конкретные даты</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
}

export default FutureDistribution; 