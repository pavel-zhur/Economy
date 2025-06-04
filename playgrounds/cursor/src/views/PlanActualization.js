import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider,
} from '@mui/material';
import {
  SwapHoriz,
  CheckCircle,
  Warning,
  Info,
  ArrowForward,
  History,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

function PlanActualization() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [actualizationDialogOpen, setActualizationDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTarget, setTransferTarget] = useState('');

  // Планы с расхождениями
  const plansWithVariance = [
    {
      id: '1',
      name: 'Продукты',
      type: 'expense',
      plannedAmount: 20000,
      actualAmount: 15000,
      variance: -5000,
      period: 'Март 2024',
      status: 'under',
      parentId: '5',
      parentName: 'Ежемесячные расходы',
    },
    {
      id: '2',
      name: 'Развлечения',
      type: 'expense',
      plannedAmount: 7000,
      actualAmount: 10000,
      variance: 3000,
      period: 'Март 2024',
      status: 'over',
      parentId: '5',
      parentName: 'Ежемесячные расходы',
    },
    {
      id: '3',
      name: 'Отпуск',
      type: 'goal',
      plannedAmount: 70000,
      actualAmount: 75000,
      variance: 5000,
      period: 'Март 2024',
      status: 'over',
      parentId: null,
      parentName: null,
    },
    {
      id: '4',
      name: 'Новый ноутбук',
      type: 'goal',
      plannedAmount: 30000,
      actualAmount: 25000,
      variance: -5000,
      period: 'Март 2024',
      status: 'under',
      parentId: null,
      parentName: null,
    },
  ];

  // История актуализаций
  const actualizationHistory = [
    {
      id: 1,
      date: '2024-02-28',
      plan: 'Продукты',
      variance: -3000,
      action: 'Перевод из "Развлечения"',
      result: 'Сбалансировано',
    },
    {
      id: 2,
      date: '2024-02-28',
      plan: 'Транспорт',
      variance: 2000,
      action: 'Перевод в "Резервный фонд"',
      result: 'Сбалансировано',
    },
    {
      id: 3,
      date: '2024-01-31',
      plan: 'Коммунальные услуги',
      variance: -500,
      action: 'Перевод из "Основной фонд"',
      result: 'Сбалансировано',
    },
  ];

  const availablePlans = [
    { id: 'main', name: 'Основной фонд', balance: 150000 },
    { id: 'reserve', name: 'Резервный фонд', balance: 50000 },
    { id: 'savings', name: 'Накопления', balance: 100000 },
  ];

  const handleActualize = (plan) => {
    setSelectedPlan(plan);
    setTransferAmount(Math.abs(plan.variance).toString());
    setActualizationDialogOpen(true);
    setActiveStep(0);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    // Здесь будет логика завершения актуализации
    console.log('Actualization completed', {
      plan: selectedPlan,
      amount: transferAmount,
      target: transferTarget,
    });
    setActualizationDialogOpen(false);
    setActiveStep(0);
    setTransferAmount('');
    setTransferTarget('');
  };

  const getStatusColor = (status) => {
    return status === 'over' ? 'success' : 'error';
  };

  const getStatusIcon = (status) => {
    return status === 'over' ? <TrendingUp /> : <TrendingDown />;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Актуализация планов
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Процесс закрытия расхождений между плановыми и фактическими показателями. 
        Сэкономленные средства можно перераспределить, а перерасходы требуют покрытия.
      </Typography>

      {/* Общая статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {plansWithVariance.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Планов с расхождениями
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                +13000 ₽
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Общая экономия
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                -10000 ₽
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Общий перерасход
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                +3000 ₽
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Чистое расхождение
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Планы с расхождениями */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Планы, требующие актуализации
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>План</TableCell>
                  <TableCell>Период</TableCell>
                  <TableCell align="right">План</TableCell>
                  <TableCell align="right">Факт</TableCell>
                  <TableCell align="right">Расхождение</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plansWithVariance.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {plan.name}
                      </Typography>
                      {plan.parentName && (
                        <Typography variant="caption" color="text.secondary">
                          {plan.parentName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{plan.period}</TableCell>
                    <TableCell align="right">
                      {plan.plannedAmount.toLocaleString('ru-RU')} ₽
                    </TableCell>
                    <TableCell align="right">
                      {plan.actualAmount.toLocaleString('ru-RU')} ₽
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={plan.variance > 0 ? 'success.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {plan.variance > 0 ? '+' : ''}{plan.variance.toLocaleString('ru-RU')} ₽
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(plan.status)}
                        label={plan.status === 'over' ? 'Экономия' : 'Перерасход'}
                        size="small"
                        color={getStatusColor(plan.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SwapHoriz />}
                        onClick={() => handleActualize(plan)}
                      >
                        Актуализировать
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Совет:</strong> Вы можете актуализировать планы по отдельности или 
              сбалансировать родительский план, что автоматически закроет расхождения дочерних планов.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* История актуализаций */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <History sx={{ mr: 1, verticalAlign: 'middle' }} />
            История актуализаций
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>План</TableCell>
                  <TableCell align="right">Расхождение</TableCell>
                  <TableCell>Действие</TableCell>
                  <TableCell>Результат</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actualizationHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.plan}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={record.variance > 0 ? 'success.main' : 'error.main'}
                      >
                        {record.variance > 0 ? '+' : ''}{record.variance.toLocaleString('ru-RU')} ₽
                      </Typography>
                    </TableCell>
                    <TableCell>{record.action}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.result}
                        size="small"
                        color="success"
                        icon={<CheckCircle />}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Диалог актуализации */}
      <Dialog 
        open={actualizationDialogOpen} 
        onClose={() => setActualizationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Актуализация плана "{selectedPlan?.name}"
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Alert 
                severity={selectedPlan.status === 'over' ? 'success' : 'warning'}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  {selectedPlan.status === 'over' 
                    ? `Экономия ${selectedPlan.variance.toLocaleString('ru-RU')} ₽. Выберите, куда перевести сэкономленные средства.`
                    : `Перерасход ${Math.abs(selectedPlan.variance).toLocaleString('ru-RU')} ₽. Выберите источник покрытия.`
                  }
                </Typography>
              </Alert>

              <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                  <StepLabel>Подтверждение суммы</StepLabel>
                  <StepContent>
                    <TextField
                      fullWidth
                      label="Сумма для актуализации"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      type="number"
                      InputProps={{
                        endAdornment: '₽',
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Button variant="contained" onClick={handleNext}>
                      Далее
                    </Button>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>
                    {selectedPlan.status === 'over' ? 'Выбор получателя' : 'Выбор источника'}
                  </StepLabel>
                  <StepContent>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>
                        {selectedPlan.status === 'over' ? 'Перевести в' : 'Взять из'}
                      </InputLabel>
                      <Select
                        value={transferTarget}
                        label={selectedPlan.status === 'over' ? 'Перевести в' : 'Взять из'}
                        onChange={(e) => setTransferTarget(e.target.value)}
                      >
                        {availablePlans.map((plan) => (
                          <MenuItem key={plan.id} value={plan.id}>
                            {plan.name} (баланс: {plan.balance.toLocaleString('ru-RU')} ₽)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button onClick={handleBack}>
                        Назад
                      </Button>
                      <Button variant="contained" onClick={handleNext}>
                        Далее
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>Подтверждение</StepLabel>
                  <StepContent>
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Операция:</strong> Виртуальный перевод
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Сумма:</strong> {transferAmount} ₽
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>
                          {selectedPlan.status === 'over' ? 'Из:' : 'В:'}
                        </strong> {selectedPlan.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>
                          {selectedPlan.status === 'over' ? 'В:' : 'Из:'}
                        </strong> {availablePlans.find(p => p.id === transferTarget)?.name}
                      </Typography>
                    </Paper>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button onClick={handleBack}>
                        Назад
                      </Button>
                      <Button variant="contained" color="success" onClick={handleComplete}>
                        Выполнить
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActualizationDialogOpen(false)}>
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PlanActualization; 