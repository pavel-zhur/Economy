import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Link2Off, DollarSign } from "lucide-react";
import type { Plan, ActualTransaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

// Mock data
const negativeBalancePlans: Plan[] = [
  { id: "p1", name: "Credit Card Payments", type: "spending", balance: -250.75 },
  { id: "p2", name: "Utilities", type: "spending", balance: -55.20 },
];

const unlinkedTransactions: ActualTransaction[] = [
  { id: "t1", date: "2024-07-15", amount: 75.00, category: "Dining", description: "Dinner with friends", type: "expense" },
  { id: "t2", date: "2024-07-16", amount: 30.00, category: "Miscellaneous", description: "Online purchase", type: "expense" },
  { id: "t3", date: "2024-07-18", amount: 100.00, category: "Freelance", description: "Project payment", type: "income" },
];

export default function IssuesPage() {
  const totalNegativeBalance = negativeBalancePlans.reduce((sum, plan) => sum + plan.balance, 0);
  const totalUnlinkedAmount = unlinkedTransactions.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
        <AlertTriangle className="mr-3 h-8 w-8 text-destructive" />
        Issue Identification
      </h1>
      <p className="text-muted-foreground">Highlighting potential problems in your financial planning and tracking.</p>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
             <DollarSign className="mr-2 h-5 w-5 text-destructive" />
            Plans with Negative Balances
          </CardTitle>
          <CardDescription>These plans have a negative balance, indicating overspending or misallocation.</CardDescription>
        </CardHeader>
        <CardContent>
          {negativeBalancePlans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {negativeBalancePlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="text-right text-destructive font-semibold">
                      -${Math.abs(plan.balance).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                 <TableRow className="font-bold border-t-2">
                  <TableCell>Total Negative Balance</TableCell>
                  <TableCell className="text-right text-destructive">
                    -${Math.abs(totalNegativeBalance).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No plans with negative balances found. Great job!</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Link2Off className="mr-2 h-5 w-5 text-orange-500" />
            Unlinked Transactions
          </CardTitle>
          <CardDescription>These actual transactions are not yet linked to any financial plan.</CardDescription>
        </CardHeader>
        <CardContent>
          {unlinkedTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unlinkedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell className={`text-right font-semibold ${transaction.type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'} className={transaction.type === 'income' ? 'bg-accent hover:bg-accent/90' : ''}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold border-t-2">
                  <TableCell colSpan={3}>Net Unlinked Amount</TableCell>
                  <TableCell className={`text-right ${totalUnlinkedAmount >= 0 ? 'text-accent' : 'text-destructive'}`}>
                     {totalUnlinkedAmount >= 0 ? '+' : '-'}${Math.abs(totalUnlinkedAmount).toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">All transactions are linked to plans. Nicely organized!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
