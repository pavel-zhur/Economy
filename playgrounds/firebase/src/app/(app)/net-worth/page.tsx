
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, PlusCircle, TrendingUp, TrendingDown, DollarSign, Landmark, Home, Car as CarIcon, CreditCard } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

interface Asset {
  id: string;
  name: string;
  category: string;
  value: number;
  icon: React.ElementType;
}

interface Liability {
  id: string;
  name: string;
  category: string;
  amount: number;
  icon: React.ElementType;
}

const mockAssets: Asset[] = [
  { id: "a1", name: "Checking Account", category: "Cash", value: 5200.75, icon: DollarSign },
  { id: "a2", name: "Savings Account", category: "Cash", value: 15800.00, icon: DollarSign },
  { id: "a3", name: "Investment Portfolio", category: "Investments", value: 75830.55, icon: Landmark },
  { id: "a4", name: "Primary Residence (Est. Value)", category: "Real Estate", value: 350000.00, icon: Home },
  { id: "a5", name: "Vehicle (Est. Value)", category: "Vehicles", value: 18500.00, icon: CarIcon },
];

const mockLiabilities: Liability[] = [
  { id: "l1", name: "Mortgage", category: "Real Estate", amount: 220000.00, icon: Home },
  { id: "l2", name: "Car Loan", category: "Vehicles", amount: 9500.00, icon: CarIcon },
  { id: "l3", name: "Credit Card Debt", category: "Credit", amount: 2300.50, icon: CreditCard },
];

const totalAssets = mockAssets.reduce((sum, asset) => sum + asset.value, 0);
const totalLiabilities = mockLiabilities.reduce((sum, liability) => sum + liability.amount, 0);
const netWorth = totalAssets - totalLiabilities;

const netWorthHistoryData = [
  { date: "2023-01", value: 180000 },
  { date: "2023-04", value: 195000 },
  { date: "2023-07", value: 205000 },
  { date: "2023-10", value: 215000 },
  { date: "2024-01", value: 220000 },
  { date: "2024-04", value: 230000 },
  { date: "2024-07", value: netWorth },
];

const chartConfig = {
  value: {
    label: "Net Worth ($)",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export default function NetWorthPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
          <Scale className="mr-3 h-8 w-8 text-primary" />
          Net Worth Tracker
        </h1>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Asset/Liability
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Current Net Worth</CardTitle>
          <CardDescription>A snapshot of your financial health.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">Your Estimated Net Worth</p>
          <p className="text-5xl font-bold text-accent my-2">${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="flex justify-around mt-4 text-lg">
            <div>
              <p className="text-muted-foreground text-sm">Total Assets</p>
              <p className="font-semibold text-green-600">${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Liabilities</p>
              <p className="font-semibold text-red-600">${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-500" /> Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAssets.map(asset => {
                  const AssetIcon = asset.icon;
                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium flex items-center"><AssetIcon className="mr-2 h-4 w-4 text-muted-foreground" />{asset.name}</TableCell>
                      <TableCell>{asset.category}</TableCell>
                      <TableCell className="text-right">${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <TrendingDown className="mr-2 h-5 w-5 text-red-500" /> Liabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLiabilities.map(liability => {
                  const LiabilityIcon = liability.icon;
                  return (
                  <TableRow key={liability.id}>
                    <TableCell className="font-medium flex items-center"><LiabilityIcon className="mr-2 h-4 w-4 text-muted-foreground" />{liability.name}</TableCell>
                    <TableCell>{liability.category}</TableCell>
                    <TableCell className="text-right">${liability.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Net Worth Trend</CardTitle>
          <CardDescription>How your net worth has changed over time.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RechartsLineChart data={netWorthHistoryData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
              </RechartsLineChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
