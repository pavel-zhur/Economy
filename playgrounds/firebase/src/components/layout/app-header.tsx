import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Landmark } from "lucide-react"
import Link from "next/link"
import { SidebarNav } from "./sidebar-nav"
import type { NavItem } from "@/lib/types"

interface AppHeaderProps {
  navItems: NavItem[];
}

export function AppHeader({ navItems }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Landmark className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">FinTrack Vision</span>
        </Link>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-4">
              <Link href="/" className="mb-6 flex items-center gap-2">
                <Landmark className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold text-primary">FinTrack Vision</span>
              </Link>
              <SidebarNav items={navItems} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
