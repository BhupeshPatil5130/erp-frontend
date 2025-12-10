"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Search, FileDown, Calendar, Receipt, Eye, Download } from "lucide-react"

// Mock dataset (replace with API when available)
const cancelledReceipts = [
  {
    id: "CR-0001",
    receiptNo: "RCP-2024-0156",
    studentId: "STU-1001",
    studentName: "Aarav Sharma",
    class: "Grade 5",
    campus: "Main",
    amount: 3500,
    paymentMode: "UPI",
    originalDate: "2024-10-02",
    cancelledDate: "2024-10-05",
    cancelledBy: "Admin",
    reason: "Duplicate payment",
  },
  {
    id: "CR-0002",
    receiptNo: "RCP-2024-0210",
    studentId: "STU-1045",
    studentName: "Isha Patel",
    class: "Grade 3",
    campus: "East Wing",
    amount: 1200,
    paymentMode: "Cash",
    originalDate: "2024-10-03",
    cancelledDate: "2024-10-07",
    cancelledBy: "Accountant",
    reason: "Parent request",
  },
  {
    id: "CR-0003",
    receiptNo: "RCP-2024-0222",
    studentId: "STU-1077",
    studentName: "Vihaan Gupta",
    class: "Nursery",
    campus: "Pre-School",
    amount: 2200,
    paymentMode: "Cheque",
    originalDate: "2024-10-04",
    cancelledDate: "2024-10-09",
    cancelledBy: "Admin",
    reason: "Cheque bounce",
  },
]

export default function CancelledReceiptDetailsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" })
  const [status, setStatus] = useState<string>("all")
  const [mode, setMode] = useState<string>("all")
  const [campus, setCampus] = useState<string>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const from = dateRange.from ? new Date(dateRange.from) : new Date(0)
    const to = dateRange.to ? new Date(dateRange.to) : new Date()
    return cancelledReceipts.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase())

      const cancelledAt = new Date(r.cancelledDate)
      const matchesDate = cancelledAt >= from && cancelledAt <= to

      const matchesMode = mode === "all" || r.paymentMode.toLowerCase() === mode
      const matchesCampus = campus === "all" || r.campus.toLowerCase() === campus
      // status is always "cancelled" for this report; keep hook for parity
      const matchesStatus = status === "all" || status === "cancelled"

      return matchesSearch && matchesDate && matchesMode && matchesCampus && matchesStatus
    })
  }, [searchTerm, dateRange, status, mode, campus])

  // CSV helpers
  const toCSV = (rows: Array<Array<string | number>>) =>
    rows
      .map((r) =>
        r
          .map((v) => {
            const s = String(v ?? "")
            if (s.includes('"') || s.includes(',') || s.includes('\n')) {
              return '"' + s.replace(/"/g, '""') + '"'
            }
            return s
          })
          .join(","),
      )
      .join("\n")

  const downloadTextFile = (fileName: string, text: string, mime = "text/csv;charset=utf-8;") => {
    const blob = new Blob([text], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const exportAll = () => {
    const header = [
      "Receipt No",
      "Student ID",
      "Student Name",
      "Class",
      "Campus",
      "Amount",
      "Mode",
      "Original Date",
      "Cancelled Date",
      "Cancelled By",
      "Reason",
    ]
    const rows = filtered.map((r) => [
      r.receiptNo,
      r.studentId,
      r.studentName,
      r.class,
      r.campus,
      r.amount,
      r.paymentMode,
      r.originalDate,
      r.cancelledDate,
      r.cancelledBy,
      r.reason,
    ])
    downloadTextFile("cancelled-receipts.csv", toCSV([header, ...rows]))
  }

  const exportOne = (id: string) => {
    const r = cancelledReceipts.find((x) => x.id === id)
    if (!r) return
    const header = Object.keys(r)
    const values = Object.values(r) as Array<string | number>
    downloadTextFile(`${r.receiptNo}.csv`, toCSV([header, values]))
  }

  const totalAmount = useMemo(() => filtered.reduce((sum, r) => sum + (r.amount || 0), 0), [filtered])
  const todaysCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return filtered.filter((r) => r.cancelledDate === today).length
  }, [filtered])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cancelled Receipt Details</h1>
        <Button onClick={exportAll}>
          <FileDown className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cancelled</p>
                <h3 className="text-2xl font-bold">{filtered.length}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <h3 className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <FileDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled Today</p>
                <h3 className="text-2xl font-bold">{todaysCount}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>Filter cancelled receipts by parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Search by student, ID, receipt no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">Cancelled Date</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
                <span>to</span>
                <Input
                  id="to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Payment Mode</Label>
              <Select onValueChange={(v) => setMode(v)}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campus">Campus</Label>
              <Select onValueChange={(v) => setCampus(v)}>
                <SelectTrigger id="campus">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="main">Main</SelectItem>
                  <SelectItem value="east wing">East Wing</SelectItem>
                  <SelectItem value="pre-school">Pre-School</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Cancelled Receipts</CardTitle>
          <CardDescription>Showing {filtered.length} records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>Cancelled</TableHead>
                  <TableHead>Cancelled By</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.receiptNo}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{r.studentName}</div>
                      <div className="text-xs text-muted-foreground">{r.studentId}</div>
                    </TableCell>
                    <TableCell>{r.class}</TableCell>
                    <TableCell>{r.campus}</TableCell>
                    <TableCell className="text-right">₹{r.amount.toLocaleString()}</TableCell>
                    <TableCell>{r.paymentMode}</TableCell>
                    <TableCell>{r.originalDate}</TableCell>
                    <TableCell>{r.cancelledDate}</TableCell>
                    <TableCell>{r.cancelledBy}</TableCell>
                    <TableCell>{r.reason}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedId(r.id)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => exportOne(r.id)}>
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <div className="py-10 text-center text-sm text-muted-foreground">No cancelled receipts found for the selected filters.</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      {selectedId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Receipt Details</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportOne(selectedId)}>
                  <Download className="h-4 w-4 mr-1" /> Download CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
              </div>
            </div>
            <CardDescription>Receipt breakdown and metadata</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const r = cancelledReceipts.find((x) => x.id === selectedId)
              if (!r) return null
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Receipt No</div>
                    <div className="font-medium">{r.receiptNo}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Student</div>
                    <div className="font-medium">{r.studentName} ({r.studentId})</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Class</div>
                    <div className="font-medium">{r.class}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Campus</div>
                    <div className="font-medium">{r.campus}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Amount</div>
                    <div className="font-medium">₹{r.amount.toLocaleString()}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Payment Mode</div>
                    <div className="font-medium">{r.paymentMode}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Original Date</div>
                    <div className="font-medium">{r.originalDate}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Cancelled Date</div>
                    <div className="font-medium">{r.cancelledDate}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Cancelled By</div>
                    <div className="font-medium">{r.cancelledBy}</div>
                  </div>
                  <div className="md:col-span-3">
                    <Separator className="my-2" />
                    <div className="text-xs text-muted-foreground">Reason</div>
                    <div className="font-medium">{r.reason}</div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
