import { NextResponse } from "next/server"
import type { Transaction } from "@/lib/types"

// In-memory store for transactions
const transactions: Transaction[] = [
  {
    id: "t1",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    amount: 2500,
    type: "income",
    category: "Зарплата",
    description: "Аванс",
    planId: "4", // Привязана к Резервному фонду
  },
  {
    id: "t2",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    amount: 75,
    type: "expense",
    category: "Продукты",
    description: "Молоко и хлеб",
    planId: "2", // Привязана к Ежемесячным продуктам
  },
  {
    id: "t3",
    date: new Date().toISOString().split("T")[0],
    amount: 30,
    type: "expense",
    category: "Транспорт",
    description: "Проезд на метро",
    planId: null, // Не привязана к плану
  },
  {
    id: "t4",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    amount: 120,
    type: "expense",
    category: "Развлечения",
    description: "Кино",
    planId: null, // Не привязана к плану
  },
  {
    id: "t5",
    date: new Date().toISOString().split("T")[0],
    amount: 500,
    type: "income",
    category: "Подарок",
    description: "От родителей",
    planId: null, // Не привязана
  },
]

export async function GET() {
  return NextResponse.json(transactions)
}

// POST, PUT, DELETE можно добавить по аналогии с /api/plans
