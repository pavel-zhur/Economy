// Моковые данные для системы финансового планирования

// Планы
export const mockPlans = [
  {
    id: 1,
    name: 'Основной фонд',
    type: 'savings', // savings, expense, fund
    balance: 150000,
    parentId: null,
    isConstraint: true,
    children: [2, 3, 4],
  },
  {
    id: 2,
    name: 'Резервный фонд',
    type: 'savings',
    balance: 50000,
    parentId: 1,
    targetAmount: 100000,
    targetDate: '2024-12-31',
    isConstraint: false,
  },
  {
    id: 3,
    name: 'Отпуск',
    type: 'expense',
    balance: 75000,
    parentId: 1,
    targetAmount: 100000,
    targetDate: '2024-07-15',
    isConstraint: true,
  },
  {
    id: 4,
    name: 'Новый ноутбук',
    type: 'expense',
    balance: 25000,
    parentId: 1,
    targetAmount: 80000,
    targetDate: '2024-06-01',
    isConstraint: false,
  },
  {
    id: 5,
    name: 'Ежемесячные расходы',
    type: 'expense',
    balance: 45000,
    parentId: null,
    isConstraint: true,
  },
  {
    id: 6,
    name: 'Продукты',
    type: 'expense',
    balance: 15000,
    parentId: 5,
    plannedAmount: 20000,
    isConstraint: false,
  },
  {
    id: 7,
    name: 'Коммунальные услуги',
    type: 'expense',
    balance: 8000,
    parentId: 5,
    plannedAmount: 12000,
    isConstraint: false,
  },
  {
    id: 8,
    name: 'Транспорт',
    type: 'expense',
    balance: 5000,
    parentId: 5,
    plannedAmount: 8000,
    isConstraint: false,
  },
  {
    id: 9,
    name: 'Развлечения',
    type: 'expense',
    balance: 10000,
    parentId: 5,
    plannedAmount: 15000,
    isConstraint: false,
  },
];

// Транзакции
export const mockTransactions = [
  {
    id: 1,
    date: '2024-01-15',
    amount: 80000,
    type: 'income',
    category: 'Зарплата',
    description: 'Зарплата январь',
    planId: 1,
    walletId: 1,
  },
  {
    id: 2,
    date: '2024-01-16',
    amount: -15000,
    type: 'expense',
    category: 'Продукты',
    description: 'Покупки в супермаркете',
    planId: 6,
    walletId: 1,
  },
  {
    id: 3,
    date: '2024-01-17',
    amount: -12000,
    type: 'expense',
    category: 'Коммунальные',
    description: 'Оплата ЖКХ',
    planId: 7,
    walletId: 1,
  },
  {
    id: 4,
    date: '2024-01-18',
    amount: -5000,
    type: 'expense',
    category: 'Транспорт',
    description: 'Проездной билет',
    planId: 8,
    walletId: 1,
  },
  {
    id: 5,
    date: '2024-01-20',
    amount: -8000,
    type: 'expense',
    category: 'Развлечения',
    description: 'Кино и ресторан',
    planId: 9,
    walletId: 1,
  },
  {
    id: 6,
    date: '2024-01-22',
    amount: 25000,
    type: 'income',
    category: 'Подработка',
    description: 'Фриланс проект',
    planId: null,
    walletId: 1,
  },
];

// Кошельки/счета
export const mockWallets = [
  {
    id: 1,
    name: 'Основная карта',
    type: 'card',
    balance: 65000,
    coefficient: 1.0,
  },
  {
    id: 2,
    name: 'Наличные',
    type: 'cash',
    balance: 15000,
    coefficient: 1.0,
  },
  {
    id: 3,
    name: 'Сберегательный счет',
    type: 'savings',
    balance: 150000,
    coefficient: 0.95, // учет комиссии на вывод
  },
];

// Инвентаризации
export const mockInventories = [
  {
    id: 1,
    date: '2024-01-01',
    walletBalances: [
      { walletId: 1, balance: 50000 },
      { walletId: 2, balance: 10000 },
      { walletId: 3, balance: 120000 },
    ],
    totalBalance: 180000,
  },
  {
    id: 2,
    date: '2024-01-31',
    walletBalances: [
      { walletId: 1, balance: 65000 },
      { walletId: 2, balance: 15000 },
      { walletId: 3, balance: 150000 },
    ],
    totalBalance: 230000,
  },
];

