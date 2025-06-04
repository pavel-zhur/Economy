
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, PlusCircle, Edit3, Trash2, ShoppingCart, Utensils, Car, PartyPopper } from "lucide-react";

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  icon: React.ElementType;
}

const mockBudgets: BudgetCategory[] = [
  { id: "b1", name: "Groceries", allocated: 500, spent: 320.50, icon: ShoppingCart },
  { id: "b2", name: "Dining Out", allocated: 200, spent: 150.75, icon: Utensils },
  { id: "b3", name: "Transportation", allocated: 150, spent: 90.00, icon: Car },
  { id: "b4", name: "Entertainment", allocated: 100, spent: 110.20, icon: PartyPopper },
];

export default function BudgetsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
          <PiggyBank className="mr-3 h-8 w-8 text-primary" />
          Budget Management
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Budget
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockBudgets.map((budget) => {
          const progressPercentage = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;
          const remainingAmount = budget.allocated - budget.spent;
          const BudgetIcon = budget.icon;
          return (
            <Card key={budget.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                 <CardTitle className="font-headline text-xl flex items-center">
                    <BudgetIcon className="mr-3 h-6 w-6 text-primary" />
                    {budget.name}
                  </CardTitle>
                  <div className="flex">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${budget.name} budget`}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${budget.name} budget`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardDescription>Allocated: ${budget.allocated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-2xl font-bold">${budget.spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-sm text-muted-foreground"> spent</span>
                  </p>
                  <Progress 
                    value={Math.min(progressPercentage, 100)} 
                    aria-label={`${budget.name} budget progress`} 
                    className={`my-3 h-3 ${progressPercentage > 100 ? 'bg-destructive [&>*]:bg-destructive-foreground' : ''}`} 
                  />
                  {progressPercentage <= 100 ? (
                     <p className="text-sm text-muted-foreground">${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining ({progressPercentage.toFixed(1)}% spent)</p>
                  ) : (
                    <p className="text-sm text-destructive font-medium">Over budget by ${Math.abs(remainingAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({(progressPercentage - 100).toFixed(1)}% over)</p>
                  )}
                </div>
                 <Button variant="outline" className="w-full mt-4">View Transactions</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {mockBudgets.length === 0 && (
        <Card className="text-center py-10">
          <CardContent>
            <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No budgets set up yet. Start planning your spending!</p>
            <Button className="mt-4">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
