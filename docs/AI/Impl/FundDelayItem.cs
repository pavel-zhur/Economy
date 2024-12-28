// ViewModels/FundDelayItem.cs

using System;

namespace ViewModels
{
    /// <summary>
    /// Represents the delay between the receipt of funds and their usage.
    /// </summary>
    public class FundDelayItem
    {
        /// <summary>
        /// The date when the income was received.
        /// </summary>
        public DateTime IncomeDate { get; set; }

        /// <summary>
        /// The number of days between the income date and the expenditure date.
        /// </summary>
        public int DelayDays { get; set; }
    }
}
