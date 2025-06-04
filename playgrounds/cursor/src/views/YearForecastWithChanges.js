import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function YearForecastWithChanges() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Прогноз на год с изменениями
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Прогноз финансового состояния через год при внесении изменений в доходы и расходы.
            Здесь будет отображаться:
          </Typography>
          <ul>
            <li>Интерактивная панель для ввода изменений</li>
            <li>Прогнозирование баланса с учетом изменений</li>
            <li>Сравнительный график с базовым сценарием</li>
            <li>Анализ влияния изменений на достижение целей</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
}

export default YearForecastWithChanges; 