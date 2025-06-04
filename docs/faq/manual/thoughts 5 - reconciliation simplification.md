# Thoughts 5: Simplifying Reconciliation, Evolving Plan Estimates, and Constraint Management

This document outlines further questions, requirements, and desired characteristics for the financial planning system, building upon previous analyses. The goal is to explore simplifications, particularly around reconciliation, and to better define user interactions with plan estimations and constraints.

## 1. Simplification of Reconciliation & Avoiding New Entities

**Context:** Previous AI proposals introduced new entities (`VarianceLog`, `Reconciliations`) or complex balance structures (e.g., separate `actual_balance` and `reserved_balance` within a `Plan`) to handle discrepancies between planned and actual figures. This adds implementation and maintenance overhead.

**Questions/Requirements:**

*   **Can we avoid introducing new, dedicated entities for variance tracking or reconciliation?** Can existing entities like `Plan`, `Transaction`, and virtual transfers (perhaps via `DistributionRule` or a similar existing mechanism) suffice?
*   **Calculated Discrepancies:** Instead of storing discrepancies, can "over" and "under" amounts for each plan be *calculated on-the-fly* by comparing planned incoming/outgoing virtual funds against actual linked transactions and actual incoming/outgoing virtual funds (from explicit user-driven reconciliations)?
*   **Hierarchical Propagation of Discrepancies:**
    *   Can these calculated over/under amounts propagate up the parent-child plan hierarchy?
    *   For example, a parent plan could display an aggregated summary like: `Total Over: +2000` (sum of all positive discrepancies from children) and `Total Under: -2200` (sum of all negative discrepancies from children), resulting in a net discrepancy for the parent (e.g., `-200`).
*   **Reconciliation as Standard Transfers:**
    *   Could the act of "reconciliation" then simply be a standard (virtual) transfer operation? The user would make a transfer to/from a plan to bring its net calculated discrepancy to zero (or any other desired target).
    *   Example: If a parent plan shows a net `-200` discrepancy, the user initiates a virtual transfer of `+200` into that parent plan from an "unallocated" pool or another plan.
*   **Flexible Reconciliation Level:** Is it acceptable and desirable for the user to reconcile at any level of the plan hierarchy (e.g., fix the parent's net discrepancy) while detailed discrepancies in child plans might remain "unfixed" but still visible? The parent's reconciliation would effectively balance out the children's net differences at the parent level.

## 2. Timing and Context of Reconciliation

**Context:** Understanding when and why a user would perform reconciliation is key.

**Questions/Requirements:**

*   **End-of-Plan Reconciliation:** Is a primary use case for reconciliation when a plan is nearing its end (i.e., no significant new planned income or expenses are expected for it)?
*   **Interim Reconciliation/Actualization:** Should the system robustly support users wanting to "fix" or "actualize" significant emerging surpluses or deficits in a plan *even while the plan is still active and has future uncertainties*? This is about updating the financial picture based on new knowledge before the plan concludes.

## 3. Evolving Plan Estimates (The "Funnel") and Scenario-Based Transfers

**Context:** Financial plans, especially for complex goals like travel, often start with broad estimates that narrow over time as more concrete information becomes available.

**Questions/Requirements:**

*   **Representing Estimation Ranges:**
    *   A plan (e.g., "Trip to X") might initially have an estimated cost range (e.g., $2000-$4000). As actuals occur (e.g., flights booked), this range narrows (e.g., flight cost fixed, remaining estimate $2200-$3700).
*   **Virtual Transfers as the Funnel:**
    *   The idea that "planned money" allocated to a plan primarily comes from (virtual) transfers is appealing.
    *   **Can the estimation "funnel" (min/max range) for a plan be directly represented by making the *virtual transfers themselves scenario-dependent*?**
        *   For example, a recurring transfer to "Savings Plan" could be: Pessimistic: $50/month, Baseline: $100/month, Optimistic: $150/month.
        *   The plan's projected balance range would then be a direct result of summing these min/max scenario-based incoming/outgoing virtual transfers over time.
*   **Narrowing the Funnel:**
    *   How would a user "narrow the funnel" in this model? Would it involve adjusting the amounts in the different scenarios of these virtual transfers? For example, changing a pessimistic transfer from -$200 to -$100 would narrow the pessimistic side of the funnel.
*   **History of Estimate Changes:** If plan estimates (represented by these scenario-based transfers or other means) change over time, should these changes be versioned or historically tracked to see how planning evolved?

## 4. Plans as Constraints and UI for "Important" Nodes

**Context:** Users may use plans, especially at certain levels in a hierarchy, as self-imposed constraints or key budget validation points.

**Questions/Requirements:**

*   **Identifying Constraint Points:** How can the system allow users to designate certain plans (nodes in the hierarchy) as more critical "constraint points" than others?
    *   Not all leaf nodes in a detailed plan tree (e.g., "Lunch Day 1 in Paris") are strict constraints; users often expect to overspend in one sub-category and underspend in another, aiming to meet a budget at a higher parent level (e.g., "Total Food Budget for Paris").
*   **Visualizing Discrepancies at Constraint Points:**
    *   The UI should visually distinguish the significance of discrepancies. Discrepancies at designated "constraint point" plans might be highlighted more prominently (e.g., "red").
    *   Discrepancies at deeper, less critical child plans should still be visible upon drill-down but might not trigger the same level of alarm if their parent "constraint point" plan is on track.
*   **UI - "Hot Path" Analogy:** Can the UI provide a way to easily identify and focus on these "important" plans where discrepancies matter most, similar to how a profiler highlights "hot paths" in code, perhaps by default collapsing less critical branches? This could involve user-defined flags, labels (e.g., "critical," "monitor"), or checkboxes.

## 5. Re-verification of the Plan Balance System

**Context:** Given the complexities of real transactions, virtual transfers (for distribution and reconciliation), plan statuses (active, future, closed/past), and parent-child hierarchies, there's a lingering concern about the robustness and completeness of the proposed plan balance calculations.

**Questions/Requirements:**

*   **Comprehensive Balance Logic:**
    *   How is a plan's "current effective balance" (the one used for decision-making and display) precisely calculated, considering all these factors?
    *   How do balances correctly aggregate up the parent-child tree, ensuring no double-counting or omissions?
*   **Alignment with Overall Wealth:**
    *   How does the sum of all relevant plan balances (e.g., top-level plans, or all active plans) reliably and demonstrably reconcile with the user's total calculated wealth (derived from actual transaction history and/or wallet inventory snapshots)?
*   **Differing Plan Intents:**
    *   How does the balance system account for plans with different intents?
        *   **Spending Plans (target balance ~0):** E.g., "Monthly Groceries." The goal is to spend the allocated amount.
        *   **Accumulation Plans (target balance grows):** E.g., "Emergency Fund." The goal is for the balance to increase or be maintained.
    *   When summing up "total planned wealth," how are these different types of plans treated to ensure a meaningful aggregate? For instance, should the target "spending" of a budget plan reduce the perceived "available for other goals" wealth?
*   **Scenario Verification:** Request for the AI models to re-verify their proposed balance systems against various scenarios, including those involving hierarchies, reconciliations at different levels, and plans with evolving estimates, to ensure the system behaves intuitively and correctly maintains overall financial integrity. Is the proposed "simple" system truly sufficient, or are there unaddressed edge cases? 