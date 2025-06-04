import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, DollarSign, ListChecks, AlertCircle, BrainCircuit, Replace } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function FinancialOverviewPage() {
  // Placeholder data
  const summaryStats = [
    { title: "Total Balance", value: "$25,678.90", icon: DollarSign, trend: "+2.5%" },
    { title: "Monthly Income", value: "$5,800.00", icon: TrendingUp },
    { title: "Monthly Expenses", value: "$3,250.00", icon: Activity },
    { title: "Active Goals", value: "3", icon: ListChecks },
  ];

  const sampleGoals = [
    { id: "1", name: "Vacation Fund", current: 750, target: 2000, progress: 37.5 },
    { id: "2", name: "New Laptop", current: 1200, target: 1500, progress: 80 },
    { id: "3", name: "Emergency Fund", current: 4500, target: 10000, progress: 45 },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-6 font-headline">Financial Overview</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && <p className="text-xs text-muted-foreground pt-1">{stat.trend} from last month</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Savings Goal Tracker</CardTitle>
            <CardDescription>Your progress towards your financial goals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {sampleGoals.map((goal) => (
              <div key={goal.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{goal.name}</span>
                  <span className="text-sm text-muted-foreground">${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}</span>
                </div>
                <Progress value={goal.progress} aria-label={`${goal.name} progress`} className="h-3" />
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/goals">View All Goals</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
            <CardDescription>Manage your finances efficiently.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild className="w-full justify-start">
              <Link href="/planning"><ListChecks className="mr-2 h-4 w-4" /> Manage Plans</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/smart-allocator"><BrainCircuit className="mr-2 h-4 w-4" /> Smart Income Allocator</Link>
            </Button>
             <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/scenario-modeler"><Replace className="mr-2 h-4 w-4" /> "What If" Scenarios</Link>
            </Button>
            <Button asChild variant="destructive" className="w-full justify-start mt-2">
              <Link href="/issues"><AlertCircle className="mr-2 h-4 w-4" /> View Issues</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
      
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
             <CardDescription>Overview of recent transactions and plan updates.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent activity feed or chart */}
            <div className="text-center text-muted-foreground py-8">
              <Image src="https://placehold.co/600x300.png" alt="Recent Activity Chart Placeholder" width={600} height={300} className="mx-auto rounded-md" data-ai-hint="financial chart graph" />
              <p className="mt-4">Recent activity chart will be displayed here.</p>
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
