"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForecastedRoyaltyReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Student Forecasted Royalty Report</h1>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Overview</CardTitle>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">This report page is under construction.</div>
        </CardContent>
      </Card>
    </div>
  )
}
