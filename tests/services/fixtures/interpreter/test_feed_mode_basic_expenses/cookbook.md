# Budget Tracker Cookbook

## Transaction Types
- expense: Money spent
- income: Money received
- transfer: Moving money between accounts

## Categories
- food_dining: Restaurants, coffee, takeout
- housing: Rent, mortgage, utilities
- groceries: Food shopping
- transportation: Gas, public transport, rideshare
- shopping: General purchases

## Guidelines
- Extract amount as number without currency symbols
- Infer date if not specified (use current date)
- Use descriptive but concise descriptions
- Default account to "checking" if not specified