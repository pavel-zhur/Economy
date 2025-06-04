import { NextResponse } from "next/server"
import type { Plan } from "@/lib/types"

const plans: Plan[] = [
  {
    id: "1",
    name: "Отпуск на море 2026",
    type: "saving",
    currentBalance: 1200,
    targetAmount: 5000,
    targetDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Approx 18 months
    description: "Накопления на летний отпуск",
    monthlyContribution: 200,
    pessimisticTargetAmount: 4000,
  },
  {
    id: "2",
    name: "Ежемесячные продукты",
    type: "spending",
    currentBalance: -50,
    targetAmount: 400,
    description: "Бюджет на продукты на текущий месяц",
  },
  {
    id: "3",
    name: "Новый ноутбук",
    type: "saving",
    currentBalance: 500,
    targetAmount: 1500,
    targetDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Approx 6 months
    description: "Цель - покупка MacBook Air",
    monthlyContribution: 150,
    pessimisticTargetAmount: 1300,
  },
  {
    id: "4",
    name: "Резервный фонд",
    type: "fund",
    currentBalance: 10000,
    description: "Неприкосновенный запас",
    monthlyContribution: 50, // Funds can also grow
  },
  {
    id: "5",
    name: "Кредитная карта",
    type: "spending",
    currentBalance: -1500,
    description: "Погашение долга по кредитке",
    parentId: null,
  },
  {
    id: "fund-edu",
    name: "Образовательный фонд",
    type: "fund",
    currentBalance: 2000,
    description: "Накопления на будущее образование",
    monthlyContribution: 100,
    targetAmount: 20000, // Long term goal
    targetDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 years
  },
]

export async function GET() {
  return NextResponse.json(plans)
}

export async function POST(request: Request) {
  try {
    const newPlanData = (await request.json()) as Omit<Plan, "id">
    if (!newPlanData.name || !newPlanData.type || newPlanData.currentBalance === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const newPlan: Plan = {
      ...newPlanData,
      id: crypto.randomUUID(),
    }
    plans.push(newPlan)
    return NextResponse.json(newPlan, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
