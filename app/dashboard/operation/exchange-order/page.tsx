"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import {
  Search, FileDown, Filter, Eye, Edit, Trash,
  CheckCircle, XCircle, Plus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Status = "Pending" | "Approved" | "Completed" | "Rejected"

interface ExchangeOrder {
  _id?: string
  id: string
  studentId: string
  name: string
  oldItem: string
  newItem: string
  reason: string
  date: string           // yyyy-mm-dd
  status: Status
}

export default function ExchangeOrderPage() {
  const { toast } = useToast()

  /* ─────────────── state ─────────────── */
  const [orders,   setOrders]   = useState<ExchangeOrder[]>([])
  const [filtered, setFiltered] = useState<ExchangeOrder[]>([])
  const [search,   setSearch]   = useState("")

  const [dlgAdd, setDlgAdd]   = useState(false)
  const [dlgView,setDlgView]  = useState(false)
  const [dlgEdit,setDlgEdit]  = useState(false)
  const [dlgDel, setDlgDel]   = useState(false)
  const [sel,    setSel]      = useState<ExchangeOrder|null>(null)

  const blank: ExchangeOrder = {
    id:"", studentId:"", name:"", oldItem:"", newItem:"",
    reason:"", date:new Date().toISOString().slice(0,10), status:"Pending"
  }
  const [form, setForm] = useState<ExchangeOrder>(blank)

  /* ─────────────── API base ─────────────── */
  const API = process.env.NEXT_PUBLIC_API_BASE ||  "http://localhost:4000/api"

  /* ─────────────── helpers ─────────────── */
  const badge = (s: Status) =>
    ({
      Pending   : "bg-yellow-100 text-yellow-800",
      Approved  : "bg-blue-100  text-blue-800",
      Completed : "bg-green-100 text-green-800",
      Rejected  : "bg-red-100   text-red-800"
    }[s])

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API}/exchange-orders`, { credentials:"include" })
      const data = await res.json() as ExchangeOrder[]
      setOrders(data); setFiltered(data)
    } catch { toast({ title:"Error", description:"Failed to fetch orders" }) }
  }

  useEffect(() => { fetchOrders() }, [])

  const refilter = (q = search) => {
    const term = q.toLowerCase()
    setFiltered(
      orders.filter(o =>
        [o.id,o.studentId,o.name,o.oldItem,o.newItem,o.reason]
          .some(f => f.toLowerCase().includes(term))
      )
    )
  }

  /* ─────────────── CRUD wrappers ─────────────── */
  const insertOrder = async () => {
    try {
      const res = await fetch(`${API}/exchange-orders`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        credentials:"include", body:JSON.stringify(form)
      })
      if(!res.ok) throw new Error()
      toast({ title:"Added", description:`Order ${form.id || "(auto)"} created.` })
      setDlgAdd(false); setForm(blank); fetchOrders()
    } catch { toast({ title:"Error", description:"Add failed", variant:"destructive" }) }
  }

  const updateOrder = async (id:string, body:Partial<ExchangeOrder>, msg="Updated") => {
    await fetch(`${API}/exchange-orders/${id}`, {
      method:"PUT", headers:{ "Content-Type":"application/json" },
      credentials:"include", body:JSON.stringify(body)
    })
    toast({ title:msg }); fetchOrders()
  }

  const deleteOrder = async (id:string) => {
    await fetch(`${API}/exchange-orders/${id}`, { method:"DELETE", credentials:"include" })
    toast({ title:"Deleted" }); fetchOrders()
  }

  /* student-lookup for autofill */
  const fetchStudent = async (sid:string) => {
    const res = await fetch(`${API}/admissions/students/${encodeURIComponent(sid)}`,
                            { credentials:"include" })
    if(!res.ok) throw new Error("Student not found")
    return res.json() as Promise<{ studentId:string; name:string }>
  }

  /* ─────────────────── UI ─────────────────── */
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Exchange Orders</h1>
        <Button onClick={()=>{ setForm(blank); setDlgAdd(true) }}>
          <Plus className="mr-2 h-4 w-4"/> New Exchange Order
        </Button>
      </div>

      {/* toolbar */}
      <div className="flex items-center gap-4 mb-4">
        <Input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}
               className="max-w-md"/>
        <Button variant="outline" onClick={()=>refilter()}>
          <Search className="h-4 w-4 mr-2"/>Search
        </Button>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2"/>Filter</Button>
        <Button variant="outline"><FileDown className="h-4 w-4 mr-2"/>Export</Button>
      </div>

      {/* table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Exchange Order Requests</CardTitle>
          <CardDescription>Manage item exchange requests from students</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {["Order ID","Student ID","Name","Old Item","New Item",
                  "Reason","Date","Status","Actions"].map(h=>
                    <TableHead key={h}>{h}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o=>(
                <TableRow key={o._id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.studentId}</TableCell>
                  <TableCell>{o.name}</TableCell>
                  <TableCell>{o.oldItem}</TableCell>
                  <TableCell>{o.newItem}</TableCell>
                  <TableCell>{o.reason}</TableCell>
                  <TableCell>{o.date}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge(o.status)}`}>{o.status}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap flex gap-1">
                    <Button size="icon" variant="ghost"
                            onClick={()=>{setSel(o);setDlgView(true)}}>
                      <Eye className="h-4 w-4"/>
                    </Button>
                    <Button size="icon" variant="ghost"
                            onClick={()=>{setSel(o);setForm(o);setDlgEdit(true)}}>
                      <Edit className="h-4 w-4"/>
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-600"
                            onClick={()=>{setSel(o);setDlgDel(true)}}>
                      <Trash className="h-4 w-4"/>
                    </Button>
                    {o.status==="Pending" && (
                      <>
                        <Button size="icon" variant="ghost" className="text-green-600"
                                onClick={()=>updateOrder(o._id!,{status:"Approved"},"Approved")}>
                          <CheckCircle className="h-4 w-4"/>
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-600"
                                onClick={()=>updateOrder(o._id!,{status:"Rejected"},"Rejected")}>
                          <XCircle className="h-4 w-4"/>
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* view dialog */}
      <Dialog open={dlgView} onOpenChange={setDlgView}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Exchange Order Details</DialogTitle></DialogHeader>
          {sel && (
            <div className="grid grid-cols-2 gap-4 py-4 text-sm">
              {Object.entries(sel).filter(([k])=>k!=="_id").map(([k,v])=>(
                <div key={k}>
                  <h4 className="text-muted-foreground capitalize">{k}</h4>
                  <p>{String(v)}</p>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={()=>{setDlgView(false); setDlgEdit(true)}}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* add / edit dialog (shared form) */}
      <Dialog open={dlgAdd || dlgEdit}
              onOpenChange={(o)=> dlgAdd ? setDlgAdd(o) : setDlgEdit(o)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{dlgAdd? "Add Exchange Order" : "Edit Exchange Order"}</DialogTitle>
            {!dlgAdd && <DialogDescription>ID: {form.id}</DialogDescription>}
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* student row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Student&nbsp;ID</Label>
                <Input value={form.studentId}
                       disabled={!dlgAdd}
                       onChange={e=>setForm({...form,studentId:e.target.value})}
                       onBlur={async e=>{
                         if(!dlgAdd) return
                         const sid=e.target.value.trim()
                         if(!sid) return
                         try{
                           const stu = await fetchStudent(sid)
                           setForm(f=>({...f,studentId:stu.studentId,name:stu.name}))
                           toast({title:"Student found",description:stu.name})
                         }catch{
                           toast({title:"Not found",description:"Student not found",variant:"destructive"})
                         }
                       }}/>
              </div>
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={form.name} disabled />
              </div>
            </div>

            {/* items */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Old Item</Label>
                <Input value={form.oldItem}
                       onChange={e=>setForm({...form,oldItem:e.target.value})}/>
              </div>
              <div className="space-y-1">
                <Label>New Item</Label>
                <Input value={form.newItem}
                       onChange={e=>setForm({...form,newItem:e.target.value})}/>
              </div>
            </div>

            {/* reason */}
            <div className="space-y-1">
              <Label>Reason</Label>
              <Textarea rows={3} value={form.reason}
                        onChange={e=>setForm({...form,reason:e.target.value})}/>
            </div>

            {/* date & status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Date</Label>
                <Input type="date" value={form.date}
                       onChange={e=>setForm({...form,date:e.target.value})}/>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status}
                        onValueChange={v=>setForm({...form,status:v as Status})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {["Pending","Approved","Completed","Rejected"].map(s=>(
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline"
                    onClick={()=> dlgAdd ? setDlgAdd(false) : setDlgEdit(false)}>
              Cancel
            </Button>
            {dlgAdd ? (
              <Button onClick={insertOrder}>Save</Button>
            ) : (
              <Button onClick={()=> form._id && updateOrder(form._id, form, "Saved")}>
                Save&nbsp;changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete dialog */}
      <Dialog open={dlgDel} onOpenChange={setDlgDel}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Delete Order</DialogTitle></DialogHeader>
          <DialogDescription>
            Are you sure you want to delete&nbsp;
            <span className="font-semibold">{sel?.id}</span>?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDlgDel(false)}>Cancel</Button>
            <Button variant="destructive"
                    onClick={()=>{ sel?._id && deleteOrder(sel._id); setDlgDel(false) }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
