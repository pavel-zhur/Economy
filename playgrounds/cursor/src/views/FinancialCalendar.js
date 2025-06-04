import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function FinancialCalendar() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Календарь финансовых событий
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Визуализация всех важных финансовых событий на календаре.
            Здесь будет отображаться:
          </Typography>
          <ul>
            <li>Даты плановых и фактических доходов</li>
            <li>Даты плановых и фактических расходов</li>
            <li>Сроки крупных регулярных платежей</li>
            <li>Напоминания о предстоящих событиях</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
}

export default FinancialCalendar; 