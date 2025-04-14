/**
 * Represents a customer persona with relevant attributes for METRO AG's wholesale business.
 */
export interface CustomerPersona {
  /**
   * The unique identifier for the customer persona.
   */
  id: string;
  /**
   * The name of the customer persona (e.g., Restaurant Owner, Small Retailer).
   */
  name: string;
  /**
   * A brief description of the customer persona.
   */
  description: string;
  /**
   * Other relevant attributes for the customer persona, such as industry, purchase frequency, etc.
   */
  attributes: Record<string, any>;
}

/**
 * Asynchronously retrieves a list of customer personas.
 *
 * @returns A promise that resolves to an array of CustomerPersona objects.
 */
export async function getCustomerPersonas(): Promise<CustomerPersona[]> {
  // TODO: Implement this by calling an API or reading from a data source.

  return [
    {
      id: '1',
      name: 'Restaurant Owner',
      description: 'Owns a small to medium-sized restaurant.',
      attributes: {
        industry: 'Restaurant',
        purchaseFrequency: 'Weekly',
      },
    },
    {
      id: '2',
      name: 'Small Retailer',
      description: 'Owns a small retail store.',
      attributes: {
        industry: 'Retail',
        purchaseFrequency: 'Monthly',
      },
    },
  ];
}
