# Interpretation Cookbook

## Guidelines for interpreting user messages into structured data

### Transaction Types
- **expense**: Money going out (purchases, bills, fees)
- **income**: Money coming in (salary, refunds, gifts)
- **transfer**: Moving money between accounts (ATM withdrawal, account transfers)

### Categories
Common expense categories:
- food_dining: Restaurants, takeout, coffee shops
- groceries: Supermarket, grocery stores
- transportation: Gas, public transit, parking
- entertainment: Movies, books, games
- housing: Rent, utilities, maintenance
- shopping: Clothing, electronics, general purchases
- health: Medical, pharmacy, fitness

### Merchants
Extract business names from the message when mentioned:
- "Starbucks" for coffee shops
- "Safeway" for grocery stores
- "Amazon" for online purchases

### Accounts
Default to "checking" unless specified otherwise.
Look for mentions of specific accounts like "savings", "credit card", "cash".

### Amounts
Extract numeric amounts, including cents when specified.
For ATM withdrawals, the amount is what was withdrawn, not a fee.

### Date Handling
If no date is mentioned, assume "today" or current date.
Parse relative dates like "yesterday", "last week" appropriately.

### Special Cases
- ATM withdrawals are transfers from account to cash
- Paychecks are income transactions
- Tips can be separate expense transactions or combined with the main expense
- Shared expenses (like "my share was $X") should use the personal amount