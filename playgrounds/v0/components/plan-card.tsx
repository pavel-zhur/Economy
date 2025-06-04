// Используем существующий PlanCard из предыдущего ответа.
// Убедитесь, что он находится в components/plan-card.tsx
// No changes needed to this file from the previous response if it's already created.
// For brevity, I'm not repeating the code here. Assume it exists.
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Plan } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { differenceInMonths, differenceInDays, format, parseISO, isValid } from "date-fns"
import { TrendingUp, PiggyBank, ShoppingCart, Info } from "lucide-react"

function formatCurrency(amount: number | undefined, currency = "RUB") {
  if (amount === undefined) return ""
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: currency }).format(amount)
}

function calculateMonthsRemaining(targetDateStr: string | undefined): number | null {
  if (!targetDateStr) return null
  const target = parseISO(targetDateStr)
  if (!isValid(target)) return null
  const now = new Date()
  if (target < now) return 0
  return differenceInMonths(target, now)
}

function calculateDaysRemaining(targetDateStr: string | undefined): number | null {
  if (!targetDateStr) return null
  const target = parseISO(targetDateStr)
  if (!isValid(target)) return null
  const now = new Date()
  if (target < now) return 0
  return differenceInDays(target, now)
}

export default function PlanCard({ plan }: { plan: Plan }) {
  const progress =
    plan.type === "saving" && plan.targetAmount && plan.targetAmount > 0
      ? (plan.currentBalance / plan.targetAmount) * 100
      : plan.type === "spending" && plan.targetAmount && plan.targetAmount > 0
        ? (plan.currentBalance / plan.targetAmount) * 100
        : 0

  const monthsRemaining = calculateMonthsRemaining(plan.targetDate)
  const daysRemaining = calculateDaysRemaining(plan.targetDate)

  let timeRemainingStr = ""
  if (plan.targetDate) {
    const target = parseISO(plan.targetDate)
    if (isValid(target)) {
      if (daysRemaining !== null) {
        if (daysRemaining === 0 && target > new Date()) {
          timeRemainingStr = "Today is the day!"
        } else if (daysRemaining === 0 && target <= new Date()) {
          timeRemainingStr = "Target date reached"
        } else if (daysRemaining < 0) {
          timeRemainingStr = "Target date passed"
        } else if (daysRemaining < 30) {
          timeRemainingStr = `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`
        } else if (monthsRemaining !== null) {
          timeRemainingStr = `${monthsRemaining} month${monthsRemaining === 1 ? "" : "s"} left`
        }
      }
      timeRemainingStr += ` (until ${format(target, "MMM d, yyyy")})`
    } else {
      timeRemainingStr = "Invalid target date"
    }
  }

  const requiredMonthlySaving =
    plan.type === "saving" && plan.targetAmount && monthsRemaining && monthsRemaining > 0
      ? (plan.targetAmount - plan.currentBalance) / monthsRemaining
      : null

  const getPlanIcon = () => {
    switch (plan.type) {
      case "saving":
        return <PiggyBank className="w-5 h-5 text-green-500" />
      case "spending":
        return <ShoppingCart className="w-5 h-5 text-orange-500" />
      case "fund":
        return <TrendingUp className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const isOverBudget = plan.type === "spending" && plan.targetAmount && plan.currentBalance > plan.targetAmount
  const isNegativeBalance = plan.currentBalance < 0

  return (
    <Card
      className={`w-full ${isNegativeBalance && !isOverBudget ? "border-red-500" : ""} ${isOverBudget ? "border-orange-500" : ""}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          {getPlanIcon()}
        </div>
        <CardDescription>
          <Badge
            variant={plan.type === "saving" ? "default" : plan.type === "spending" ? "secondary" : "outline"}
            className="capitalize"
          >
            {plan.type}
          </Badge>
          {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className={`text-2xl font-semibold ${isNegativeBalance ? "text-red-600" : ""} ${isOverBudget ? "text-orange-600" : ""}`}
        >
          {formatCurrency(plan.currentBalance)}
        </p>
        {plan.type === "saving" && plan.targetAmount && (
          <>
            <p className="text-sm text-muted-foreground">Goal: {formatCurrency(plan.targetAmount)}</p>
            <Progress
              value={progress}
              className="w-full mt-2"
              indicatorClassName={plan.currentBalance >= plan.targetAmount ? "bg-green-500" : ""}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{Math.max(0, Math.min(100, Math.round(progress)))}%</span>
              {plan.targetAmount - plan.currentBalance > 0 ? (
                <span>{formatCurrency(plan.targetAmount - plan.currentBalance)} to go</span>
              ) : (
                <span className="text-green-600 font-medium">Goal Reached!</span>
              )}
            </div>
          </>
        )}
        {plan.type === "spending" && plan.targetAmount && (
          <p className="text-sm text-muted-foreground">
            Budget: {formatCurrency(plan.targetAmount)}
            {isOverBudget && (
              <span className="text-orange-600 ml-2 font-medium">
                (Over budget by {formatCurrency(plan.currentBalance - plan.targetAmount)})
              </span>
            )}
          </p>
        )}
        {isNegativeBalance && !isOverBudget && <p className="text-sm text-red-600 mt-1">Negative balance!</p>}
      </CardContent>
      {(plan.targetDate || requiredMonthlySaving !== null) && (
        <CardFooter className="flex flex-col items-start text-sm text-muted-foreground space-y-1">
          {timeRemainingStr && <p>{timeRemainingStr}</p>}
          {requiredMonthlySaving !== null && requiredMonthlySaving > 0 && (
            <p>Save ~{formatCurrency(requiredMonthlySaving)}/month to reach goal.</p>
          )}
          {requiredMonthlySaving !== null &&
            requiredMonthlySaving <= 0 &&
            plan.currentBalance < (plan.targetAmount || 0) && (
              <p className="text-amber-600">Goal date is near/passed, adjust plan or date.</p>
            )}
        </CardFooter>
      )}
    </Card>
  )
}
