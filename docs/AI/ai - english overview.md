### Description of Entities, Their Properties, Behavior, and Parameters

#### Core Entities

1. **Transactions**
   - **Description:**
     Records of actual income and expenses entered by the user.
   - **Properties:**
     - Transaction date (mandatory).
     - Amount (mandatory).
     - Type: income or expense.
     - Category (e.g., "Groceries," "Transport").
     - Link to a plan (optional).
     - Description (optional).
   - **Behavior:**
     - Can be linked to one or more plans.
     - May remain unlinked if not associated with any plan.
   - **Parameters and Calculations:**
     - Transaction balance: total income minus total expenses.
     - Impact on plans: linked transactions adjust the plan's balance.

2. **Plans**
   - **Description:**
     User-defined allocations of funds to categories or goals.
   - **Properties:**
     - Plan name.
     - Plan type:
       - **Funds:** Savings or storage not meant for direct expenses.
       - **Planned expenses:** Expenses scheduled for a future date.
       - **Mixed plans:** Contain both savings and expenses.
     - Plan balance (current remaining amount).
     - Parent plan (optional).
     - Automatic transfers:
       - Percentage or fixed amount allocated upon income receipt.
     - Manual transfers:
       - Funds manually redistributed between plans.
     - Creation and last modification date.
   - **Behavior:**
     - Plans can be linked or standalone (without a parent).
     - Negative balances are only allowed for standalone plans.
     - Automatic transfers activate upon income receipt.
   - **Parameters and Calculations:**
     - Final balance: total income minus expenses plus transfers.
     - Distribution of automatic transfers among plans based on preset rules.

#### Mathematics and Logic

1. **System Balance:**
   - System balance = Total income - Total expenses.
   - Plan balance = Sum of all plan balances.
   - Wallet balance = Sum of all wallet inventory balances.

2. **Income Distribution:**
   - Automatic distribution:
     - Each income is allocated according to predefined rules (percentage or fixed amount).
     - Example: 10% of income goes to savings, 20% to "Groceries."
   - Manual distribution:
     - Users can manually transfer funds between plans.

3. **Balance Modeling:**
   - Forecasting:
     - Current transfer rules and planned income/expenses are used.
     - Example: "Groceries" plan by 2024-12-01 expects a balance of -5000 unless additional income is allocated.
   - Historical data:
     - Used to validate alignment between actual and planned figures.

#### Types of Dates and Their Use

1. **Transaction date:** Date when the transaction occurred.
2. **Plan date:** Date by which the plan should be executed or started.
3. **Forecast date:** Future date used for modeling.
4. **Inventory date:** Date when actual wallet balances were verified.

#### Additional Parameters

1. **Reference Metrics:**
   - Example: Standard income distribution among plans.
2. **Plan Goals:**
   - Example: "Savings should reach $10,000 by 2024-12-31."
3. **Minimum Values:**
   - Each plan can have defined pessimistic minimum values.
4. **Constraints:**
   - Negative balances are only allowed for specific plan types.

#### Financial Views and Their Purposes

1. **Planned Expenses (Past and Future):**
   - **Purpose:**
     - Displays upcoming and past scheduled expenses that have allocated funds but are yet to be realized.
   - **Workflow:**
     - Users can verify the timing and sufficiency of allocated funds for scheduled expenses.
   - **Use Case:**
     - Ensures that critical expenses (e.g., rent, utilities) are covered in time.

2. **Current Money Distribution Across Plans:**
   - **Purpose:**
     - Provides a snapshot of how the current balance is distributed across funds, storage, and planned expenses.
   - **Workflow:**
     - Helps identify areas where funds are over- or under-allocated.
   - **Use Case:**
     - Optimizing cash flow by reallocating resources.

3. **Future Distribution:**
   - **Purpose:**
     - Shows how funds will be distributed based on current rules and projections.
   - **Workflow:**
     - Allows users to adjust future allocations in advance if expected distributions are misaligned.
   - **Use Case:**
     - Anticipating and correcting potential shortfalls or surpluses in specific plans.

4. **Income Distribution Across Plans:**
   - **Purpose:**
     - Tracks historical and projected allocations of income to plans.
   - **Workflow:**
     - Users can review how well income aligns with planned goals and adjust automatic or manual transfers accordingly.
   - **Use Case:**
     - Evaluating the efficiency of income usage.

5. **Wallet Balance Verification:**
   - **Purpose:**
     - Compares balances calculated from transactions against actual wallet balances.
   - **Workflow:**
     - Users perform regular reconciliations to ensure accuracy in financial tracking.
   - **Use Case:**
     - Identifying discrepancies between recorded and real-world balances.

6. **Plan Balance Timeline:**
   - **Purpose:**
     - Tracks plan balances over time to ensure that no plan falls into a negative balance.
   - **Workflow:**
     - Users review graphical trends and identify at-risk plans.
   - **Use Case:**
     - Maintaining financial stability by preventing negative balances.

7. **Behavioral Insights:**
   - **Purpose:**
     - Provide insights into user spending and saving habits.
   - **Workflow:**
     - Automatic analysis generates suggestions for better financial management.
   - **Use Case:**
     - Encouraging sustainable financial behavior by identifying areas of improvement.

By providing a comprehensive financial view, this system acts as a robust tool for accountants, economists, and individuals who wish to maintain structured and predictable financial planning. The inclusion of workflow-based views ensures that all aspects of income, expenses, and plans are tracked, analyzed, and optimized for both short-term needs and long-term goals.

