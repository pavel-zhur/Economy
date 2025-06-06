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

// Функция для получения данных о будущем распределении средств
export function getFutureDistributionData(timeframe = '1year') {
  const months = timeframe === '6months' ? 6 : 
                timeframe === '1year' ? 12 : 
                timeframe === '2years' ? 24 : 60;

  const current = {
    'Резервный фонд': 120000,
    'Отпуск': 85000,
    'Квартира': 450000,
    'Образование': 25000
  };

  const forecast = [];
  
  for (let i = 0; i <= months; i++) {
    const multiplier = 1 + (i * 0.08); // 8% рост в месяц
    forecast.push({
      month: i === 0 ? 'Сейчас' : `+${i}м`,
      emergency: Math.round(current['Резервный фонд'] * multiplier),
      vacation: Math.round(current['Отпуск'] * multiplier),
      apartment: Math.round(current['Квартира'] * multiplier),
      education: Math.round(current['Образование'] * multiplier)
    });
  }

  return {
    current,
    forecast
  };
}

// Функция для получения предыдущих прогнозов
export function getPreviousForecasts() {
  const totalCurrent = 680000; // Текущий общий размер накоплений
  
  return [
    {
      date: '01.10.2024',
      predictedNow: 650000,
      accuracy: 95.6
    },
    {
      date: '01.09.2024',
      predictedNow: 720000,
      accuracy: 94.4
    },
    {
      date: '01.08.2024',
      predictedNow: 630000,
      accuracy: 92.1
    },
    {
      date: '01.07.2024',
      predictedNow: 700000,
      accuracy: 97.1
    }
  ];
}

// Функция для получения минимальных целей
export function getMinimalGoals() {
  return {
    'Резервный фонд': {
      amount: 200000,
      color: '#FF8042',
      deadline: '31.12.2024'
    },
    'Отпуск': {
      amount: 150000,
      color: '#FFBB28',
      deadline: '01.06.2025'
    },
    'Квартира': {
      amount: 800000,
      color: '#00C49F',
      deadline: '31.12.2025'
    },
    'Образование': {
      amount: 100000,
      color: '#0088FE',
      deadline: '01.09.2025'
    }
  };
}

// Функция для получения базового сценария для моделирования "что если"
export function getBaseScenario() {
  const forecast = [];
  const initialBalance = 450000;
  const monthlyIncome = 85000;
  const monthlyExpenses = 65000;
  const monthlySavings = monthlyIncome - monthlyExpenses;

  for (let i = 0; i <= 24; i++) {
    forecast.push({
      month: i,
      total: initialBalance + (monthlySavings * i),
      income: monthlyIncome,
      expenses: monthlyExpenses,
      savings: monthlySavings
    });
  }

  return {
    currentBalance: initialBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    forecast
  };
}

// Функция для получения данных годового прогноза
export function getYearForecastData() {
  const forecast = [];
  const initialBalance = 450000;
  const monthlyIncome = 85000;
  const monthlyExpenses = 65000;
  const monthlySavings = monthlyIncome - monthlyExpenses;

  for (let i = 0; i < 12; i++) {
    const totalGrowth = monthlySavings * (i + 1) + (i * 500);
    const baseTotal = initialBalance + totalGrowth;
    
    forecast.push({
      month: i + 1,
      total: Math.round(baseTotal),
      savings: Math.round(baseTotal * 0.4), // 40% в накоплениях
      emergency: Math.round(baseTotal * 0.25), // 25% в резервном фонде
      goals: Math.round(baseTotal * 0.35), // 35% в целевых фондах
      income: monthlyIncome + (i * 500), // Небольшое увеличение дохода
      expenses: monthlyExpenses + (i * 200), // Небольшое увеличение расходов
      monthlySavings: monthlySavings + (i * 300)
    });
  }

  return forecast;
}

