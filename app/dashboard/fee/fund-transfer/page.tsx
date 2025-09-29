"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileDown, ArrowRight, Eye, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

type Account = {
  _id?: string
  accountId?: string
  name?: string
  bank?: string
  accountNumber?: string
  balance?: number
}

type Transfer = {
  _id?: string
  transferId?: string
  fromAccountId?: string
  toAccountId?: string
  fromAccount?: string
  toAccount?: string
  amount?: number
  date?: string | Date
  reference?: string
  approvedBy?: string
  status?: "Pending" | "Completed" | "Rejected"
  notes?: string
}

export default function FundTransferPage() {
  // Single API base (edit env var or fallback)
  const API = process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.170:4000"

  const [searchTerm, setSearchTerm] = useState("")
  const [transferData, setTransferData] = useState<Transfer[]>([])
  const [accountData, setAccountData] = useState<Account[]>([])
  const [filteredData, setFilteredData] = useState<Transfer[]>([])

  // Transfer form supports IDs (preferred) and names (legacy)
  const [form, setForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    fromAccount: "",
    toAccount: "",
    amount: "",
    reference: "",
    transferDate: "",
    approvedBy: "",
    notes: "",
  })

  // Add Account
  const [accountForm, setAccountForm] = useState({
    name: "",
    bank: "",
    accountNumber: "",
    balance: "",
  })
  const [addingAccount, setAddingAccount] = useState(false)

  // Transfer-details modal
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Account transactions modal
  const [isTxnOpen, setIsTxnOpen] = useState(false)
  const [txnAccount, setTxnAccount] = useState<Account | null>(null)
  const [txnFilter, setTxnFilter] = useState<"all" | "in" | "out">("all")

  // ---------- Helpers for robust keys/options ----------
  const accountToOption = (a: Account, idx: number) => {
    const key = a._id ?? a.accountId ?? `idx-${idx}` // guaranteed non-empty
    const value = a.accountId
      ? `aid:${a.accountId}`
      : a._id
      ? `oid:${a._id}`
      : `name:${a.name || "Unnamed"}`
    const label = `${a.name ?? "Unnamed"} • ${(a.accountId ?? a._id ?? "—")} • ${a.balance ?? 0}`
    return { key: String(key), value, label }
  }

  const handleFromSelect = (v: string) => {
    if (v.startsWith("aid:")) {
      setForm((p) => ({ ...p, fromAccountId: v.slice(4), fromAccount: "" }))
    } else if (v.startsWith("oid:")) {
      const oid = v.slice(4)
      const acc = accountData.find((a) => a._id === oid)
      setForm((p) => ({
        ...p,
        fromAccountId: acc?.accountId ?? "",
        fromAccount: acc?.name ?? "",
      }))
    } else if (v.startsWith("name:")) {
      setForm((p) => ({ ...p, fromAccountId: "", fromAccount: v.slice(5) }))
    }
  }

  const handleToSelect = (v: string) => {
    if (v.startsWith("aid:")) {
      setForm((p) => ({ ...p, toAccountId: v.slice(4), toAccount: "" }))
    } else if (v.startsWith("oid:")) {
      const oid = v.slice(4)
      const acc = accountData.find((a) => a._id === oid)
      setForm((p) => ({
        ...p,
        toAccountId: acc?.accountId ?? "",
        toAccount: acc?.name ?? "",
      }))
    } else if (v.startsWith("name:")) {
      setForm((p) => ({ ...p, toAccountId: "", toAccount: v.slice(5) }))
    }
  }

  // ---------- Data fetch ----------
  const fetchTransfers = async () => {
    const res = await axios.get(`${API}/api/transferfunds`)
    const data: Transfer[] = res.data || []
    // newest first
    data.sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime())
    setTransferData(data)
    setFilteredData(data)
  }

  const fetchAccounts = async () => {
    const res = await axios.get(`${API}/api/account`)
    setAccountData(res.data || [])
  }

  useEffect(() => {
    fetchTransfers()
    fetchAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- UI handlers ----------
  const handleSearch = () => {
    const q = searchTerm.toLowerCase()
    const filtered = (transferData || []).filter(
      (item) =>
        item.transferId?.toLowerCase().includes(q) ||
        item.fromAccount?.toLowerCase().includes(q) ||
        item.toAccount?.toLowerCase().includes(q) ||
        item.reference?.toLowerCase().includes(q)
    )
    setFilteredData(filtered)
  }

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const amt = Number(form.amount)
      // allow either IDs or names (legacy)
      const hasFrom = !!form.fromAccountId || !!form.fromAccount
      const hasTo = !!form.toAccountId || !!form.toAccount
      if (!hasFrom || !hasTo) {
        alert("Please select both From and To accounts.")
        return
      }
      if (form.fromAccountId && form.toAccountId && form.fromAccountId === form.toAccountId) {
        alert("From and To accounts cannot be the same.")
        return
      }
      if (!amt || amt <= 0) {
        alert("Amount must be a number greater than 0.")
        return
      }

      const payload: any = {
        amount: amt,
        reference: form.reference,
        transferDate: form.transferDate, // optional
        approvedBy: form.approvedBy,
        notes: form.notes,
      }
      if (form.fromAccountId) payload.fromAccountId = form.fromAccountId
      else payload.fromAccount = form.fromAccount

      if (form.toAccountId) payload.toAccountId = form.toAccountId
      else payload.toAccount = form.toAccount

      await axios.post(`${API}/api/transferfunds`, payload)

      alert("Transfer created successfully!")
      setForm({
        fromAccountId: "",
        toAccountId: "",
        fromAccount: "",
        toAccount: "",
        amount: "",
        reference: "",
        transferDate: "",
        approvedBy: "",
        notes: "",
      })
      fetchTransfers()
      fetchAccounts() // refresh balances
    } catch (err: any) {
      console.error("Transfer create failed:", err?.response?.data || err)
      alert(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error creating transfer"
      )
    }
  }

  const handleAccountChange = (key: string, value: string) => {
    setAccountForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountForm.name || !accountForm.bank || !accountForm.accountNumber) {
      alert("Please fill Name, Bank, and Account Number.")
      return
    }
    const numericBalance =
      accountForm.balance?.toString().trim() === "" ? 0 : Number(accountForm.balance)
    if (Number.isNaN(numericBalance) || numericBalance < 0) {
      alert("Balance must be a valid non-negative number.")
      return
    }
    setAddingAccount(true)
    try {
      await axios.post(`${API}/api/account`, {
        name: accountForm.name,
        bank: accountForm.bank,
        accountNumber: accountForm.accountNumber,
        balance: numericBalance,
      })
      setAccountForm({ name: "", bank: "", accountNumber: "", balance: "" })
      await fetchAccounts()
      alert("Account added successfully!")
    } catch (err: any) {
      console.error(err)
      alert(err?.response?.data?.error || "Error adding account")
    } finally {
      setAddingAccount(false)
    }
  }

  // ---------- Account Transactions modal logic ----------
  const openTransactions = (account: Account) => {
    setTxnAccount(account)
    setTxnFilter("all")
    setIsTxnOpen(true)
  }

  const closeTransactions = () => {
    setIsTxnOpen(false)
    setTxnAccount(null)
  }

  // derive transfers for the selected account with direction
  const txnRows = useMemo(() => {
    if (!txnAccount) return []

    const aid = txnAccount.accountId
    const aname = (txnAccount.name || "").toLowerCase()

    const match = (t: Transfer) => {
      const fromMatch =
        (!!aid && t.fromAccountId === aid) ||
        (!t.fromAccountId && (t.fromAccount || "").toLowerCase() === aname)
      const toMatch =
        (!!aid && t.toAccountId === aid) ||
        (!t.toAccountId && (t.toAccount || "").toLowerCase() === aname)
      if (!fromMatch && !toMatch) return null
      const direction = fromMatch ? "out" : "in" // cannot be both (we disallow same account)
      const counterparty = fromMatch ? t.toAccount : t.fromAccount
      return { ...t, _direction: direction as "in" | "out", _counterparty: counterparty }
    }

    let rows = transferData
      .map(match)
      .filter((x: any) => !!x) as (Transfer & { _direction: "in" | "out"; _counterparty?: string })[]

    if (txnFilter !== "all") {
      rows = rows.filter((r) => r._direction === txnFilter)
    }

    // newest first
    rows.sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime())
    return rows
  }, [txnAccount, txnFilter, transferData])

  const txnTotals = useMemo(() => {
    let incoming = 0
    let outgoing = 0
    txnRows.forEach((r) => {
      const amt = Number(r.amount) || 0
      if (r._direction === "in") incoming += amt
      else outgoing += amt
    })
    return { incoming, outgoing, net: incoming - outgoing }
  }, [txnRows])

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Fund Transfer</h1>
        <Button>
          <FileDown className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      <Tabs defaultValue="transfers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transfers">Transfer History</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="new-transfer">New Transfer</TabsTrigger>
        </TabsList>

        {/* TRANSFERS */}
        <TabsContent value="transfers" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Search by ID, account, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"><span>All Statuses</span></SelectItem>
                <SelectItem value="completed"><span>Completed</span></SelectItem>
                <SelectItem value="pending"><span>Pending</span></SelectItem>
                <SelectItem value="rejected"><span>Rejected</span></SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Fund Transfer History</CardTitle>
              <CardDescription>View all fund transfers between accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>From Account</TableHead>
                    <TableHead>To Account</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((t, idx) => (
                    <TableRow key={t._id || t.transferId || `t-${idx}`}>
                      <TableCell>{t.transferId}</TableCell>
                      <TableCell>{t.fromAccount}</TableCell>
                      <TableCell>{t.toAccount}</TableCell>
                      <TableCell>{t.amount}</TableCell>
                      <TableCell>{t.date ? new Date(t.date).toLocaleDateString() : ""}</TableCell>
                      <TableCell>{t.reference}</TableCell>
                      <TableCell>{t.approvedBy}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            t.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : t.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {t.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTransfer(t)
                            setIsViewOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNTS */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View all accounts and their balances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account ID</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountData.map((a, idx) => (
                    <TableRow key={a._id || a.accountId || `a-${idx}`}>
                      <TableCell>{a.accountId}</TableCell>
                      <TableCell>{a.name}</TableCell>
                      <TableCell>{a.bank}</TableCell>
                      <TableCell>{a.accountNumber}</TableCell>
                      <TableCell className="font-medium">
                        {typeof a.balance === "number" ? a.balance.toFixed(2) : a.balance}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openTransactions(a)}>
                          <Eye className="h-4 w-4 mr-1" /> View Transactions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Add Account Form */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Add New Account</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a new account to track transfers and balances.
                </p>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleAddAccountSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="acc-name">Account Name</Label>
                    <Input
                      id="acc-name"
                      placeholder="e.g., Operations Wallet"
                      value={accountForm.name}
                      onChange={(e) => handleAccountChange("name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acc-bank">Bank</Label>
                    <Input
                      id="acc-bank"
                      placeholder="e.g., HDFC Bank"
                      value={accountForm.bank}
                      onChange={(e) => handleAccountChange("bank", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acc-number">Account Number</Label>
                    <Input
                      id="acc-number"
                      placeholder="Enter account number"
                      value={accountForm.accountNumber}
                      onChange={(e) => handleAccountChange("accountNumber", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acc-balance">Opening Balance</Label>
                    <Input
                      id="acc-balance"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={accountForm.balance}
                      onChange={(e) => handleAccountChange("balance", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Button type="submit" disabled={addingAccount}>
                      {addingAccount ? "Adding..." : "Add Account"}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEW TRANSFER */}
        <TabsContent value="new-transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Fund Transfer</CardTitle>
              <CardDescription>Transfer funds between accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="from-account">From Account</Label>
                      <Select onValueChange={handleFromSelect}>
                        <SelectTrigger id="from-account">
                          <SelectValue placeholder="Select source account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accountData.map((a, idx) => {
                            const { key, value, label } = accountToOption(a, idx)
                            return (
                              <SelectItem key={key} value={value}>
                                <span>{label}</span>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        placeholder="Enter amount to transfer"
                        value={form.amount}
                        onChange={(e) => handleChange("amount", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference">Reference</Label>
                      <Input
                        id="reference"
                        placeholder="Enter reference for this transfer"
                        value={form.reference}
                        onChange={(e) => handleChange("reference", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center my-4 md:my-0">
                      <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary">
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="to-account">To Account</Label>
                      <Select onValueChange={handleToSelect}>
                        <SelectTrigger id="to-account">
                          <SelectValue placeholder="Select destination account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accountData.map((a, idx) => {
                            const { key, value, label } = accountToOption(a, idx)
                            return (
                              <SelectItem key={key} value={value}>
                                <span>{label}</span>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transfer-date">Transfer Date</Label>
                      <Input
                        id="transfer-date"
                        type="date"
                        value={form.transferDate}
                        onChange={(e) => handleChange("transferDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="approved-by">Approved By</Label>
                      <Input
                        id="approved-by"
                        placeholder="Enter name of approver"
                        value={form.approvedBy}
                        onChange={(e) => handleChange("approvedBy", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto">
                  Process Transfer
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer Details Modal */}
      {isViewOpen && selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setIsViewOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Transfer Details</h2>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {selectedTransfer.transferId}</p>
              <p><strong>From:</strong> {selectedTransfer.fromAccount}</p>
              <p><strong>To:</strong> {selectedTransfer.toAccount}</p>
              <p><strong>Amount:</strong> {selectedTransfer.amount}</p>
              <p><strong>Date:</strong> {selectedTransfer.date ? new Date(selectedTransfer.date).toLocaleString() : ""}</p>
              <p><strong>Reference:</strong> {selectedTransfer.reference}</p>
              <p><strong>Approved By:</strong> {selectedTransfer.approvedBy}</p>
              <p><strong>Status:</strong> {selectedTransfer.status}</p>
              <p><strong>Notes:</strong> {selectedTransfer.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Account Transactions Modal */}
      {isTxnOpen && txnAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={closeTransactions}
            >
              ✕
            </button>

            <div className="mb-4">
              <h2 className="text-xl font-semibold">{txnAccount.name} — Transactions</h2>
              <p className="text-sm text-muted-foreground">
                ID: {txnAccount.accountId || txnAccount._id} • Bank: {txnAccount.bank} • Balance:{" "}
                {typeof txnAccount.balance === "number" ? txnAccount.balance.toFixed(2) : txnAccount.balance}
              </p>
            </div>

            {/* Quick filters & totals */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <div className="flex gap-2">
                <Button
                  variant={txnFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTxnFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={txnFilter === "in" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTxnFilter("in")}
                >
                  <ArrowDownRight className="h-4 w-4 mr-1" /> Incoming
                </Button>
                <Button
                  variant={txnFilter === "out" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTxnFilter("out")}
                >
                  <ArrowUpRight className="h-4 w-4 mr-1" /> Outgoing
                </Button>
              </div>
              <div className="text-sm">
                <span className="mr-4">Incoming: <strong>{txnTotals.incoming.toFixed(2)}</strong></span>
                <span className="mr-4">Outgoing: <strong>{txnTotals.outgoing.toFixed(2)}</strong></span>
                <span>Net: <strong>{txnTotals.net.toFixed(2)}</strong></span>
              </div>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dir</TableHead>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>Counterparty</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txnRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                  {txnRows.map((r, idx) => (
                    <TableRow key={r._id || r.transferId || `txn-${idx}`}>
                      <TableCell>
                        {r._direction === "in" ? (
                          <span className="inline-flex items-center text-green-700">
                            <ArrowDownRight className="h-4 w-4 mr-1" /> In
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-700">
                            <ArrowUpRight className="h-4 w-4 mr-1" /> Out
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{r.transferId}</TableCell>
                      <TableCell>{(r as any)._counterparty || "-"}</TableCell>
                      <TableCell>{r.amount?.toFixed ? r.amount.toFixed(2) : r.amount}</TableCell>
                      <TableCell>{r.date ? new Date(r.date).toLocaleString() : ""}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            r.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : r.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {r.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTransfer(r)
                            setIsViewOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
