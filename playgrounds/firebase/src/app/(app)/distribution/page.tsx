"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import Image from "next/image";

const pieChartData = [
  { name: "Savings", value: 400, fill: "hsl(var(--chart-1))" },
  { name: "Housing", value: 300, fill: "hsl(var(--chart-2))" },
  { name: "Food", value: 300, fill: "hsl(var(--chart-3))" },
  { name: "Transport", value: 200, fill: "hsl(var(--chart-4))" },
  { name: "Entertainment", value: 278, fill: "hsl(var(--chart-5))" },
];

const barChartData = [
  { month: "Jan", income: 4000, expenses: 2400 },
  { month: "Feb", income: 3000, expenses: 1398 },
  { month: "Mar", income: 2000, expenses: 3800 },
  { month: "Apr", income: 2780, expenses: 3908 },
  { month: "May", income: 1890, expenses: 4800 },
  { month: "Jun", income: 2390, expenses: 3800 },
];

const chartConfig = {
  income: { label: "Income", color: "hsl(var(--chart-1))" },
  expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
  savings: { label: "Savings", color: "hsl(var(--chart-1))" },
  housing: { label: "Housing", color: "hsl(var(--chart-2))" },
  food: { label: "Food", color: "hsl(var(--chart-3))" },
  transport: { label: "Transport", color: "hsl(var(--chart-4))" },
  entertainment: { label: "Entertainment", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;


export default function DistributionPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Income Distribution Visualizer</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Current Expense Distribution (Monthly)</CardTitle>
          <CardDescription>How your income is allocated across different expense categories this month.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
            <RechartsPieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </RechartsPieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Income vs. Expenses Over Time</CardTitle>
          <CardDescription>Track your income and expenses over the past few months.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="income" fill="var(--color-income)" radius={4} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Projected Future Distribution</CardTitle>
          <CardDescription>Forecast of how your funds might be distributed across savings plans in the future.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
           <Image src="https://placehold.co/600x300.png" alt="Projected distribution chart placeholder" width={600} height={300} className="mx-auto rounded-md" data-ai-hint="financial forecast graph" />
           <p className="mt-4">Projected future distribution chart will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
