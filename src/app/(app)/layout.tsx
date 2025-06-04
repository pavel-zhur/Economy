
"use client";

import { AppHeader } from "@/components/layout/app-header"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils"
import type { NavItem } from "@/lib/types"
import { LayoutDashboard, ListChecks, PieChart, Target, AlertTriangle, BrainCircuit, Replace, Briefcase, List as ListIcon, PiggyBank, Scale } from "lucide-react"

const navItems: NavItem[] = [
  { title: "Overview", href: "/", icon: LayoutDashboard },
  { title: "Planning", href: "/planning", icon: ListChecks },
  { title: "Transactions", href: "/transactions", icon: ListIcon },
  { title: "Budgets", href: "/budgets", icon: PiggyBank },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Investments", href: "/investments", icon: Briefcase },
  { title: "Distribution", href: "/distribution", icon: PieChart },
  { title: "Net Worth", href: "/net-worth", icon: Scale },
  { title: "Issues", href: "/issues", icon: AlertTriangle },
  { title: "Smart Allocator", href: "/smart-allocator", icon: BrainCircuit },
  { title: "Scenario Modeler", href: "/scenario-modeler", icon: Replace },
  // { title: "Settings", href: "/settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <AppHeader navItems={navItems} />
        <div className={cn(
          "container mx-auto flex-1 items-start",
          "md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6",
          "lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10"
        )}>
          <aside className="fixed top-16 z-30 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block md:w-auto">
            <ScrollArea className="h-full py-6 pr-6 lg:py-8">
              <SidebarNav items={navItems} />
            </ScrollArea>
          </aside>
          <main className="relative py-6 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