// Функция для получения текущих финансовых привычек
export function getCurrentFinancialHabits() {
  return {
    averageIncome: 88000,
    averageExpenses: 67500,
    monthlySavings: 20500,
    periodMonths: 6,
    incomeStability: {
      score: 85,
      trend: 'improving',
      sources: [
        { name: 'Основная зарплата', amount: 70000, stability: 95 },
        { name: 'Подработка', amount: 15000, stability: 70 },
        { name: 'Инвестиции', amount: 3000, stability: 60 }
      ]
    },
    spendingHabits: {
      score: 78,
      categories: [
        { name: 'Продукты', budgeted: 20000, actual: 18500, efficiency: 92 },
        { name: 'Транспорт', budgeted: 8000, actual: 8500, efficiency: 94 },
        { name: 'Развлечения', budgeted: 15000, actual: 17000, efficiency: 88 },
        { name: 'Коммунальные', budgeted: 12000, actual: 11800, efficiency: 98 }
      ]
    },
    savingsHabits: {
      score: 82,
      monthlyTarget: 20000,
      actualAverage: 16500,
      consistency: 85,
      emergencyFundMonths: 3.2
    },
    planningHabits: {
      score: 75,
      budgetAccuracy: 87,
      goalAchievement: 73,
      reviewFrequency: 'weekly',
      adjustmentAbility: 89
    },
    riskProfile: {
      level: 'moderate',
      score: 65,
      emergencyPreparedness: 78,
      investmentComfort: 60,
      debtManagement: 95
    }
  };
}

// Функция для расчета сценария "что если"
export function calculateWhatIfScenario(scenario) {
  const base = getBaseScenario();
  const forecast = [];
  
  // Преобразование частоты в ежемесячный множитель
  const frequencyMultiplier = {
    'daily': 30,
    'weekly': 4.33,
    'monthly': 1,
    'quarterly': 1/3,
    'yearly': 1/12,
    'once': 1/scenario.timeframe
  };

  // Расчет измененных доходов и расходов
  const adjustedIncome = base.monthlyIncome * (1 + scenario.incomeChange / 100);
  const newIncomeMonthly = (scenario.newIncome.amount || 0) * (frequencyMultiplier[scenario.newIncome.frequency] || 0);
  const totalMonthlyIncome = adjustedIncome + newIncomeMonthly;

  const adjustedExpenses = base.monthlyExpenses * (1 + scenario.expenseChange / 100);
  const newExpenseMonthly = (scenario.newExpense.amount || 0) * (frequencyMultiplier[scenario.newExpense.frequency] || 0);
  const totalMonthlyExpenses = adjustedExpenses + newExpenseMonthly;

  const newMonthlySavings = totalMonthlyIncome - totalMonthlyExpenses;

  for (let i = 0; i <= scenario.timeframe; i++) {
    forecast.push({
      month: i,
      total: base.currentBalance + (newMonthlySavings * i),
      income: totalMonthlyIncome,
      expenses: totalMonthlyExpenses,
      savings: newMonthlySavings
    });
  }

  const finalBalance = forecast[forecast.length - 1].total;
  const baseFinalBalance = base.currentBalance + (base.monthlySavings * scenario.timeframe);
  const totalChange = finalBalance - baseFinalBalance;
  const monthlyImpact = newMonthlySavings - base.monthlySavings;

  // Анализ влияния на цели
  let goalImpact = '';
  if (totalChange > 100000) {
    goalImpact = 'Значительно ускоряет достижение финансовых целей';
  } else if (totalChange > 0) {
    goalImpact = 'Положительно влияет на достижение целей';
  } else if (totalChange < -50000) {
    goalImpact = 'Серьезно замедляет достижение целей, требует корректировки планов';
  } else if (totalChange < 0) {
    goalImpact = 'Незначительно замедляет достижение целей';
  } else {
    goalImpact = 'Не влияет на текущие планы';
  }

  return {
    forecast,
    finalBalance,
    totalChange,
    monthlyImpact,
    goalImpact,
    adjustedIncome,
    adjustedExpenses,
    newMonthlySavings
  };
}

