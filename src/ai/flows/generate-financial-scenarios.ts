'use server';
/**
 * @fileOverview Generates financial scenarios and allocation strategies using GenAI.
 *
 * - generateFinancialScenarios - A function that generates financial scenarios and allocation strategies.
 * - GenerateFinancialScenariosInput - The input type for the generateFinancialScenarios function.
 * - GenerateFinancialScenariosOutput - The return type for the generateFinancialScenarios function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFinancialScenariosInputSchema = z.object({
  financialSituation: z
    .string()
    .describe('Description of the current financial situation.'),
  goals: z.string().describe('The financial goals to achieve.'),
  preferences: z.string().describe('The user preferences for financial planning.'),
});
export type GenerateFinancialScenariosInput = z.infer<
  typeof GenerateFinancialScenariosInputSchema
>;

const GenerateFinancialScenariosOutputSchema = z.object({
  scenarios: z
    .string()
    .describe(
      'A description of possible financial scenarios and allocation strategies.'
    ),
});
export type GenerateFinancialScenariosOutput = z.infer<
  typeof GenerateFinancialScenariosOutputSchema
>;

export async function generateFinancialScenarios(
  input: GenerateFinancialScenariosInput
): Promise<GenerateFinancialScenariosOutput> {
  return generateFinancialScenariosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialScenariosPrompt',
  input: {schema: GenerateFinancialScenariosInputSchema},
  output: {schema: GenerateFinancialScenariosOutputSchema},
  prompt: `You are a financial advisor that helps users make financial plans.

You will generate financial scenarios and allocation strategies based on the user's financial situation, goals, and preferences.

Financial Situation: {{{financialSituation}}}
Goals: {{{goals}}}
Preferences: {{{preferences}}}

Respond with realistic scenarios and concrete steps to achieve the stated goals.
`,
});

const generateFinancialScenariosFlow = ai.defineFlow(
  {
    name: 'generateFinancialScenariosFlow',
    inputSchema: GenerateFinancialScenariosInputSchema,
    outputSchema: GenerateFinancialScenariosOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
