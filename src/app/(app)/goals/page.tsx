"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, PlusCircle, Edit3, TrendingUp } from "lucide-react";
import type { Goal } from "@/lib/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import type { ChartConfig } from "@/components/ui/chart"

// Mock data for goals
const mockGoals: Goal[] = [
  { id: "1", name: "Dream Vacation to Japan", targetAmount: 5000, currentAmount: 1500, targetDate: "2025-12-31" },
  { id: "2", name: "New Professional Camera", targetAmount: 2500, currentAmount: 2000, targetDate: "2024-10-30" },
  { id: "3", name: "House Down Payment", targetAmount: 50000, currentAmount: 12500, targetDate: "2027-06-30" },
];

const goalChartData = [
  { date: "2024-01", progress: 500 },
  { date: "2024-02", progress: 700 },
  { date: "2024-03", progress: 1000 },
  { date: "2024-04", progress: 1200 },
  { date: "2024-05", progress: 1500 },
  // ... more data points
];

const chartConfig = {
  progress: {
    label: "Progress ($)",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Savings Goal Tracker</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Goal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockGoals.map((goal) => {
          const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <Card key={goal.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="font-headline text-xl flex items-center">
                    <Target className="mr-3 h-6 w-6 text-primary" />
                    {goal.name}
                  </CardTitle>
                  <Button variant="ghost" size="icon" aria-label="Edit goal">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Target: ${goal.targetAmount.toLocaleString()} by {new Date(goal.targetDate).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-2xl font-bold">${goal.currentAmount.toLocaleString()}</p>
                  <Progress value={progressPercentage} aria-label={`${goal.name} progress`} className="my-3 h-3" />
                  <p className="text-sm text-muted-foreground">{progressPercentage.toFixed(1)}% complete</p>
                </div>
                <Button variant="outline" className="w-full mt-4">View Details & Projections</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {mockGoals.length === 0 && (
        <Card className="text-center py-10">
          <CardContent>
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No goals set yet. Start planning for your future!</p>
            <Button className="mt-4">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {mockGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Overall Goal Progress Trajectory</CardTitle>
            <CardDescription>Visualizing your savings journey for '{mockGoals[0].name}'.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart
                data={goalChartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Area
                  dataKey="progress"
                  type="monotone"
                  fill="var(--color-progress)"
                  fillOpacity={0.4}
                  stroke="var(--color-progress)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
