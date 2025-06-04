import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function IrregularTransactions() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Нерегулярные доходы и расходы
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Анализ финансовых потоков, которые происходят нерегулярно (подарки, разовые крупные покупки, проектные доходы).
            Здесь будет отображаться:
          </Typography>
          <ul>
            <li>Таблица нерегулярных поступлений и расходов</li>
            <li>Процентное влияние на общий бюджет</li>
            <li>Анализ периодичности</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
}

export default IrregularTransactions; 