// Цели
export const mockGoals = [
  {
    id: 1,
    planId: 2,
    name: 'Резервный фонд на 6 месяцев',
    targetAmount: 100000,
    currentAmount: 50000,
    targetDate: '2024-12-31',
    createdDate: '2024-01-01',
    priority: 'high',
  },
  {
    id: 2,
    planId: 3,
    name: 'Отпуск в Турции',
    targetAmount: 100000,
    currentAmount: 75000,
    targetDate: '2024-07-15',
    createdDate: '2024-01-01',
    priority: 'medium',
  },
  {
    id: 3,
    planId: 4,
    name: 'MacBook Pro',
    targetAmount: 80000,
    currentAmount: 25000,
    targetDate: '2024-06-01',
    createdDate: '2024-02-01',
    priority: 'low',
  },
];

// Запланированные доходы
export const mockPlannedIncomes = [
  {
    id: 1,
    name: 'Зарплата',
    amount: 80000,
    frequency: 'monthly',
    nextDate: '2024-02-15',
    planId: 1,
    isActive: true,
  },
  {
    id: 2,
    name: 'Фриланс',
    amount: 25000,
    frequency: 'weekly',
    nextDate: '2024-02-01',
    planId: 1,
    isActive: true,
  },
];

// Запланированные расходы
export const mockPlannedExpenses = [
  {
    id: 1,
    name: 'Аренда квартиры',
    amount: 30000,
    frequency: 'monthly',
    nextDate: '2024-02-01',
    planId: 5,
    status: 'pending',
    isOverdue: false,
  },
  {
    id: 2,
    name: 'Интернет и мобильная связь',
    amount: 2500,
    frequency: 'monthly',
    nextDate: '2024-02-05',
    planId: 5,
    status: 'pending',
    isOverdue: false,
  },
  {
    id: 3,
    name: 'Страховка автомобиля',
    amount: 15000,
    frequency: 'yearly',
    nextDate: '2024-01-30',
    planId: 5,
    status: 'overdue',
    isOverdue: true,
  },
];

// Данные для графиков прогнозов
export const mockForecastData = [
  {
    month: 'Янв 2024',
    savings: 150000,
    vacation: 75000,
    laptop: 25000,
    emergency: 50000,
  },
  {
    month: 'Фев 2024',
    savings: 170000,
    vacation: 85000,
    laptop: 35000,
    emergency: 60000,
  },
  {
    month: 'Мар 2024',
    savings: 190000,
    vacation: 95000,
    laptop: 50000,
    emergency: 70000,
  },
  {
    month: 'Апр 2024',
    savings: 210000,
    vacation: 100000,
    laptop: 65000,
    emergency: 80000,
  },
  {
    month: 'Май 2024',
    savings: 230000,
    vacation: 100000,
    laptop: 80000,
    emergency: 90000,
  },
  {
    month: 'Июн 2024',
    savings: 250000,
    vacation: 100000,
    laptop: 80000,
    emergency: 100000,
  },
];

// Данные для анализа времени задержки средств
export const mockMoneyDelayData = [
  { date: '2024-01-15', delayDays: 5, amount: 80000 },
  { date: '2024-01-22', delayDays: 12, amount: 25000 },
  { date: '2024-01-08', delayDays: 3, amount: 15000 },
  { date: '2024-01-05', delayDays: 8, amount: 40000 },
  { date: '2024-01-12', delayDays: 15, amount: 20000 },
];

// Функции для получения данных
export const getPlans = () => mockPlans;
export const getTransactions = () => mockTransactions;
export const getWallets = () => mockWallets;
export const getInventories = () => mockInventories;
export const getGoals = () => mockGoals;
export const getPlannedExpenses = () => mockPlannedExpenses;
export const getMoneyDelayData = () => mockMoneyDelayData;

// Утилиты для вычислений
export const calculateTotalBalance = () => {
  return mockWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
};

export const calculatePlansWithNegativeBalance = () => {
  return mockPlans.filter(plan => plan.balance < 0 && !plan.parentId);
};

export const calculateUnlinkedTransactions = () => {
  return mockTransactions.filter(transaction => !transaction.planId);
};

export const calculatePlanBalance = (planId, date = new Date()) => {
  const plan = mockPlans.find(p => p.id === planId);
  if (!plan) return 0;
  
  // Упрощенная логика расчета баланса плана
  const relatedTransactions = mockTransactions
    .filter(t => t.planId === planId && new Date(t.date) <= date);
  
  return relatedTransactions.reduce((sum, t) => sum + t.amount, 0);
};