// Функция для получения данных календаря финансовых событий
export function getFinancialCalendarData(currentDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const events = {};
  
  // Генерация событий для текущего месяца
  const addEvent = (day, event) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!events[dateStr]) events[dateStr] = [];
    events[dateStr].push(event);
  };

  // Регулярные события
  addEvent(1, { type: 'income', title: 'Стипендия', description: 'Ежемесячная стипендия', amount: 15000, priority: 'normal' });
  addEvent(15, { type: 'income', title: 'Зарплата', description: 'Основная зарплата', amount: 70000, priority: 'high' });
  addEvent(5, { type: 'expense', title: 'Аренда квартиры', description: 'Ежемесячная аренда', amount: 35000, priority: 'high' });
  addEvent(10, { type: 'payment', title: 'Коммунальные услуги', description: 'Оплата ЖКХ', amount: 8000, priority: 'normal' });
  addEvent(20, { type: 'expense', title: 'Продукты на неделю', description: 'Покупка продуктов', amount: 5000, priority: 'normal' });
  
  // Цели и ревизии
  addEvent(25, { type: 'goal', title: 'Цель: Резервный фонд', description: 'Контрольная точка накоплений', amount: 200000, priority: 'normal' });
  addEvent(30, { type: 'review', title: 'Ревизия бюджета', description: 'Ежемесячный анализ финансов', priority: 'normal' });
  
  // Дополнительные события в зависимости от месяца
  if (month === 11) { // Декабрь
    addEvent(31, { type: 'goal', title: 'Цель года: Отпуск', description: 'Накопления на отпуск', amount: 150000, priority: 'high' });
    addEvent(25, { type: 'expense', title: 'Подарки на НГ', description: 'Новогодние подарки', amount: 20000, priority: 'normal' });
  }
  
  if (month === 5) { // Июнь
    addEvent(15, { type: 'expense', title: 'Отпуск', description: 'Летний отпуск', amount: 80000, priority: 'high' });
  }

  // Ближайшие важные события
  const upcomingEvents = [
    { 
      type: 'payment', 
      title: 'Страховка автомобиля', 
      date: '15.12.2024', 
      daysUntil: 10, 
      amount: 25000, 
      priority: 'high' 
    },
    { 
      type: 'goal', 
      title: 'Цель: Квартира', 
      date: '31.12.2024', 
      daysUntil: 26, 
      amount: 800000, 
      priority: 'high' 
    },
    { 
      type: 'expense', 
      title: 'Курсы повышения квалификации', 
      date: '20.01.2025', 
      daysUntil: 46, 
      amount: 15000, 
      priority: 'normal' 
    }
  ];

  return {
    events,
    upcomingEvents
  };
}

// Функция для получения событий конкретной даты
export function getEventsByDate(dateStr) {
  const calendarData = getFinancialCalendarData(new Date(dateStr));
  return calendarData.events[dateStr] || [];
}

// Функция для расчета модифицированного годового прогноза
export function calculateModifiedYearForecast(modifications) {
  const base = getYearForecastData();
  const forecast = [];

  // Базовые значения
  const baseMonthlyIncome = 85000;
  const baseMonthlyExpenses = 65000;
  const baseMonthlySavings = baseMonthlyIncome - baseMonthlyExpenses;

  // Применение модификаций
  const modifiedIncome = baseMonthlyIncome * (1 + modifications.income.salaryIncrease / 100) + 
                        modifications.income.sideIncome + 
                        modifications.income.freelanceIncome;

  const rentChange = 35000 * (modifications.expenses.rentChange / 100);
  const foodChange = 15000 * (modifications.expenses.foodChange / 100);
  const transportChange = 8000 * (modifications.expenses.transportChange / 100);
  
  const modifiedExpenses = baseMonthlyExpenses + rentChange + foodChange + transportChange;
  
  const additionalSavings = modifications.savings.emergencyFundIncrease + 
                           modifications.savings.investmentIncrease + 
                           modifications.savings.goalSavingsIncrease;

  const netMonthlySavings = modifiedIncome - modifiedExpenses + additionalSavings;

  // Генерация прогноза
  let cumulativeBalance = 450000; // Начальный баланс
  
  for (let i = 0; i < 12; i++) {
    cumulativeBalance += netMonthlySavings;
    forecast.push({
      month: i + 1,
      total: Math.round(cumulativeBalance),
      income: Math.round(modifiedIncome),
      expenses: Math.round(modifiedExpenses),
      savings: Math.round(netMonthlySavings)
    });
  }

  return forecast;
}

