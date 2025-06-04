"use client"

import { useEffect, useState } from "react"
import type { Plan, ForecastPoint } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, AlertCircle } from "lucide-react"
import { format, addMonths, differenceInMonths, parseISO, isValid } from "date-fns"

function formatCurrency(amount: number | undefined, currency = "RUB") {
  if (amount === undefined) return "N/A"
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: currency }).format(amount)
}

// Helper to generate forecast data for a single plan
const generatePlanForecast = (plan: Plan, monthsToForecast: number): ForecastPoint[] => {
  const forecast: ForecastPoint[] = []
  let currentBalance = plan.currentBalance
  const today = new Date()

  for (let i = 0; i <= monthsToForecast; i++) {
    const forecastDate = addMonths(today, i)
    const dateStr = format(forecastDate, "yyyy-MM")

    if (i > 0) {
      currentBalance += plan.monthlyContribution || 0
    }

    let targetLineValue: number | undefined = undefined
    if (plan.targetAmount && plan.targetDate && isValid(parseISO(plan.targetDate))) {
      const targetD = parseISO(plan.targetDate)
      const monthsToTarget = differenceInMonths(targetD, today)
      if (monthsToTarget >= 0 && i <= monthsToTarget) {
        // Linear interpolation for target line
        targetLineValue =
          plan.currentBalance + ((plan.targetAmount - plan.currentBalance) / (monthsToTarget + 1)) * (i + 1)
      } else if (i > monthsToTarget) {
        targetLineValue = plan.targetAmount
      }
    }

    let pessimisticLineValue: number | undefined = undefined
    if (plan.pessimisticTargetAmount && plan.targetDate && isValid(parseISO(plan.targetDate))) {
      const targetD = parseISO(plan.targetDate)
      const monthsToTarget = differenceInMonths(targetD, today)
      if (monthsToTarget >= 0 && i <= monthsToTarget) {
        pessimisticLineValue =
          plan.currentBalance + ((plan.pessimisticTargetAmount - plan.currentBalance) / (monthsToTarget + 1)) * (i + 1)
      } else if (i > monthsToTarget) {
        pessimisticLineValue = plan.pessimisticTargetAmount
      }
    }

    forecast.push({
      date: dateStr,
      balance: currentBalance,
      targetLine: targetLineValue,
      pessimisticLine: pessimisticLineValue,
    })
  }
  return forecast
}

export default function View3Page() {
  const [savingPlans, setSavingPlans] = useState<Plan[]>([])
  const [forecasts, setForecasts] = useState<Record<string, ForecastPoint[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const monthsToForecast = 24 // Forecast for 2 years

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const plansRes = await fetch("/api/plans")
        if (!plansRes.ok) throw new Error("Failed to fetch plans")
        const allPlans: Plan[] = await plansRes.json()

        const filteredPlans = allPlans.filter(
          (p) => (p.type === "saving" || p.type === "fund") && p.monthlyContribution !== undefined,
        )
        setSavingPlans(filteredPlans)

        const newForecasts: Record<string, ForecastPoint[]> = {}
        for (const plan of filteredPlans) {
          newForecasts[plan.id] = generatePlanForecast(plan, monthsToForecast)
        }
        setForecasts(newForecasts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) return <p>Loading View 3 data...</p>
  if (error) return <p className="text-red-500">Error: {error}</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">View 3: Будущее распределение по фондам и накоплениям</h1>
      <p className="text-muted-foreground">
        Прогноз на {monthsToForecast} месяцев. Отображаются накопительные планы и фонды с указанным ежемесячным вкладом.
      </p>
      <p className="text-sm text-amber-600">
        <AlertCircle className="inline h-4 w-4 mr-1" />
        Примечание: Графики здесь представлены в виде таблиц. Для полноценной визуализации рекомендуется использовать
        библиотеку типа Recharts.
      </p>

      {savingPlans.length === 0 && <p>Нет подходящих планов для отображения прогноза.</p>}

      {savingPlans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              <CardTitle>{plan.name}</CardTitle>
            </div>
            <CardDescription>
              Текущий баланс: {formatCurrency(plan.currentBalance)}. Ежемесячный вклад:{" "}
              {formatCurrency(plan.monthlyContribution)}.
              {plan.targetAmount && (
                <>
                  {" "}
                  Цель: {formatCurrency(plan.targetAmount)}
                  {plan.targetDate && ` к ${format(parseISO(plan.targetDate), "dd.MM.yyyy")}`}.
                </>
              )}
              {plan.pessimisticTargetAmount && (
                <> Пессимистичная цель: {formatCurrency(plan.pessimisticTargetAmount)}.</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h4 className="font-medium mb-2">Прогноз баланса:</h4>
            {forecasts[plan.id] ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Месяц</TableHead>
                      <TableHead className="text-right">Прогноз. баланс</TableHead>
                      {plan.targetAmount && <TableHead className="text-right">Целевая линия</TableHead>}
                      {plan.pessimisticTargetAmount && <TableHead className="text-right">Пессим. линия</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forecasts[plan.id].map((point) => (
                      <TableRow key={point.date}>
                        <TableCell>{point.date}</TableCell>
                        <TableCell className="text-right">{formatCurrency(point.balance)}</TableCell>
                        {plan.targetAmount && (
                          <TableCell className="text-right text-green-600">
                            {point.targetLine !== undefined ? formatCurrency(point.targetLine) : "-"}
                          </TableCell>
                        )}
                        {plan.pessimisticTargetAmount && (
                          <TableCell className="text-right text-orange-600">
                            {point.pessimisticLine !== undefined ? formatCurrency(point.pessimisticLine) : "-"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p>Нет данных прогноза для этого плана.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
