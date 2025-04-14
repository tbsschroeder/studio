'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing bottlenecks in the pirate funnel based on customer persona distribution.
 *
 * - analyzeBottlenecks - A function that triggers the bottleneck analysis flow.
 * - AnalyzeBottlenecksInput - The input type for the analyzeBottlenecks function, representing the distribution of customer personas in the funnel.
 * - AnalyzeBottlenecksOutput - The output type for the analyzeBottlenecks function, providing insights into potential bottlenecks and recommendations.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {CustomerPersona} from '@/services/customer-persona';

const FunnelStageSchema = z.enum([
  'Acquisition',
  'Activation',
  'Retention',
  'Referral',
  'Revenue',
]);

const AnalyzeBottlenecksInputSchema = z.record(
  FunnelStageSchema,
  z.array(z.object({
    persona: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      attributes: z.record(z.string(), z.any()),
    }).describe('Customer Persona'),
    count: z.number().int().nonnegative().describe('Number of customers in this persona'),
  })).describe('List of customer personas in this stage')
).describe('Distribution of customer personas across the pirate funnel stages.');

export type AnalyzeBottlenecksInput = z.infer<typeof AnalyzeBottlenecksInputSchema>;

const AnalyzeBottlenecksOutputSchema = z.object({
  bottlenecks: z.array(z.string()).describe('List of potential bottlenecks in the funnel.'),
  recommendations: z.array(z.string()).describe('Recommendations for improving customer movement through the funnel.'),
});

export type AnalyzeBottlenecksOutput = z.infer<typeof AnalyzeBottlenecksOutputSchema>;

export async function analyzeBottlenecks(input: AnalyzeBottlenecksInput): Promise<AnalyzeBottlenecksOutput> {
  return analyzeBottlenecksFlow(input);
}

const analyzeBottlenecksPrompt = ai.definePrompt({
  name: 'analyzeBottlenecksPrompt',
  input: {
    schema: z.object({
      funnelDistribution: z.string().describe('A textual description of the distribution of customer personas across the pirate funnel stages.'),
    }),
  },
  output: {
    schema: AnalyzeBottlenecksOutputSchema,
  },
  prompt: `You are a business analyst specializing in optimizing sales funnels. Analyze the following distribution of customer personas across the pirate funnel (Acquisition, Activation, Retention, Referral, Revenue) to identify potential bottlenecks and provide recommendations for improvement.

Funnel Distribution:
{{{funnelDistribution}}}

Identify the key bottlenecks in the funnel and provide specific, actionable recommendations to address them. Consider the characteristics of each customer persona and how they might be contributing to the bottlenecks. Focus on providing recommendations that will improve customer movement through the funnel.

Output bottlenecks as a list of strings, and recommendations as a list of strings. Be concise and to the point.
`,
});

const analyzeBottlenecksFlow = ai.defineFlow<
  typeof AnalyzeBottlenecksInputSchema,
  typeof AnalyzeBottlenecksOutputSchema
>({
  name: 'analyzeBottlenecksFlow',
  inputSchema: AnalyzeBottlenecksInputSchema,
  outputSchema: AnalyzeBottlenecksOutputSchema,
},
async input => {
  // Convert the input data into a string representation for the prompt.
  const funnelDistribution = Object.entries(input)
    .map(([stage, personas]) => {
      const personaDetails = personas
        .map(p => `${p.persona.name} (${p.count} customers)`) // Include customer count
        .join(', ');
      return `${stage}: ${personaDetails || 'No customers in this stage'}`;
    })
    .join('\n');

  const {output} = await analyzeBottlenecksPrompt({
    funnelDistribution,
  });
  return output!;
});

