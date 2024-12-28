// ViewModels/CategoryDistributionItem.cs

namespace ViewModels
{
    /// <summary>
    /// Represents the total expenses for a category and its percentage of total expenses.
    /// </summary>
    public class CategoryDistributionItem
    {
        /// <summary>
        /// The name of the category.
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// The total amount spent in this category.
        /// </summary>
        public decimal TotalAmount { get; set; }

        /// <summary>
        /// The percentage of the total expenses.
        /// </summary>
        public decimal PercentageOfExpenses { get; set; }
    }
}
