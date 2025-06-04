export interface Plan {
  id: string
  name: string
  type: "spending" | "saving" | "fund"
  targetAmount?: number
  currentBalance: number
  targetDate?: string // ISO string, плановая дата достижения цели
  description?: string
  parentId?: string | null

  // For View 3: Future distribution
  monthlyContribution?: number // Ежемесячный вклад в накопительный план
  pessimisticTargetAmount?: number // Минимальная пессимистичная цель
  // `targetDate` can also serve for pessimistic target if amounts differ

  // For View 10: What-if scenarios (can be dynamic, not stored in plan)
}

export interface Transaction {
  id: string
  date: string // ISO date string
  amount: number
  type: "income" | "expense"
  category?: string
  description?: string
  planId?: string | null
}

export interface ForecastPoint {
  date: string // e.g., "YYYY-MM"
  balance: number
  targetLine?: number // For target amount projection
  pessimisticLine?: number // For pessimistic target projection
}

// Определения для других сущностей можно будет добавить сюда по мере необходимости
// export interface Wallet { ... }
// export interface Goal { ... }
