import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
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
  Grid,
  Alert,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Edit,
  Link,
  LinkOff,
  Info,
  FilterList,
  Add,
  SwapHoriz,
} from '@mui/icons-material';

function TransactionManagement() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTab, setSelectedTab] = useState(0);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [filterUnlinked, setFilterUnlinked] = useState(false);

  // Моковые данные транзакций
  const transactions = [
    {
      id: 1,
      date: '2024-03-20',
      amount: 80000,
      type: 'income',
      category: 'Зарплата',
      description: 'Зарплата за март',
      account: 'Основная карта',
      linkedPlan: { id: '1', name: 'Основной фонд' },
      isVirtual: false,
    },
    {
      id: 2,
      date: '2024-03-19',
      amount: -15000,
      type: 'expense',
      category: 'Продукты',
      description: 'Супермаркет Перекресток',
      account: 'Основная карта',
      linkedPlan: { id: '6', name: 'Продукты' },
      isVirtual: false,
    },
    {
      id: 3,
      date: '2024-03-18',
      amount: -8000,
      type: 'expense',
      category: 'Коммунальные',
      description: 'ЖКХ март',
      account: 'Основная карта',
      linkedPlan: { id: '7', name: 'Коммунальные услуги' },
      isVirtual: false,
    },
    {
      id: 4,
      date: '2024-03-17',
      amount: 25000,
      type: 'income',
      category: 'Фриланс',
      description: 'Проект для клиента',
      account: 'Основная карта',
      linkedPlan: null,
      isVirtual: false,
    },
    {
      id: 5,
      date: '2024-03-16',
      amount: -5000,
      type: 'expense',
      category: 'Развлечения',
      description: 'Кино и ресторан',
      account: 'Наличные',
      linkedPlan: null,
      isVirtual: false,
    },
    {
      id: 6,
      date: '2024-03-16',
      amount: -15000,
      type: 'virtual_transfer',
      category: 'Перевод',
      description: 'Перевод в резервный фонд',
      account: 'Виртуальный',
      linkedPlan: { id: '2', name: 'Резервный фонд' },
      isVirtual: true,
      fromPlan: { id: '1', name: 'Основной фонд' },
      toPlan: { id: '2', name: 'Резервный фонд' },
    },
    {
      id: 7,
      date: '2024-03-15',
      amount: 5000,
      type: 'reconciliation',
      category: 'Сверка',
      description: 'Корректировка расхождения по плану "Продукты"',
      account: 'Виртуальный',
      linkedPlan: { id: '6', name: 'Продукты' },
      isVirtual: true,
    },
  ];

  // Виртуальные переводы
  const virtualTransfers = transactions.filter(t => t.isVirtual);
  
  // Обычные транзакции
  const regularTransactions = transactions.filter(t => !t.isVirtual);

  // Непривязанные транзакции
  const unlinkedTransactions = regularTransactions.filter(t => !t.linkedPlan);

  const availablePlans = [
    { id: '1', name: 'Основной фонд', type: 'fund' },
    { id: '2', name: 'Резервный фонд', type: 'savings' },
    { id: '3', name: 'Отпуск', type: 'goal' },
    { id: '4', name: 'Новый ноутбук', type: 'goal' },
    { id: '5', name: 'Ежемесячные расходы', type: 'expense' },
    { id: '6', name: 'Продукты', type: 'expense' },
    { id: '7', name: 'Коммунальные услуги', type: 'expense' },
    { id: '8', name: 'Транспорт', type: 'expense' },
    { id: '9', name: 'Развлечения', type: 'expense' },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(0);
  };

  const openLinkDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setSelectedPlanId(transaction.linkedPlan?.id || '');
    setLinkDialogOpen(true);
  };

  const handleLinkTransaction = () => {
    // Здесь будет логика привязки транзакции к плану
    console.log('Linking transaction', selectedTransaction.id, 'to plan', selectedPlanId);
    setLinkDialogOpen(false);
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'income': return 'success';
      case 'expense': return 'error';
      case 'virtual_transfer': return 'info';
      case 'reconciliation': return 'warning';
      default: return 'default';
    }
  };

  const getCurrentTransactions = () => {
    switch (selectedTab) {
      case 0: return filterUnlinked ? unlinkedTransactions : regularTransactions;
      case 1: return virtualTransfers;
      default: return [];
    }
  };

  const currentTransactions = getCurrentTransactions();
  const displayedTransactions = currentTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Управление транзакциями
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Просмотр и управление транзакциями, привязка к планам, виртуальные переводы и сверки.
      </Typography>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {transactions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего транзакций
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {regularTransactions.filter(t => t.linkedPlan).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Привязано к планам
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {unlinkedTransactions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Не привязано
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {virtualTransfers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Виртуальных переводов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Основная таблица */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab 
                label="Обычные транзакции" 
                icon={
                  <Badge badgeContent={unlinkedTransactions.length} color="warning">
                    <Box />
                  </Badge>
                }
              />
              <Tab label="Виртуальные переводы" />
            </Tabs>
          </Box>

          {selectedTab === 0 && (
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Button
                variant={filterUnlinked ? 'contained' : 'outlined'}
                startIcon={<LinkOff />}
                onClick={() => setFilterUnlinked(!filterUnlinked)}
                size="small"
              >
                Только непривязанные
              </Button>
              <Button
                variant="outlined"
                startIcon={<Add />}
                size="small"
              >
                Добавить транзакцию
              </Button>
            </Box>
          )}

          {unlinkedTransactions.length > 0 && selectedTab === 0 && !filterUnlinked && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              У вас есть {unlinkedTransactions.length} непривязанных транзакций. 
              Рекомендуется привязать их к планам для корректного учета.
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Счет</TableCell>
                  <TableCell>План</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description}
                      </Typography>
                      {transaction.isVirtual && transaction.fromPlan && transaction.toPlan && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Chip label={transaction.fromPlan.name} size="small" />
                          <SwapHoriz fontSize="small" />
                          <Chip label={transaction.toPlan.name} size="small" />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('ru-RU')} ₽
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.category}
                        size="small"
                        color={getTransactionTypeColor(transaction.type)}
                      />
                    </TableCell>
                    <TableCell>{transaction.account}</TableCell>
                    <TableCell>
                      {transaction.linkedPlan ? (
                        <Chip
                          label={transaction.linkedPlan.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          label="Не привязано"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small"
                        onClick={() => openLinkDialog(transaction)}
                        disabled={transaction.isVirtual && transaction.type === 'virtual_transfer'}
                      >
                        {transaction.linkedPlan ? <Edit /> : <Link />}
                      </IconButton>
                      <IconButton size="small">
                        <Info />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={currentTransactions.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице:"
          />
        </CardContent>
      </Card>

      {/* Диалог привязки транзакции */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTransaction?.linkedPlan ? 'Изменить привязку транзакции' : 'Привязать транзакцию к плану'}
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Транзакция:</strong> {selectedTransaction.description}
                </Typography>
                <Typography variant="body2">
                  <strong>Сумма:</strong> {selectedTransaction.amount.toLocaleString('ru-RU')} ₽
                </Typography>
                <Typography variant="body2">
                  <strong>Дата:</strong> {selectedTransaction.date}
                </Typography>
              </Alert>

              <FormControl fullWidth>
                <InputLabel>Выберите план</InputLabel>
                <Select
                  value={selectedPlanId}
                  label="Выберите план"
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Не привязывать</em>
                  </MenuItem>
                  {availablePlans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name} ({plan.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedPlanId && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Транзакция будет привязана к плану "{availablePlans.find(p => p.id === selectedPlanId)?.name}"
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleLinkTransaction} variant="contained">
            {selectedTransaction?.linkedPlan ? 'Изменить' : 'Привязать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TransactionManagement; 