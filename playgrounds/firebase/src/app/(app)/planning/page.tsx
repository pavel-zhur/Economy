import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit3, Trash2, Target, Repeat, TrendingDown, TrendingUp, FolderTree } from "lucide-react";
import type { Plan, PlannedTransaction } from "@/lib/types";
import Image from "next/image";

// Mock data for plans - replace with actual data fetching and state management
const mockPlans: Plan[] = [
  { id: "1", name: "Monthly Groceries", type: "spending", balance: -350, plannedTransactions: [{id: "pt1", planId: "1", description: "Weekly groceries", amount: 100, date: "2024-07-28", type: "expense", recurrence: "weekly"}] },
  { id: "2", name: "Vacation Fund", type: "savings", balance: 1200, targetAmount: 5000, targetDate: "2025-06-01", currentProgress: 24 },
  { id: "3", name: "Salary", type: "spending", autoSpend: true, balance: 0, plannedTransactions: [{id: "pt2", planId: "3", description: "Monthly Salary", amount: 5000, date: "2024-08-01", type: "income", recurrence: "monthly"}] },
  { id: "4", name: "Emergency Fund", type: "savings", balance: 8000, targetAmount: 10000, currentProgress: 80, parentId: null, isConstraint: true },
  { id: "5", name: "Car Maintenance", type: "spending", balance: -150, parentId: "4", children: [] },
];

const PlanItemCard = ({ plan }: { plan: Plan }) => (
  <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center">
            {plan.type === 'savings' ? <Target className="mr-2 h-5 w-5 text-accent" /> : <TrendingDown className="mr-2 h-5 w-5 text-destructive" />}
            {plan.name}
            {plan.isConstraint && <FolderTree className="ml-2 h-4 w-4 text-primary" titleAccess="Marked as Constraint" />}
          </CardTitle>
          <CardDescription className="text-xs">
            Type: {plan.type} {plan.autoSpend ? "(Transit)" : ""} {plan.parentId ? `(Child of Plan ID: ${plan.parentId})` : ""}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" aria-label="Edit plan">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete plan">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className={`text-2xl font-bold ${plan.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
        ${plan.balance.toLocaleString()}
      </p>
      {plan.type === 'savings' && plan.targetAmount && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">Goal: ${plan.targetAmount.toLocaleString()} by {plan.targetDate ? new Date(plan.targetDate).toLocaleDateString() : 'N/A'}</p>
          <div className="w-full bg-secondary rounded-full h-2.5 mt-1">
            <div className="bg-accent h-2.5 rounded-full" style={{ width: `${plan.currentProgress || 0}%` }}></div>
          </div>
        </div>
      )}
      {plan.plannedTransactions && plan.plannedTransactions.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-1">Planned Transactions:</h4>
          <ul className="text-xs list-disc list-inside text-muted-foreground space-y-1">
            {plan.plannedTransactions.map(pt => (
              <li key={pt.id}>{pt.description}: ${pt.amount} ({pt.type}, {pt.recurrence})</li>
            ))}
          </ul>
        </div>
      )}
    </CardContent>
  </Card>
);


export default function PlanningPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Planning Interface</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Plan
        </Button>
      </div>

      <Tabs defaultValue="allPlans">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="allPlans">All Plans</TabsTrigger>
          <TabsTrigger value="incomes">Incomes</TabsTrigger>
          <TabsTrigger value="expenses">Expenses/Spending</TabsTrigger>
          <TabsTrigger value="savings">Savings/Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="allPlans" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">All Financial Plans</CardTitle>
              <CardDescription>Manage all your spending, savings, and income plans.</CardDescription>
            </CardHeader>
            <CardContent>
              {mockPlans.length > 0 ? (
                mockPlans.map(plan => <PlanItemCard key={plan.id} plan={plan} />)
              ) : (
                <div className="text-center py-10">
                  <FolderTree className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No plans created yet.</p>
                  <Button className="mt-4">
                    <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incomes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Income Plans</CardTitle>
              <CardDescription>Manage your planned and recurring income sources.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter and map income plans */}
              <div className="text-center py-10">
                 <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Placeholder for income plans.</p>
                 <Image src="https://placehold.co/400x200.png" alt="Income plans placeholder" width={400} height={200} className="mx-auto rounded-md mt-4" data-ai-hint="financial planning" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Expense & Spending Plans</CardTitle>
              <CardDescription>Track and manage your planned expenditures.</CardDescription>
            </CardHeader>
            <CardContent>
              {mockPlans.filter(p => p.type === 'spending' && !p.autoSpend).map(plan => <PlanItemCard key={plan.id} plan={plan} />)}
               {mockPlans.filter(p => p.type === 'spending' && !p.autoSpend).length === 0 && (
                 <div className="text-center py-10">
                   <TrendingDown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                   <p className="text-muted-foreground">No spending plans found.</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Savings Plans & Goals</CardTitle>
              <CardDescription>Monitor your progress towards your savings objectives.</CardDescription>
            </CardHeader>
            <CardContent>
              {mockPlans.filter(p => p.type === 'savings').map(plan => <PlanItemCard key={plan.id} plan={plan} />)}
              {mockPlans.filter(p => p.type === 'savings').length === 0 && (
                 <div className="text-center py-10">
                   <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                   <p className="text-muted-foreground">No savings plans found.</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Placeholder for forms or modals for adding/editing plans and transactions */}
      {/* Example:
      <Dialog>
        <DialogTrigger asChild><Button>Add New Plan</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Plan</DialogTitle></DialogHeader>
          // PlanForm component would go here
        </DialogContent>
      </Dialog>
      */}
    </div>
  );
}
