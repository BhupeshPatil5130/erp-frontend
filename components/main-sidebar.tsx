"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"

import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Building,
  ClipboardList,
  DollarSign,
  FileText,
  Home,
  Package,
  Settings,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent } from "@/components/ui/sheet"

type SidebarItem = {
  title: string
  href?: string
  icon: React.ElementType
  submenu?: SidebarSubItem[]
}

type SidebarSubItem = {
  title: string
  href: string
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Enrollment",
    icon: BookOpen,
    submenu: [
      { title: "Enquiry", href: "/dashboard/enrollment/enquiry" },
      { title: "Leadersquare Enquiry", href: "/dashboard/enrollment/lsq-enquiry" },
      { title: "Admission", href: "/dashboard/enrollment/admission" },
      { title: "Manage Transfer Stage", href: "/dashboard/enrollment/transfer-stage" },
      { title: "DTP View", href: "/dashboard/enrollment/dtp-view" },
      { title: "Graduation Name Changed Confirmation", href: "/dashboard/enrollment/graduation-name-change" },
      { title: "Inventory/Purchase Order", href: "/dashboard/enrollment/inventory" },
      { title: "Admission Status", href: "/dashboard/enrollment/admission-status" },
    ],
  },
  {
    title: "Staff Assessment",
    icon: Users,
    submenu: [
      { title: "Staff Attendance", href: "/dashboard/staff/attendance" },
      { title: "Staff Details", href: "/dashboard/staff/details" },
      { title: "Teaching Subject", href: "/dashboard/staff/teaching-subject" },
    ],
  },
  {
    title: "Operation",
    icon: Settings,
    submenu: [
      { title: "Exchange Order", href: "/dashboard/operation/exchange-order" },
      { title: "Purchase Order", href: "/dashboard/operation/purchase-order" },
      { title: "Static Data", href: "/dashboard/operation/static-data" },
    ],
  },
  {
    title: "Account Statement",
    icon: FileText,
    submenu: [
      { title: "SOA Summary", href: "/dashboard/account/soa-summary" },
      { title: "SOA Details", href: "/dashboard/account/soa-details" },
    ],
  },
  {
    title: "Fee Collection",
    icon: DollarSign,
    submenu: [
      { title: "Deposit Amount", href: "/dashboard/fee/deposit-amount" },
      { title: "Deposit Status", href: "/dashboard/fee/deposit-status" },
      { title: "Fund Transfer", href: "/dashboard/fee/fund-transfer" },
      { title: "Fee Structure", href: "/dashboard/fee/structure" },
      { title: "Discount Type", href: "/dashboard/fee/discount-type" },
      { title: "Payment Detail", href: "/dashboard/fee/payment-detail" },
      { title: "Convert Amount", href: "/dashboard/fee/convert-amount" },
    ],
  },
  {
    title: "Franchise",
    icon: Building,
    submenu: [
      { title: "Invoice Details", href: "/dashboard/franchise/invoice-details" },
      { title: "Invoice Download", href: "/dashboard/franchise/invoice-download" },
      { title: "Receipt Dashboard", href: "/dashboard/franchise/receipt-dashboard" },
      { title: "Franchise Holder", href: "/dashboard/franchise/holder" },
      { title: "Franchise Profile", href: "/dashboard/franchise/profile" },
      { title: "Franchise Type", href: "/dashboard/franchise/type" },
    ],
  },
  {
    title: "Tools",
    icon: Settings,
    submenu: [
      { title: "Fee Calculator", href: "/dashboard/tools/fee-calculator" },
      { title: "Calendar", href: "/dashboard/tools/calendar" },
      { title: "Academic", href: "/dashboard/tools/academic" },
    ],
  },
  {
    title: "Reports",
    icon: ClipboardList,
    submenu: [
      { title: "Admission Details", href: "/dashboard/reports/admission-details" },
      { title: "Fee Card Details", href: "/dashboard/reports/fee-card-details" },
      { title: "Enquiry Details", href: "/dashboard/reports/enquiry-details" },
      { title: "LSQ Enquiry Detail", href: "/dashboard/reports/lsq-enquiry-details" },
      { title: "Payment Due Reports", href: "/dashboard/reports/payment-due" },
      { title: "Cancelled Receipt Details", href: "/dashboard/reports/cancelled-receipt" },
      { title: "Transferred Student Report", href: "/dashboard/reports/transferred-student" },
      { title: "FCR", href: "/dashboard/reports/fcr" },
      { title: "Admission Count", href: "/dashboard/reports/admission-count" },
      { title: "Student Forecasted Royalty Report", href: "/dashboard/reports/forecasted-royalty" },
    ],
  },
  {
    title: "Shortage/Damage",
    icon: Package,
    submenu: [
      { title: "Report Shortage", href: "/dashboard/shortage/report" },
      { title: "Damage Shortage", href: "/dashboard/shortage/damage" },
      { title: "Download Shortage/Damage Report", href: "/dashboard/shortage/download-report" },
    ],
  },
]

