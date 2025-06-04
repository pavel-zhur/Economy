import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
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
  Grid,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  AccountTree,
  AttachMoney,
  SwapHoriz,
  Warning,
  CheckCircle,
  Error,
  FolderOpen,
  Folder,
} from '@mui/icons-material';

function PlanTreeView() {
  const [expanded, setExpanded] = useState(['1', '5']);
  const [selected, setSelected] = useState('');
  const [showTransactions, setShowTransactions] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Древовидная структура планов с over/under
  const plansTree = {
    '1': {
      id: '1',
      name: 'Основной фонд',
      type: 'fund',
      actualBalance: 150000,
      plannedBalance: 145000,
      variance: 5000,
      isConstraint: true,
      children: ['2', '3', '4'],
      transactions: [
        { id: 1, date: '2024-03-15', amount: 80000, description: 'Зарплата', type: 'income' },
        { id: 2, date: '2024-03-16', amount: -15000, description: 'Перевод в резерв', type: 'virtual_transfer' },
      ],
    },
    '2': {
      id: '2',
      name: 'Резервный фонд',
      type: 'savings',
      actualBalance: 50000,
      plannedBalance: 55000,
      variance: -5000,
      isConstraint: false,
      parentId: '1',
      targetAmount: 100000,
      children: [],
      transactions: [
        { id: 3, date: '2024-03-16', amount: 15000, description: 'Перевод из основного', type: 'virtual_transfer' },
      ],
    },
    '3': {
      id: '3',
      name: 'Отпуск',
      type: 'goal',
      actualBalance: 75000,
      plannedBalance: 70000,
      variance: 5000,
      isConstraint: true,
      parentId: '1',
      targetAmount: 100000,
      children: ['10', '11'],
      transactions: [],
    },
    '4': {
      id: '4',
      name: 'Новый ноутбук',
      type: 'goal',
      actualBalance: 25000,
      plannedBalance: 30000,
      variance: -5000,
      isConstraint: false,
      parentId: '1',
      targetAmount: 80000,
      children: [],
      transactions: [],
    },
    '5': {
      id: '5',
      name: 'Ежемесячные расходы',
      type: 'expense',
      actualBalance: 45000,
      plannedBalance: 40000,
      variance: 5000,
      isConstraint: true,
      children: ['6', '7', '8', '9'],
      transactions: [],
    },
    '6': {
      id: '6',
      name: 'Продукты',
      type: 'expense',
      actualBalance: 15000,
      plannedBalance: 20000,
      variance: -5000,
      isConstraint: false,
      parentId: '5',
      children: [],
      transactions: [
        { id: 4, date: '2024-03-18', amount: -5000, description: 'Супермаркет', type: 'expense' },
        { id: 5, date: '2024-03-20', amount: -3000, description: 'Рынок', type: 'expense' },
      ],
    },
    '7': {
      id: '7',
      name: 'Коммунальные услуги',
      type: 'expense',
      actualBalance: 8000,
      plannedBalance: 8000,
      variance: 0,
      isConstraint: false,
      parentId: '5',
      children: [],
      transactions: [
        { id: 6, date: '2024-03-05', amount: -8000, description: 'ЖКХ март', type: 'expense' },
      ],
    },
    '8': {
      id: '8',
      name: 'Транспорт',
      type: 'expense',
      actualBalance: 5000,
      plannedBalance: 5000,
      variance: 0,
      isConstraint: false,
      parentId: '5',
      children: [],
      transactions: [],
    },
    '9': {
      id: '9',
      name: 'Развлечения',
      type: 'expense',
      actualBalance: 10000,
      plannedBalance: 7000,
      variance: 3000,
      isConstraint: false,
      parentId: '5',
      children: [],
      transactions: [],
    },
    '10': {
      id: '10',
      name: 'Билеты',
      type: 'expense',
      actualBalance: 30000,
      plannedBalance: 30000,
      variance: 0,
      isConstraint: false,
      parentId: '3',
      children: [],
      transactions: [],
    },
    '11': {
      id: '11',
      name: 'Проживание',
      type: 'expense',
      actualBalance: 45000,
      plannedBalance: 40000,
      variance: 5000,
      isConstraint: false,
      parentId: '3',
      children: [],
      transactions: [],
    },
  };

  const handleToggle = (nodeId) => {
    setExpanded(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleSelect = (nodeId) => {
    setSelected(nodeId);
  };

  const toggleTransactions = (planId) => {
    setShowTransactions(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const openPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const getVarianceColor = (variance) => {
    if (variance > 0) return 'success';
    if (variance < 0) return 'error';
    return 'default';
  };

  const getVarianceIcon = (variance) => {
    if (variance > 0) return <CheckCircle fontSize="small" />;
    if (variance < 0) return <Error fontSize="small" />;
    return null;
  };

  const getPlanTypeColor = (type) => {
    switch (type) {
      case 'fund': return 'primary';
      case 'savings': return 'success';
      case 'goal': return 'info';
      case 'expense': return 'warning';
      default: return 'default';
    }
  };

  const calculateAggregatedVariance = (planId) => {
    const plan = plansTree[planId];
    let totalVariance = plan.variance;
    
    if (plan.children && plan.children.length > 0) {
      plan.children.forEach(childId => {
        totalVariance += calculateAggregatedVariance(childId);
      });
    }
    
    return totalVariance;
  };

  const TreeNode = ({ planId, level = 0 }) => {
    const plan = plansTree[planId];
    const aggregatedVariance = calculateAggregatedVariance(planId);
    const isExpanded = expanded.includes(planId);
    const hasChildren = plan.children && plan.children.length > 0;
    
    return (
      <div>
        <ListItem sx={{ pl: level * 2 }}>
          <ListItemButton
            selected={selected === planId}
            onClick={() => handleSelect(planId)}
          >
            {hasChildren && (
              <ListItemIcon onClick={(e) => {
                e.stopPropagation();
                handleToggle(planId);
              }}>
                {isExpanded ? <ExpandMore /> : <ChevronRight />}
              </ListItemIcon>
            )}
            {!hasChildren && (
              <ListItemIcon>
                {hasChildren ? (isExpanded ? <FolderOpen /> : <Folder />) : <div style={{width: 24}} />}
              </ListItemIcon>
            )}
            
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: plan.isConstraint ? 'bold' : 'normal' }}>
                      {plan.name}
                      {plan.isConstraint && (
                        <Chip
                          label="Ограничение"
                          size="small"
                          color="error"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Баланс: {plan.actualBalance.toLocaleString('ru-RU')} ₽
                      {plan.targetAmount && ` / ${plan.targetAmount.toLocaleString('ru-RU')} ₽`}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={plan.type}
                      size="small"
                      color={getPlanTypeColor(plan.type)}
                    />
                    
                    {plan.variance !== 0 && (
                      <Chip
                        icon={getVarianceIcon(plan.variance)}
                        label={`${plan.variance > 0 ? '+' : ''}${plan.variance.toLocaleString('ru-RU')} ₽`}
                        size="small"
                        color={getVarianceColor(plan.variance)}
                      />
                    )}
                    
                    {hasChildren && aggregatedVariance !== plan.variance && (
                      <Chip
                        label={`Σ ${aggregatedVariance > 0 ? '+' : ''}${aggregatedVariance.toLocaleString('ru-RU')} ₽`}
                        size="small"
                        variant="outlined"
                        color={getVarianceColor(aggregatedVariance)}
                      />
                    )}
                    
                    <IconButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      openPlanDetails(plan);
                    }}>
                      <AttachMoney />
                    </IconButton>
                  </Box>
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {plan.children.map(childId => (
                <TreeNode key={childId} planId={childId} level={level + 1} />
              ))}
            </List>
          </Collapse>
        )}
      </div>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Древовидная структура планов
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Иерархическое представление планов с отображением расхождений (over/under), 
        транзакций и виртуальных переводов. Планы-ограничения выделены для приоритетного контроля.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Структура планов
              </Typography>
              
              <List>
                <TreeNode planId="1" />
                <TreeNode planId="5" />
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Сводка по расхождениям
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Общее расхождение:</strong> +5000 ₽
                  </Typography>
                </Alert>
              </Box>

              <Typography variant="body2" gutterBottom>
                <strong>Планы с превышением (over):</strong>
              </Typography>
              <Box sx={{ mb: 2 }}>
                {Object.values(plansTree)
                  .filter(plan => plan.variance > 0)
                  .map(plan => (
                    <Chip
                      key={plan.id}
                      label={`${plan.name}: +${plan.variance.toLocaleString('ru-RU')} ₽`}
                      size="small"
                      color="success"
                      sx={{ m: 0.5 }}
                    />
                  ))}
              </Box>

              <Typography variant="body2" gutterBottom>
                <strong>Планы с недостатком (under):</strong>
              </Typography>
              <Box>
                {Object.values(plansTree)
                  .filter(plan => plan.variance < 0)
                  .map(plan => (
                    <Chip
                      key={plan.id}
                      label={`${plan.name}: ${plan.variance.toLocaleString('ru-RU')} ₽`}
                      size="small"
                      color="error"
                      sx={{ m: 0.5 }}
                    />
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Диалог с деталями плана */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedPlan && (
          <>
            <DialogTitle>
              {selectedPlan.name}
              <Chip
                label={selectedPlan.type}
                size="small"
                color={getPlanTypeColor(selectedPlan.type)}
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Фактический баланс:
                  </Typography>
                  <Typography variant="h6">
                    {selectedPlan.actualBalance.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Плановый баланс:
                  </Typography>
                  <Typography variant="h6">
                    {selectedPlan.plannedBalance.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Транзакции и переводы
              </Typography>
              
              {selectedPlan.transactions.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell align="right">Сумма</TableCell>
                        <TableCell>Тип</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPlan.transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.date}</TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell align="right">
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('ru-RU')} ₽
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                tx.type === 'income' ? 'Доход' :
                                tx.type === 'expense' ? 'Расход' :
                                tx.type === 'virtual_transfer' ? 'Виртуальный перевод' : tx.type
                              }
                              size="small"
                              color={
                                tx.type === 'income' ? 'success' :
                                tx.type === 'expense' ? 'error' :
                                tx.type === 'virtual_transfer' ? 'info' : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Нет транзакций
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Закрыть</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default PlanTreeView; 