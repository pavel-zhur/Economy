import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function IncomeDistribution() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Распределение доходов по планам, расходам и категориям
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Показывает как реальные доходы распределялись по планам в прошлом и как прогнозируемые доходы будут распределяться в будущем.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default IncomeDistribution; 