// Helper function to get institute logo path based on institute name
const getInstituteLogo = (institute: string | null | undefined): string => {
  if (!institute) {
    console.log("[Logo] No institute name provided, using placeholder")
    return "/placeholder-logo.png"
  }
  
  // Normalize: lowercase, trim, and remove spaces/hyphens/underscores for consistent matching
  const normalized = institute.toLowerCase().trim().replace(/[\s\-_]+/g, "")
  
  console.log(`[Logo] Institute: "${institute}" → Normalized: "${normalized}"`)
  
  // Map institute names to logo paths (normalized without spaces)
  const logoMap: Record<string, string> = {
    playgroup: "/logos/playgroup-logo.png",
    nursery: "/logos/nursery-logo.png",
    sujunor: "/logos/sujunor-logo.png",
    susenior: "/logos/susenior-logo.png",
    // Handle common variations and typos
    sujunior: "/logos/sujunor-logo.png",
    playschool: "/logos/playgroup-logo.png",
    playgroups: "/logos/playgroup-logo.png",
    nurseries: "/logos/nursery-logo.png",
    sujunors: "/logos/sujunor-logo.png",
    suseniors: "/logos/susenior-logo.png",
  }
  
  const logoPath = logoMap[normalized] || "/placeholder-logo.png"
  console.log(`[Logo] Selected logo: ${logoPath}`)
  
  return logoPath
}

export function MainSidebar() {
  const { isOpen, setIsOpen, isMobile } = useSidebar()
  const pathname = usePathname()
  const [institute, setInstitute] = useState<string | null>(null)
  const [logoPath, setLogoPath] = useState<string>("/placeholder-logo.png")
  const [imageError, setImageError] = useState(false)
  const [triedPlaceholder, setTriedPlaceholder] = useState(false)

  // Fetch institute from profile
  useEffect(() => {
    const loadInstitute = async () => {
      try {
        console.log("[Logo] Fetching profile to get institute...")
        const res = await fetch(`/api/profile`, {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          const instituteName = data.institute || null
          console.log("[Logo] Profile API response:", { institute: instituteName, fullData: data })
          setInstitute(instituteName)
          const newLogoPath = getInstituteLogo(instituteName)
          setLogoPath(newLogoPath)
          setImageError(false)
          setTriedPlaceholder(newLogoPath === "/placeholder-logo.png")
        } else {
          console.warn("[Logo] Profile API returned non-OK status:", res.status)
        }
      } catch (err) {
        console.error("[Logo] Failed to fetch institute info", err)
      }
    }
    void loadInstitute()
  }, [])

  const isActive = (href: string) => {
    return pathname === href
  }

  const sidebar = (
    <>
      <div className="flex h-16 items-center justify-center border-b px-4 bg-emerald-50 border-emerald-100">
        <Link href="/dashboard" className="flex items-center justify-center w-full h-full">
          <div className="relative w-full h-full flex items-center justify-center max-w-full max-h-full">
            {!imageError ? (
              <Image
                src={logoPath}
                alt={institute ? `${institute} Logo` : "Institute Logo"}
                fill
                className="object-contain p-2"
                onError={(e) => {
                  console.error(`[Logo] Failed to load image: ${logoPath}`, e)
                  // Try to fallback to placeholder if we haven't already
                  if (!triedPlaceholder && logoPath !== "/placeholder-logo.png") {
                    console.log("[Logo] Falling back to placeholder logo")
                    setLogoPath("/placeholder-logo.png")
                    setTriedPlaceholder(true)
                    // Don't set imageError yet, let it try the placeholder
                  } else {
                    // Both institute logo and placeholder failed, show icon
                    setImageError(true)
                  }
                }}
                onLoad={() => {
                  console.log(`[Logo] Successfully loaded: ${logoPath}`)
                }}
                unoptimized
              />
            ) : (
              <Building className="h-10 w-10 text-emerald-700" />
            )}
          </div>
          {/* <span className={cn("font-semibold text-sm text-left truncate", !isOpen && "hidden")}>SUNOIAKIDS PRE-SCHOOL  SYSTEM</span> */}
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {sidebarItems.map((item, index) => {
            if (!item.submenu) {
              return (
                <Link
                  key={index}
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-amber-100 hover:text-emerald-900",
                    isActive(item.href || "") && "bg-amber-200 text-emerald-900",
                  )}
                >
                  <item.icon className="h-5 w-5 text-emerald-700" />
                  <span className={cn("", !isOpen && "hidden")}>{item.title}</span>
                </Link>
              )
            }

            return (
              <Accordion key={index} type="single" collapsible className="border-none">
                <AccordionItem value={item.title} className="border-none">
                  <AccordionTrigger
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-amber-100 hover:text-emerald-900 no-underline text-left",
                    )}
                  >
                    <item.icon className="h-5 w-5 text-emerald-700" />
                    <span className={cn("", !isOpen && "hidden")}>{item.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className={cn(!isOpen && "hidden")}>
                    <div className="pl-4 pt-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-amber-100 hover:text-emerald-900",
                            isActive(subItem.href) && "bg-amber-200 text-emerald-900",
                          )}
                        >
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )
          })}
        </div>
      </ScrollArea>
    </>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-emerald-50">
          <div className="flex flex-col h-full">{sidebar}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-emerald-50 border-emerald-100",
        isOpen ? "w-64" : "w-[70px]",
        "transition-width duration-300",
      )}
    >
      {sidebar}
    </div>
  )
}