// Функция для получения шаблонов изменений образа жизни
export function getLifestyleChangeTemplates() {
  return [
    {
      id: 'promotion',
      name: 'Повышение на работе',
      icon: '🚀',
      description: 'Повышение зарплаты на 25% + бонусы',
      impact: 180000,
      changes: {
        income: {
          salaryIncrease: 25,
          bonusIncrease: 15,
          sideIncome: 0,
          freelanceIncome: 0
        },
        expenses: {
          rentChange: 0,
          foodChange: 10,
          transportChange: 0,
          entertainmentChange: 20,
          utilitiesChange: 0
        },
        savings: {
          emergencyFundIncrease: 5000,
          investmentIncrease: 8000,
          goalSavingsIncrease: 2000
        }
      }
    },
    {
      id: 'remote_work',
      name: 'Переход на удаленку',
      icon: '🏠',
      description: 'Экономия на транспорте и питании',
      impact: 96000,
      changes: {
        income: {
          salaryIncrease: 0,
          bonusIncrease: 0,
          sideIncome: 0,
          freelanceIncome: 0
        },
        expenses: {
          rentChange: 0,
          foodChange: -30,
          transportChange: -80,
          entertainmentChange: -15,
          utilitiesChange: 20
        },
        savings: {
          emergencyFundIncrease: 2000,
          investmentIncrease: 4000,
          goalSavingsIncrease: 2000
        }
      }
    },
    {
      id: 'side_business',
      name: 'Побочный бизнес',
      icon: '💼',
      description: 'Дополнительный доход от фриланса',
      impact: 240000,
      changes: {
        income: {
          salaryIncrease: 0,
          bonusIncrease: 0,
          sideIncome: 0,
          freelanceIncome: 20000
        },
        expenses: {
          rentChange: 0,
          foodChange: 0,
          transportChange: 0,
          entertainmentChange: -10,
          utilitiesChange: 0
        },
        savings: {
          emergencyFundIncrease: 3000,
          investmentIncrease: 10000,
          goalSavingsIncrease: 5000
        }
      }
    },
    {
      id: 'minimalism',
      name: 'Минимализм',
      icon: '🌱',
      description: 'Сокращение всех необязательных трат',
      impact: 144000,
      changes: {
        income: {
          salaryIncrease: 0,
          bonusIncrease: 0,
          sideIncome: 0,
          freelanceIncome: 0
        },
        expenses: {
          rentChange: -20,
          foodChange: -25,
          transportChange: -40,
          entertainmentChange: -50,
          utilitiesChange: -15
        },
        savings: {
          emergencyFundIncrease: 4000,
          investmentIncrease: 6000,
          goalSavingsIncrease: 2000
        }
      }
    },
    {
      id: 'family',
      name: 'Рождение ребенка',
      icon: '👶',
      description: 'Увеличение расходов, декретный отпуск',
      impact: -180000,
      changes: {
        income: {
          salaryIncrease: -60,
          bonusIncrease: 0,
          sideIncome: 0,
          freelanceIncome: 0
        },
        expenses: {
          rentChange: 0,
          foodChange: 40,
          transportChange: -30,
          entertainmentChange: -60,
          utilitiesChange: 25
        },
        savings: {
          emergencyFundIncrease: -8000,
          investmentIncrease: -10000,
          goalSavingsIncrease: 2000
        }
      }
    },
    {
      id: 'investment',
      name: 'Активное инвестирование',
      icon: '📈',
      description: 'Увеличение инвестиций в 2 раза',
      impact: 60000,
      changes: {
        income: {
          salaryIncrease: 0,
          bonusIncrease: 0,
          sideIncome: 0,
          freelanceIncome: 0
        },
        expenses: {
          rentChange: 0,
          foodChange: -10,
          transportChange: 0,
          entertainmentChange: -20,
          utilitiesChange: 0
        },
        savings: {
          emergencyFundIncrease: 2000,
          investmentIncrease: 15000,
          goalSavingsIncrease: 3000
        }
      }
    }
  ];
} 