"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { NavItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface SidebarNavProps {
  items: NavItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

  if (!items?.length) {
    return null
  }

  return (
    <SidebarMenu>
      {items.map((item, index) => {
        const Icon = item.icon
        return item.href ? (
          <SidebarMenuItem key={index}>
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton
                variant="default"
                className={cn(
                  "justify-start",
                  pathname === item.href
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                tooltip={item.title}
              >
                <Icon className="mr-2 h-5 w-5" />
                <span>{item.title}</span>
                {item.label && (
                  <span className="ml-auto text-xs">{item.label}</span>
                )}
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ) : (
          <span
            key={index}
            className="flex w-full cursor-not-allowed items-center rounded-md p-2 opacity-60"
          >
            {item.title}
          </span>
        )
      })}
    </SidebarMenu>
  )
}
