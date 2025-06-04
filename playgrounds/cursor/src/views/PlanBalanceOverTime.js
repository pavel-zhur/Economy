import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function PlanBalanceOverTime() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Баланс планов во времени
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Динамика балансов планов во времени для выявления потенциальных кассовых разрывов.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default PlanBalanceOverTime; 