"use client"

import { useEffect, useState, useMemo } from "react"
import type { Plan, ForecastPoint } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HelpCircle, TrendingUp, AlertCircle } from "lucide-react"
import { format, addMonths } from "date-fns"

function formatCurrency(amount: number | undefined, currency = "RUB") {
  if (amount === undefined) return "N/A"
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: currency }).format(amount)
}

// Simplified forecast generation for "What If"
// Focuses on total balance of all saving/fund plans
const generateTotalSavingsForecast = (
  plans: Plan[],
  monthsToForecast: number,
  monthlyIncomeChange: number,
  monthlyExpenseChange: number,
): ForecastPoint[] => {
  const forecast: ForecastPoint[] = []
  let totalCurrentBalance = plans
    .filter((p) => p.type === "saving" || p.type === "fund")
    .reduce((sum, p) => sum + p.currentBalance, 0)

  const totalMonthlyContribution = plans
    .filter((p) => p.type === "saving" || p.type === "fund")
    .reduce((sum, p) => sum + (p.monthlyContribution || 0), 0)

  const today = new Date()

  for (let i = 0; i <= monthsToForecast; i++) {
    const forecastDate = addMonths(today, i)
    const dateStr = format(forecastDate, "yyyy-MM")

    let currentPeriodBalance = totalCurrentBalance
    if (i > 0) {
      currentPeriodBalance += totalMonthlyContribution + monthlyIncomeChange - monthlyExpenseChange
    }

    forecast.push({ date: dateStr, balance: currentPeriodBalance })
    if (i > 0) totalCurrentBalance = currentPeriodBalance // update for next iteration
  }
  return forecast
}

export default function View10Page() {
  const [allPlans, setAllPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const monthsToForecast = 12

  // Scenario parameters
  const [monthlyIncomeChange, setMonthlyIncomeChange] = useState(0)
  const [monthlyExpenseChange, setMonthlyExpenseChange] = useState(0)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const plansRes = await fetch("/api/plans")
        if (!plansRes.ok) throw new Error("Failed to fetch plans")
        const plansData: Plan[] = await plansRes.json()
        setAllPlans(plansData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const baselineForecast = useMemo(() => {
    if (allPlans.length === 0) return []
    return generateTotalSavingsForecast(allPlans, monthsToForecast, 0, 0)
  }, [allPlans, monthsToForecast])

  const scenarioForecast = useMemo(() => {
    if (allPlans.length === 0) return []
    return generateTotalSavingsForecast(allPlans, monthsToForecast, monthlyIncomeChange, monthlyExpenseChange)
  }, [allPlans, monthsToForecast, monthlyIncomeChange, monthlyExpenseChange])

  if (isLoading) return <p>Loading View 10 data...</p>
  if (error) return <p className="text-red-500">Error: {error}</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">View 10: Моделирование "Что если"</h1>
      <p className="text-muted-foreground">
        Спрогнозируйте финансовые последствия гипотетических изменений. Прогноз общего баланса накопительных планов и
        фондов на {monthsToForecast} месяцев.
      </p>
      <p className="text-sm text-amber-600">
        <AlertCircle className="inline h-4 w-4 mr-1" />
        Примечание: Графики здесь представлены в виде таблиц. Для полноценной визуализации рекомендуется использовать
        библиотеку типа Recharts.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Параметры сценария</CardTitle>
          <CardDescription>Введите изменения для моделирования.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incomeChange">Изменение ежемесячного дохода ({formatCurrency(0)})</Label>
              <Input
                id="incomeChange"
                type="number"
                placeholder="например, 5000 или -2000"
                value={monthlyIncomeChange}
                onChange={(e) => setMonthlyIncomeChange(Number(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Положительное число для увеличения, отрицательное для уменьшения.
              </p>
            </div>
            <div>
              <Label htmlFor="expenseChange">Изменение ежемесячных расходов ({formatCurrency(0)})</Label>
              <Input
                id="expenseChange"
                type="number"
                placeholder="например, 3000 или -1000"
                value={monthlyExpenseChange}
                onChange={(e) => setMonthlyExpenseChange(Number(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Положительное число для увеличения расходов, отрицательное для уменьшения.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-gray-500" />
              <CardTitle>Базовый прогноз</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {baselineForecast.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Месяц</TableHead>
                    <TableHead className="text-right">Общий баланс накоплений</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {baselineForecast.map((p) => (
                    <TableRow key={`base-${p.date}`}>
                      <TableCell>{p.date}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Нет данных для базового прогноза.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-indigo-500" />
              <CardTitle>Прогноз "Что если"</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {scenarioForecast.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Месяц</TableHead>
                    <TableHead className="text-right">Общий баланс накоплений</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarioForecast.map((p) => (
                    <TableRow key={`scenario-${p.date}`}>
                      <TableCell>{p.date}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Нет данных для прогноза сценария.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Сравнение итоговых балансов через {monthsToForecast} месяцев:</h3>
        {baselineForecast.length > 0 && scenarioForecast.length > 0 && (
          <ul className="list-disc list-inside space-y-1">
            <li>
              Базовый прогноз:{" "}
              <span className="font-medium">
                {formatCurrency(baselineForecast[baselineForecast.length - 1].balance)}
              </span>
            </li>
            <li>
              Прогноз "Что если":{" "}
              <span className="font-medium">
                {formatCurrency(scenarioForecast[scenarioForecast.length - 1].balance)}
              </span>
            </li>
            <li>
              Разница:{" "}
              <span
                className={`font-medium ${scenarioForecast[scenarioForecast.length - 1].balance - baselineForecast[baselineForecast.length - 1].balance >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(
                  scenarioForecast[scenarioForecast.length - 1].balance -
                    baselineForecast[baselineForecast.length - 1].balance,
                )}
              </span>
            </li>
          </ul>
        )}
      </div>
    </div>
  )
}
