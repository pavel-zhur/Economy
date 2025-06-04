
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AreaChart as LucideAreaChart, Briefcase, DollarSign, PlusCircle, TrendingUp } from "lucide-react";
import Image from "next/image";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

const mockPortfolioValue = 75830.55;
const mockAssetClasses = [
  { name: "Stocks", value: 45000, percentage: 59.34, icon: TrendingUp, color: "hsl(var(--chart-1))" },
  { name: "Bonds", value: 15000, percentage: 19.78, icon: LucideAreaChart, color: "hsl(var(--chart-2))" },
  { name: "Real Estate (REITs)", value: 10000, percentage: 13.19, icon: Briefcase, color: "hsl(var(--chart-3))" },
  { name: "Cash & Equivalents", value: 5830.55, percentage: 7.69, icon: DollarSign, color: "hsl(var(--chart-4))" },
];

const portfolioPerformanceData = [
  { month: "Jan", value: 68000 },
  { month: "Feb", value: 70500 },
  { month: "Mar", value: 69000 },
  { month: "Apr", value: 72000 },
  { month: "May", value: 74500 },
  { month: "Jun", value: 75830 },
];

const chartConfig = {
  value: {
    label: "Portfolio Value ($)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function InvestmentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
          <Briefcase className="mr-3 h-8 w-8 text-primary" />
          Investments Portfolio
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Add Investment
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Portfolio Overview</CardTitle>
          <CardDescription>Current valuation and asset allocation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            <p className="text-4xl font-bold">${mockPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {mockAssetClasses.map((asset) => {
              const AssetIcon = asset.icon;
              return (
                <Card key={asset.name} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                       <CardTitle className="text-lg font-medium flex items-center">
                        <AssetIcon className="mr-2 h-5 w-5" style={{ color: asset.color }} />
                        {asset.name}
                       </CardTitle>
                       <span className="text-sm font-semibold">${asset.value.toLocaleString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={asset.percentage} aria-label={`${asset.name} allocation`} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{asset.percentage.toFixed(2)}% of portfolio</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Portfolio Performance</CardTitle>
          <CardDescription>Your portfolio's value over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <RechartsAreaChart data={portfolioPerformanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Area dataKey="value" type="monotone" fill="var(--color-value)" fillOpacity={0.4} stroke="var(--color-value)" />
            </RechartsAreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Individual Holdings</CardTitle>
          <CardDescription>Detailed view of your stocks, ETFs, mutual funds, etc.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
           <Image src="https://placehold.co/600x300.png" alt="Holdings table placeholder" width={600} height={300} className="mx-auto rounded-md" data-ai-hint="stock portfolio table" />
           <p className="mt-4">Detailed holdings table will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
