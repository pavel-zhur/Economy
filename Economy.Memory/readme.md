# Some internal thoughts

1. Planned-actual atomic transactions (current implementation) correspondence is important, otherwise I'll need to close planned transactions in favour of unknown actual in order to avoid the budget overflow.