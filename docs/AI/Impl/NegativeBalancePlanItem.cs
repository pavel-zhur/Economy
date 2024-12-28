// ViewModels/NegativeBalancePlanItem.cs

using System;

namespace ViewModels
{
    /// <summary>
    /// Represents a plan with a negative balance.
    /// </summary>
    public class NegativeBalancePlanItem
    {
        /// <summary>
        /// The name of the plan.
        /// </summary>
        public string PlanName { get; set; }

        /// <summary>
        /// The negative balance of the plan.
        /// </summary>
        public decimal Balance { get; set; }

        /// <summary>
        /// A description of the plan.
        /// </summary>
        public string Description { get; set; }
    }
}
