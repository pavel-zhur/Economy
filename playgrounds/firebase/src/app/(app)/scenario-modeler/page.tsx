"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReplaceIcon, Wand2, Loader2, Lightbulb } from "lucide-react";
import { generateFinancialScenarios, type GenerateFinancialScenariosInput, type GenerateFinancialScenariosOutput } from "@/ai/flows/generate-financial-scenarios";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function ScenarioModelerPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<GenerateFinancialScenariosOutput | null>(null);

  const [financialSituation, setFinancialSituation] = useState<string>("");
  const [goals, setGoals] = useState<string>("");
  const [preferences, setPreferences] = useState<string>("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setScenarioResult(null);

    if (!financialSituation || !goals) {
      toast({
        title: "Missing Information",
        description: "Please describe your financial situation and goals.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const input: GenerateFinancialScenariosInput = {
      financialSituation,
      goals,
      preferences,
    };

    try {
      const result = await generateFinancialScenarios(input);
      setScenarioResult(result);
      toast({
        title: "Scenarios Generated!",
        description: "AI has generated financial scenarios for you.",
      });
    } catch (error) {
      console.error("Error generating financial scenarios:", error);
      toast({
        title: "Error",
        description: "Failed to generate scenarios. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
        <ReplaceIcon className="mr-3 h-8 w-8 text-primary" />
        "What-if" Scenario Modeler
      </h1>
      <p className="text-muted-foreground">Explore different financial scenarios and understand their potential impact. Define your current situation and goals, and let AI suggest possible outcomes and strategies.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Define Your Scenario Basis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="financialSituation">Current Financial Situation</Label>
              <Textarea id="financialSituation" placeholder="e.g., Monthly income $5000, Rent $1500, Savings $10000, Student loan $200/month..." value={financialSituation} onChange={(e) => setFinancialSituation(e.target.value)} rows={4} required />
            </div>
            <div>
              <Label htmlFor="goals">Financial Goals</Label>
              <Textarea id="goals" placeholder="e.g., Buy a house in 5 years, Retire by 60, Pay off debt in 2 years..." value={goals} onChange={(e) => setGoals(e.target.value)} rows={3} required />
            </div>
            <div>
              <Label htmlFor="preferences">Preferences & Constraints (Optional)</Label>
              <Textarea id="preferences" placeholder="e.g., Prefer low-risk investments, Want to maintain $500 emergency buffer, Cannot work overtime..." value={preferences} onChange={(e) => setPreferences(e.target.value)} rows={3} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate Scenarios with AI
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Placeholder for user-defined scenario inputs and comparison visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Scenario Visualization</CardTitle>
          <CardDescription>Compare different scenarios and their projected outcomes. (Manual scenario input and detailed visualization TBD)</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <Image src="https://placehold.co/600x300.png" alt="Scenario visualization placeholder" width={600} height={300} className="mx-auto rounded-md" data-ai-hint="financial graphs comparison" />
          <p className="mt-4">Detailed scenario comparison chart will be displayed here.</p>
        </CardContent>
      </Card>


      {scenarioResult && (
        <Card className="mt-8 bg-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="font-headline text-accent flex items-center">
              <Lightbulb className="mr-2 h-6 w-6" />
              AI-Generated Financial Scenarios & Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>{scenarioResult.scenarios}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
