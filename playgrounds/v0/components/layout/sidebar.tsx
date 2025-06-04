"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  Package2,
  Home,
  Settings,
  BarChart3,
  ListChecks,
  AlertTriangle,
  CalendarDays,
  Lightbulb,
  History,
  TrendingUp,
  HelpCircle,
  DollarSign,
  SlidersHorizontal,
  WalletCards,
  GanttChartSquare,
  Target,
  Search,
  LineChart,
  CheckSquare,
  Clock,
  Shuffle,
} from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/view-1", label: "1. Планируемые расходы", icon: ListChecks },
  { href: "/view-2", label: "2. Распределение факт. денег", icon: WalletCards },
  { href: "/view-3", label: "3. Будущее по фондам", icon: TrendingUp },
  { href: "/view-4", label: "4. Распределение доходов", icon: DollarSign },
  { href: "/view-5", label: "5. Инвентаризация", icon: GanttChartSquare },
  { href: "/view-6", label: "6. Время задержки средств", icon: Clock },
  { href: "/view-7", label: "7. Отриц. баланс, неподкр. транз.", icon: AlertTriangle },
  { href: "/view-8", label: "8. Баланс планов во времени", icon: LineChart },
  { href: "/view-9", label: "9. Цели накоплений", icon: Target },
  { href: "/view-10", label: "10. Моделирование 'Что если'", icon: HelpCircle },
  { href: "/view-11", label: "11. История отклонений", icon: History },
  { href: "/view-12", label: "12. Остаток до дохода", icon: BarChart3 },
  { href: "/view-13", label: "13. Эффективность планирования", icon: CheckSquare },
  { href: "/view-14", label: "14. Нерегулярные доходы/расходы", icon: Shuffle },
  { href: "/view-15", label: "15. Календарь фин. событий", icon: CalendarDays },
  { href: "/view-16", label: "16. Анализ нереалистичных планов", icon: Search },
  { href: "/view-17", label: "17. Прогноз на год (тек. образ жизни)", icon: Lightbulb },
  { href: "/view-18", label: "18. Прогноз на год (с изменениями)", icon: SlidersHorizontal },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Financial Planner</span>
          </Link>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname === item.href && "bg-accent text-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  )
}
