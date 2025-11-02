"use client"

import type React from "react"
import { SidebarProvider, useSidebar } from "@/components/sidebar-provider"
import { MainSidebar } from "@/components/main-sidebar"
import { MainHeader } from "@/components/main-header"
import { cn } from "@/lib/utils"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()
  
  return (
    <div className="flex min-h-screen">
      <MainSidebar />
      <div 
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          isOpen ? "md:ml-64" : "md:ml-[70px]"
        )}
      >
        <MainHeader />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  )
}