// Данные для прогнозов будущего распределения
export const getForecastData = () => [
  {
    month: 'Апр 2024',
    savings: 150000,
    emergency: 30000,
    vacation: 50000,
    laptop: 15000,
  },
  {
    month: 'Май 2024',
    savings: 200000,
    emergency: 40000,
    vacation: 60000,
    laptop: 20000,
  },
  {
    month: 'Июн 2024',
    savings: 250000,
    emergency: 50000,
    vacation: 70000,
    laptop: 25000,
  },
  {
    month: 'Июл 2024',
    savings: 300000,
    emergency: 60000,
    vacation: 80000,
    laptop: 30000,
  },
  {
    month: 'Авг 2024',
    savings: 350000,
    emergency: 70000,
    vacation: 90000,
    laptop: 35000,
  },
  {
    month: 'Сен 2024',
    savings: 400000,
    emergency: 80000,
    vacation: 100000,
    laptop: 40000,
  },
];

// Данные для планируемых доходов
export const getPlannedIncomes = () => [
  {
    id: 1,
    name: 'Зарплата основная',
    amount: 80000,
    frequency: 'monthly',
    nextDate: '2024-06-15',
    category: 'Работа'
  },
  {
    id: 2,
    name: 'Фриланс проекты',
    amount: 25000,
    frequency: 'irregular',
    nextDate: '2024-06-20',
    category: 'Доп.доходы'
  },
  {
    id: 3,
    name: 'Дивиденды',
    amount: 5000,
    frequency: 'quarterly',
    nextDate: '2024-07-01',
    category: 'Инвестиции'
  }
];

// Расширенные данные планов
export const getPlansDetailed = () => [
  {
    id: 1,
    name: 'Резервный фонд',
    type: 'savings',
    balance: 30000,
    targetAmount: 150000,
    targetDate: '2024-12-31',
    autoDistribution: true,
    distributionPercent: 10
  },
  {
    id: 2,
    name: 'Отпуск',
    type: 'goal',
    balance: 50000,
    targetAmount: 100000,
    targetDate: '2024-08-01',
    autoDistribution: true,
    distributionPercent: 10
  },
  {
    id: 3,
    name: 'Новый ноутбук',
    type: 'goal',
    balance: 15000,
    targetAmount: 80000,
    targetDate: '2024-06-30',
    autoDistribution: false,
    distributionPercent: 5
  },
  {
    id: 4,
    name: 'Ежемесячные расходы',
    type: 'expenses',
    balance: 40000,
    targetAmount: 40000,
    targetDate: 'ongoing',
    autoDistribution: true,
    distributionPercent: 50
  }
];

// Данные для анализа эффективности
export const getEfficiencyData = () => ({
  overallScore: 87,
  planCompletion: 92,
  budgetAdherence: 85,
  goalAchievement: 78,
  forecastAccuracy: 91,
  monthlyTrend: [
    { month: 'Дек 2023', score: 82 },
    { month: 'Янв 2024', score: 85 },
    { month: 'Фев 2024', score: 87 },
    { month: 'Мар 2024', score: 89 },
    { month: 'Апр 2024', score: 87 },
    { month: 'Май 2024', score: 92 }
  ]
});

// Данные для календаря
export const getCalendarEvents = () => [
  {
    id: 1,
    title: 'Зарплата',
    date: '2024-06-15',
    amount: 80000,
    type: 'income',
    category: 'regular'
  },
  {
    id: 2,
    title: 'Аренда',
    date: '2024-06-05',
    amount: -25000,
    type: 'expense',
    category: 'mandatory'
  },
  {
    id: 3,
    title: 'Коммунальные услуги',
    date: '2024-06-10',
    amount: -8000,
    type: 'expense',
    category: 'mandatory'
  }
];

// Данные для нерегулярных операций
export const getIrregularTransactions = () => [
  {
    id: 1,
    date: '2024-03-15',
    description: 'Подарок на день рождения',
    amount: 15000,
    type: 'income',
    frequency: 'yearly',
    impact: 'positive'
  },
  {
    id: 2,
    date: '2024-02-20',
    description: 'Ремонт автомобиля',
    amount: -35000,
    type: 'expense',
    frequency: 'irregular',
    impact: 'negative'
  },
  {
    id: 3,
    date: '2024-01-10',
    description: 'Фриланс проект',
    amount: 45000,
    type: 'income',
    frequency: 'quarterly',
    impact: 'positive'
  }
]; 