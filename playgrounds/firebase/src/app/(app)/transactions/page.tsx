
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { List, PlusCircle, Search, Filter, Edit3, Trash2, Download } from "lucide-react";
import type { ActualTransaction } from "@/lib/types";
import { useState } from "react";

const mockTransactions: ActualTransaction[] = [
  { id: "t1", date: "2024-07-28", description: "Grocery Store", category: "Groceries", amount: 75.20, type: "expense", linkedPlanId: "p1" },
  { id: "t2", date: "2024-07-28", description: "Salary Deposit", category: "Income", amount: 2500.00, type: "income", linkedPlanId: "p_salary" },
  { id: "t3", date: "2024-07-27", description: "Coffee Shop", category: "Dining Out", amount: 5.50, type: "expense" },
  { id: "t4", date: "2024-07-26", description: "Online Subscription", category: "Entertainment", amount: 14.99, type: "expense", linkedPlanId: "p_subs" },
  { id: "t5", date: "2024-07-25", description: "Freelance Project Payment", category: "Income", amount: 300.00, type: "income" },
];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTransactions = mockTransactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || tx.category === categoryFilter;
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const uniqueCategories = ["all", ...new Set(mockTransactions.map(tx => tx.category))];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
          <List className="mr-3 h-8 w-8 text-primary" />
          Transaction Log
        </h1>
        <div className="flex gap-2 flex-wrap">
            <Button variant="outline">
                <Download className="mr-2 h-5 w-5" /> Export CSV
            </Button>
            <Button>
                <PlusCircle className="mr-2 h-5 w-5" /> Add Transaction
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Search Transactions</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by description or category..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
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
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" aria-label="Edit transaction">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete transaction">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No transactions match your current filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
