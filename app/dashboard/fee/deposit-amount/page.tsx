"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, DollarSign, Check } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function DepositAmountPage() {
  const [studentId, setStudentId] = useState("")
  const [studentDetails, setStudentDetails] = useState<any>(null)
  const [cashForm, setCashForm] = useState({
    amount: "",
    date: "",
    transactionId: "",
    receivedBy: "",
    remarks: ""
  })

  const handleStudentSearch = async () => {
    if (studentId) {
      try {
        const res = await axios.get(` http://localhost:4000/api/admissions/students/${studentId}`)
        setStudentDetails(res.data)
      } catch (error) {
        console.error("Error fetching student details:", error)
        setStudentDetails(null)
      }
    } else {
      setStudentDetails(null)
    }
  }

  const handleCashChange = (field: string, value: string) => {
    setCashForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCashSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(cashForm.amount)
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid amount.")
      return
    }

    try {
      const payload = {
        studentId: studentDetails.studentId,
        name: studentDetails.name,
        amount: amt,
        date: cashForm.date,
        paymentMode: "Cash",
        transactionId: cashForm.transactionId,
        status: "Completed",
        remarks: cashForm.remarks,
        receivedBy: cashForm.receivedBy
      }

      await axios.post( "http://localhost:4000/api/deposit", payload)
      alert("Deposit saved successfully!")
      setCashForm({ amount: "", date: "", transactionId: "", receivedBy: "", remarks: "" })
    } catch (err) {
      console.error(err)
      alert("Failed to save deposit")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Deposit Amount</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Student Search</CardTitle>
          <CardDescription>Search for a student to deposit amount</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={handleStudentSearch}>
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {studentDetails && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Student Details</CardTitle>
              <CardDescription>Basic information about the student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                  <p>{studentDetails.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{studentDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Course</p>
                  <p>{studentDetails.course}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Batch</p>
                  <p>{studentDetails.batch}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="cash" className="space-y-4">
            <TabsList>
              <TabsTrigger value="cash">Cash Payment</TabsTrigger>
              <TabsTrigger value="cheque">Cheque Payment</TabsTrigger>
              <TabsTrigger value="online">Online Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="cash" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cash Payment</CardTitle>
                  <CardDescription>Enter details for cash payment</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleCashSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="amount"
                            placeholder="0.00"
                            className="pl-9"
                            value={cashForm.amount}
                            onChange={(e) => handleCashChange("amount", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-date">Payment Date</Label>
                        <Input
                          id="payment-date"
                          type="date"
                          value={cashForm.date}
                          onChange={(e) => handleCashChange("date", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transactionId">Transaction ID</Label>
                        <Input
                          id="transactionId"
                          placeholder="Enter transaction ID or Receipt No"
                          value={cashForm.transactionId}
                          onChange={(e) => handleCashChange("transactionId", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="received-by">Received By</Label>
                        <Input
                          id="received-by"
                          placeholder="Enter name of receiver"
                          value={cashForm.receivedBy}
                          onChange={(e) => handleCashChange("receivedBy", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Textarea
                        id="remarks"
                        placeholder="Enter any additional remarks"
                        rows={3}
                        value={cashForm.remarks}
                        onChange={(e) => handleCashChange("remarks", e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full md:w-auto">
                      <Check className="mr-2 h-4 w-4" /> Process Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="online" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Online Payment</CardTitle>
                  <CardDescription>Enter details for online payment</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="online-amount">Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id="online-amount" placeholder="0.00" className="pl-9" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction-date">Transaction Date</Label>
                        <Input id="transaction-date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction-id">Transaction ID</Label>
                        <Input id="transaction-id" placeholder="Enter transaction ID" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <Select>
                          <SelectTrigger id="payment-method">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="netbanking">Net Banking</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="creditcard">Credit Card</SelectItem>
                            <SelectItem value="debitcard">Debit Card</SelectItem>
                            <SelectItem value="wallet">Digital Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-for-online">Payment For</Label>
                        <Select>
                          <SelectTrigger id="payment-for-online">
                            <SelectValue placeholder="Select payment purpose" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tuition">Tuition Fee</SelectItem>
                            <SelectItem value="development">Development Fee</SelectItem>
                            <SelectItem value="library">Library Fee</SelectItem>
                            <SelectItem value="laboratory">Laboratory Fee</SelectItem>
                            <SelectItem value="examination">Examination Fee</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="verified-by">Verified By</Label>
                        <Input id="verified-by" placeholder="Enter name of verifier" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="remarks-online">Remarks</Label>
                      <Textarea id="remarks-online" placeholder="Enter any additional remarks" rows={3} />
                    </div>
                    <Button type="submit" className="w-full md:w-auto">
                      <Check className="mr-2 h-4 w-4" /> Process Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
