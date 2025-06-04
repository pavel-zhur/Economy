"use client"

import { useEffect, useState } from "react"
import type { Plan, Transaction } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, BadgeDollarSign } from "lucide-react"

function formatCurrency(amount: number | undefined, currency = "RUB") {
  if (amount === undefined) return "N/A"
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: currency }).format(amount)
}

export default function View7Page() {
  const [negativeBalancePlans, setNegativeBalancePlans] = useState<Plan[]>([])
  const [unlinkedTransactions, setUnlinkedTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const [plansRes, transactionsRes] = await Promise.all([fetch("/api/plans"), fetch("/api/transactions")])

        if (!plansRes.ok || !transactionsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const plansData: Plan[] = await plansRes.json()
        const transactionsData: Transaction[] = await transactionsRes.json()

        // Фильтруем планы с отрицательным балансом, у которых нет родительских планов (корневые или самостоятельные)
        // В моем моке parentId не используется повсеместно, так что для примера просто фильтрую по currentBalance < 0
        setNegativeBalancePlans(
          plansData.filter((plan) => plan.currentBalance < 0 && (!plan.parentId || plan.parentId === null)),
        )

        setUnlinkedTransactions(transactionsData.filter((tx) => tx.planId === null || tx.planId === undefined))
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred.")
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) return <p>Loading View 7 data...</p>
  if (error) return <p className="text-red-500">Error: {error}</p>

  const totalNegativeBalance = negativeBalancePlans.reduce((sum, plan) => sum + plan.currentBalance, 0)
  const totalUnlinkedAmount = unlinkedTransactions.reduce(
    (sum, tx) => sum + (tx.type === "income" ? tx.amount : -tx.amount),
    0,
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">View 7: Планы с отрицательным балансом и неподкрепленные транзакции</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <CardTitle>Планы с отрицательным балансом</CardTitle>
          </div>
          <CardDescription>
            Отображаются корневые или самостоятельные планы с текущим отрицательным балансом. Общий отрицательный
            баланс: <span className="font-semibold text-red-600">{formatCurrency(totalNegativeBalance)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {negativeBalancePlans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название плана</TableHead>
                  <TableHead className="text-right">Баланс</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {negativeBalancePlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell className="text-right text-red-600 font-medium">
                      {formatCurrency(plan.currentBalance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>Нет планов с отрицательным балансом.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="h-6 w-6 text-orange-500" />
            <CardTitle>Неподкрепленные транзакции</CardTitle>
          </div>
          <CardDescription>
            Фактические транзакции (доходы и расходы), не привязанные ни к одному из планов. Общая сумма неподкрепленных
            транзакций:{" "}
            <span className={`font-semibold ${totalUnlinkedAmount >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(totalUnlinkedAmount)}
            </span>{" "}
            ({unlinkedTransactions.length} шт.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unlinkedTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead>Тип</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unlinkedTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                    <TableCell>{tx.description || "-"}</TableCell>
                    <TableCell>{tx.category || "-"}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="capitalize">{tx.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>Нет неподкрепленных транзакций.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
