'use server';

/**
 * @fileOverview This file defines a Genkit flow for smart income allocation, providing suggestions on how to distribute income across different financial plans to achieve user-defined goals.
 *
 * - `smartAllocateIncome` - An async function that orchestrates the income allocation process.
 * - `SmartAllocateIncomeInput` - The input type definition for the `smartAllocateIncome` function.
 * - `SmartAllocateIncomeOutput` - The output type definition for the `smartAllocateIncome` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartAllocateIncomeInputSchema = z.object({
  incomeAmount: z.number().describe('The amount of income to allocate.'),
  plans: z.array(
    z.object({
      planName: z.string().describe('The name of the financial plan.'),
      currentBalance: z.number().describe('The current balance of the plan.'),
      goalAmount: z.number().optional().describe('The target amount for the plan (if any).'),
      goalDate: z.string().optional().describe('The target date for the plan (if any).'),
      priority: z.enum(['high', 'medium', 'low']).describe('The priority of the plan.'),
    })
  ).describe('An array of financial plans with their current balances, goals, and priorities.'),
  riskTolerance: z.enum(['low', 'medium', 'high']).describe('The user risk tolerance.'),
  shortTermGoals: z.string().describe('The user short term goals.'),
  longTermGoals: z.string().describe('The user long term goals.'),
});

export type SmartAllocateIncomeInput = z.infer<typeof SmartAllocateIncomeInputSchema>;

const SmartAllocateIncomeOutputSchema = z.object({
  allocationSuggestions: z.array(
    z.object({
      planName: z.string().describe('The name of the financial plan.'),
      suggestedAllocation: z.number().describe('The suggested amount to allocate to this plan.'),
      reasoning: z.string().describe('The reasoning behind the allocation suggestion.'),
    })
  ).describe('An array of allocation suggestions for each plan.'),
  summary: z.string().describe('A summary of the allocation strategy.'),
});

export type SmartAllocateIncomeOutput = z.infer<typeof SmartAllocateIncomeOutputSchema>;

export async function smartAllocateIncome(input: SmartAllocateIncomeInput): Promise<SmartAllocateIncomeOutput> {
  return smartAllocateIncomeFlow(input);
}

const smartAllocateIncomePrompt = ai.definePrompt({
  name: 'smartAllocateIncomePrompt',
  input: {schema: SmartAllocateIncomeInputSchema},
  output: {schema: SmartAllocateIncomeOutputSchema},
  prompt: `You are a financial advisor providing advice on how to allocate income to different financial plans.

        Given the following information about the user's financial situation and goals, provide allocation suggestions for their income.

        Income Amount: {{{incomeAmount}}}
        Risk Tolerance: {{{riskTolerance}}}
        Short Term Goals: {{{shortTermGoals}}}
        Long Term Goals: {{{longTermGoals}}}

        Plans:
        {{#each plans}}
        Plan Name: {{{planName}}}
        Current Balance: {{{currentBalance}}}
        {{#if goalAmount}}
        Goal Amount: {{{goalAmount}}}
        {{/if}}
        {{#if goalDate}}
        Goal Date: {{{goalDate}}}
        {{/if}}
        Priority: {{{priority}}}
        {{/each}}

        Allocation Suggestions:
        For each plan, provide a suggested allocation amount and the reasoning behind it. Also include a summary of the allocation strategy.

        Output should be in the following JSON format:
        {{json SmartAllocateIncomeOutputSchema}}
        `,
});

const smartAllocateIncomeFlow = ai.defineFlow(
  {
    name: 'smartAllocateIncomeFlow',
    inputSchema: SmartAllocateIncomeInputSchema,
    outputSchema: SmartAllocateIncomeOutputSchema,
  },
  async input => {
    const {output} = await smartAllocateIncomePrompt(input);
    return output!;
  }
);
