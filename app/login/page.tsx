"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { School, Building2, GraduationCap, BookOpen } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const institutes = [
    { key: "playgroup", name: "Playgroup", icon: School, color: "bg-orange-50", iconColor: "text-orange-600" },
    { key: "nursery", name: "Nursery", icon: GraduationCap, color: "bg-emerald-50", iconColor: "text-emerald-600" },
    { key: "sujunor", name: "Sujunor", icon: BookOpen, color: "bg-amber-50", iconColor: "text-amber-600" },
    { key: "susenior", name: "Susenior", icon: Building2, color: "bg-slate-50", iconColor: "text-slate-600" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Select Your Institute</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose one to continue to login</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {institutes.map((inst) => (
            <div
              key={inst.key}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/login/${inst.key}`)}
              onKeyDown={(e) => { if (e.key === "Enter") router.push(`/login/${inst.key}`) }}
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xl"
              aria-label={`Open ${inst.name} login`}
            >
              <Card
                className={`rounded-xl shadow-sm border border-orange-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${inst.color}`}
              >
                <CardHeader className="items-center pt-8 pb-2">
                  <div className={`rounded-full p-4 bg-white shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    <inst.icon className={`h-8 w-8 ${inst.iconColor} transition-colors`} />
                  </div>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <CardTitle className="text-lg font-semibold tracking-tight">{inst.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Click to continue</p>
                  <div className="mt-3">
                    <Link href={`/signup?institute=${inst.key}`} onClick={(e)=> e.stopPropagation()} className="text-xs underline text-orange-600 hover:text-orange-700">Sign up</Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/signup">
            <Button variant="outline" className="transition-colors">Create an account</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
