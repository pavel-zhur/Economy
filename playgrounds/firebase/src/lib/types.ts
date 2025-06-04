
export interface Plan {
  id: string;
  name: string;
  type: 'spending' | 'savings';
  parentId?: string | null;
  balance: number; // This would likely be calculated
  targetAmount?: number;
  targetDate?: string; // ISO date string
  isConstraint?: boolean;
  autoSpend?: boolean; // For transit plans
  // For UI purposes, maybe include children plans if fetched hierarchically
  children?: Plan[]; 
  // Planned transactions associated with this plan
  plannedTransactions?: PlannedTransaction[]; 
  // Progress towards goal
  currentProgress?: number; // Calculated: (currentBalance / targetAmount) * 100
}

export interface PlannedTransaction {
  id: string;
  planId: string;
  description: string;
  amount: number;
  date: string; // ISO date string
  type: 'income' | 'expense';
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface ActualTransaction {
  id:string;
  date: string; // ISO date string
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  linkedPlanId?: string | null;
  walletId?: string | null;
}

export interface Goal {
  id: string;
  planId?: string; // A goal might be directly linked to a savings plan
  name: string;
  targetAmount: number;
  targetDate: string; // ISO date string
  currentAmount: number; // Could be sum of specific transactions or plan balance
}

export interface Wallet {
  id: string;
  name: string;
  balance: number; // Typically from the latest inventory
}

export interface Inventory {
  id: string;
  walletId: string;
  date: string; // ISO date string
  balance: number;
}

// For AI interactions
export type SmartAllocationPlanInput = {
  planName: string;
  currentBalance: number;
  goalAmount?: number;
  goalDate?: string; // "YYYY-MM-DD"
  priority: 'high' | 'medium' | 'low';
};

// Represents the structure for AI-generated scenarios
export interface FinancialScenario {
  scenarioName: string;
  description: string;
  impactOnGoals: string;
  suggestedActions: string[];
}

// Represents an item in the navigation menu
export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  variant?: "default" | "ghost";
}
