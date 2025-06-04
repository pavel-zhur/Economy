"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit, Lightbulb, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { smartAllocateIncome, type SmartAllocateIncomeInput, type SmartAllocateIncomeOutput, type SmartAllocateIncomePlanInput } from "@/ai/flows/smart-income-allocation";
import { useToast } from "@/hooks/use-toast";

export default function SmartAllocatorPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [allocationResult, setAllocationResult] = useState<SmartAllocateIncomeOutput | null>(null);

  const [incomeAmount, setIncomeAmount] = useState<string>("");
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [shortTermGoals, setShortTermGoals] = useState<string>("");
  const [longTermGoals, setLongTermGoals] = useState<string>("");
  const [plans, setPlans] = useState<SmartAllocateIncomePlanInput[]>([
    { planName: "", currentBalance: 0, priority: "medium" },
  ]);

  const handlePlanChange = (index: number, field: keyof SmartAllocateIncomePlanInput, value: string | number | 'low' | 'medium' | 'high') => {
    const newPlans = [...plans];
    if (field === 'currentBalance' || field === 'goalAmount') {
      newPlans[index] = { ...newPlans[index], [field]: Number(value) || 0 };
    } else if (field === 'priority') {
      newPlans[index] = { ...newPlans[index], [field]: value as 'low' | 'medium' | 'high' };
    }
     else {
      newPlans[index] = { ...newPlans[index], [field]: value as string };
    }
    setPlans(newPlans);
  };

  const addPlan = () => {
    setPlans([...plans, { planName: "", currentBalance: 0, priority: "medium" }]);
  };

  const removePlan = (index: number) => {
    setPlans(plans.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setAllocationResult(null);

    if (!incomeAmount || plans.some(p => !p.planName)) {
      toast({
        title: "Missing Information",
        description: "Please fill in income amount and all plan names.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const input: SmartAllocateIncomeInput = {
      incomeAmount: parseFloat(incomeAmount),
      plans,
      riskTolerance,
      shortTermGoals,
      longTermGoals,
    };

    try {
      const result = await smartAllocateIncome(input);
      setAllocationResult(result);
      toast({
        title: "Allocation Ready!",
        description: "Smart allocation suggestions have been generated.",
      });
    } catch (error) {
      console.error("Error generating smart allocation:", error);
      toast({
        title: "Error",
        description: "Failed to generate allocation suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
        <BrainCircuit className="mr-3 h-8 w-8 text-primary" />
        Smart Income Allocator
      </h1>
      <p className="text-muted-foreground">Let AI help you decide how to best allocate your income to achieve your financial goals.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="incomeAmount">Income Amount to Allocate</Label>
                <Input id="incomeAmount" type="number" placeholder="e.g., 2000" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                <Select value={riskTolerance} onValueChange={(value: 'low' | 'medium' | 'high') => setRiskTolerance(value)}>
                  <SelectTrigger id="riskTolerance"><SelectValue placeholder="Select risk tolerance" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="shortTermGoals">Short Term Goals (e.g., next 1-2 years)</Label>
              <Textarea id="shortTermGoals" placeholder="e.g., Save for a vacation, pay off small debt" value={shortTermGoals} onChange={(e) => setShortTermGoals(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="longTermGoals">Long Term Goals (e.g., 5+ years)</Label>
              <Textarea id="longTermGoals" placeholder="e.g., Retirement savings, house down payment" value={longTermGoals} onChange={(e) => setLongTermGoals(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Plans</CardTitle>
            <CardDescription>List the plans you want to allocate funds to.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.map((plan, index) => (
              <div key={index} className="p-4 border rounded-md space-y-3 relative">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removePlan(index)} aria-label="Remove plan">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <h3 className="font-medium text-sm">Plan {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`planName-${index}`}>Plan Name</Label>
                    <Input id={`planName-${index}`} placeholder="e.g., Emergency Fund" value={plan.planName} onChange={(e) => handlePlanChange(index, "planName", e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor={`currentBalance-${index}`}>Current Balance</Label>
                    <Input id={`currentBalance-${index}`} type="number" placeholder="e.g., 1000" value={plan.currentBalance} onChange={(e) => handlePlanChange(index, "currentBalance", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`goalAmount-${index}`}>Goal Amount (Optional)</Label>
                    <Input id={`goalAmount-${index}`} type="number" placeholder="e.g., 5000" value={plan.goalAmount || ""} onChange={(e) => handlePlanChange(index, "goalAmount", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`goalDate-${index}`}>Goal Date (Optional)</Label>
                    <Input id={`goalDate-${index}`} type="date" value={plan.goalDate || ""} onChange={(e) => handlePlanChange(index, "goalDate", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`priority-${index}`}>Priority</Label>
                    <Select value={plan.priority} onValueChange={(value: 'low' | 'medium' | 'high') => handlePlanChange(index, "priority", value)}>
                      <SelectTrigger id={`priority-${index}`}><SelectValue placeholder="Select priority" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addPlan} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Another Plan
            </Button>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              Get Allocation Suggestions
            </Button>
          </CardFooter>
        </Card>
      </form>

      {allocationResult && (
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-primary flex items-center">
              <Lightbulb className="mr-2 h-6 w-6" />
              AI Allocation Suggestions
            </CardTitle>
            <CardDescription>{allocationResult.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allocationResult.allocationSuggestions.map((suggestion, index) => (
              <Card key={index} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{suggestion.planName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-accent">${suggestion.suggestedAllocation.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">{suggestion.reasoning}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
