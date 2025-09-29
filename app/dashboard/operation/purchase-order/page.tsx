"use client"

import { FormEvent, useEffect, useState } from "react"

/* ---------------- shadcn UI ---------------- */
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Search, FileDown, Eye, Plus, ShoppingCart, Check, Trash, Edit as Pencil,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/* ---------------- types ---------------- */
type Status = "Pending" | "Shipped" | "Delivered" | "Cancelled"

interface Supplier {
  _id?: string
  id: string
  name: string
  contact: string
  email: string
}

interface PurchaseOrder {
  _id?: string
  id: string
  supplierId: string
  supplier: string
  items: string
  quantity: string
  totalAmount: string
  orderDate: string
  expectedDelivery: string
  status: Status
  notes?: string
}

/* ---------------- helpers ---------------- */
const API = process.env.NEXT_PUBLIC_API_BASE ||  "http://localhost:4000/api"
const api = (p: string, o: RequestInit = {}) =>
  fetch(`${API}${p}`, { credentials: "include", ...o })

const apiJSON = (p: string, method: string, body: unknown) =>
  api(p, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

const badge = (s: Status) =>
  ({
    Pending: "bg-yellow-100 text-yellow-800",
    Shipped: "bg-blue-100 text-blue-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  }[s])

/* ======================= component ======================= */
export default function PurchaseOrderPage() {
  const { toast } = useToast()

  /* ----------- state ----------- */
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [orders, setOrders]       = useState<PurchaseOrder[]>([])
  const [filtered, setFiltered]   = useState<PurchaseOrder[]>([])

  const [search, setSearch]       = useState("")
  const [statusFil, setStatusFil] = useState<Status | "all">("all")

  /* dialogs */
  const [dlgAddSup, setDlgAddSup] = useState(false)
  const [dlgEdtSup, setDlgEdtSup] = useState(false)
  const [dlgViewPO, setDlgViewPO] = useState(false)
  const [dlgDelPO, setDlgDelPO]   = useState(false)
  const [dlgEdtPO, setDlgEdtPO]   = useState(false)

  /* selections */
  const [selSup, setSelSup] = useState<Supplier | null>(null)
  const [selPO , setSelPO ] = useState<PurchaseOrder | null>(null)

  /* ---- supplier add/edit forms ---- */
  const blankSup: Supplier = { id:"", name:"", contact:"", email:"" }
  const [supForm, setSupForm] = useState<Supplier>(blankSup)
  const [supEdit, setSupEdit] = useState<Supplier>(blankSup)

  /* ---- create-PO form ---- */
  const emptyPO: PurchaseOrder = {
    id: "", supplierId:"", supplier:"", items:"", quantity:"",
    totalAmount:"", orderDate:new Date().toISOString().slice(0,10),
    expectedDelivery:"", status:"Pending", notes:"",
  }
  const [newPO, setNewPO] = useState<PurchaseOrder>(emptyPO)

  /* ---- item lines for create-PO (array instead of long comma string) ---- */
  interface ItemLine { name:string; qty:number; unit:number; total:number }
  const [items, setItems] = useState<ItemLine[]>([])
  const addLine = (l:ItemLine)=> setItems([...items,l])
  const removeLine = (idx:number)=> setItems(items.filter((_,i)=>i!==idx))

  /* ======================================================== */
  /* load data                                                */
  /* ======================================================== */
  useEffect(() => {
    (async () => {
      try {
        const [sRes, poRes] = await Promise.all([api("/suppliers"), api("/purchase-orders")])
        const s = await sRes.json()  as Supplier[]
        const p = await poRes.json() as PurchaseOrder[]
        setSuppliers(s)
        setOrders(p)
        setFiltered(p)
      } catch {
        toast({ title:"Error", description:"Failed to load data", variant:"destructive" })
      }
    })()
  }, [toast])

  /* ======================================================== */
  /* utility                                                  */
  /* ======================================================== */
  const applyFilters = (arr=orders, term=search, st=statusFil) => {
    const q = term.toLowerCase()
    setFiltered(
      arr.filter(o =>
        (st==="all" || o.status===st) &&
        [o.id, o.supplier, o.items].some(f => (f || "").toLowerCase().includes(q))

      )
    )
  }

  /* ======================================================== */
  /* supplier CRUD                                            */
  /* ======================================================== */
  const addSupplier = async () => {
    try {
      const res = await apiJSON("/suppliers","POST",supForm)
      if(!res.ok) throw new Error()
      const created:Supplier = await res.json()
      setSuppliers([...suppliers,created])
      setSupForm(blankSup); setDlgAddSup(false)
      toast({ title:"Supplier added" })
    } catch { toast({ title:"Error", description:"Add failed", variant:"destructive" }) }
  }

  const saveSupplier = async () => {
    if(!supEdit._id) return
    try{
      const res = await apiJSON(`/suppliers/${supEdit._id}`,"PUT",supEdit)
      if(!res.ok) throw new Error()
      const upd:Supplier = await res.json()
      setSuppliers(suppliers.map(s=>s._id===upd._id?upd:s))
      setDlgEdtSup(false); toast({title:"Supplier saved"})
    }catch{ toast({title:"Error",description:"Save failed",variant:"destructive"}) }
  }

  /* ======================================================== */
  /* purchase order CRUD                                      */
  /* ======================================================== */
  const savePO = async (po:PurchaseOrder) =>{
    if(!po._id) return
    try{
      await apiJSON(`/purchase-orders/${po._id}`,"PUT",po)
      const updList = orders.map(p=>p._id===po._id?po:p)
      setOrders(updList); applyFilters(updList)
      setDlgEdtPO(false); toast({title:"Order saved"})
    }catch{ toast({title:"Error",description:"Save failed",variant:"destructive"})}
  }
  const deletePO = async ()=>{
    if(!selPO?._id) return
    try{
      await api(`/purchase-orders/${selPO._id}`,{method:"DELETE"})
      const fresh = orders.filter(p=>p._id!==selPO._id)
      setOrders(fresh); applyFilters(fresh)
      setDlgDelPO(false); toast({title:"Deleted"})
    }catch{ toast({title:"Error",description:"Delete failed",variant:"destructive"}) }
  }

  /* ======================================================== */
  /* submit create-order                                      */
  /* ======================================================== */
  const handleCreatePO = async (e:FormEvent)=>{
    e.preventDefault()
    if(!newPO.supplierId){toast({title:"Select supplier",variant:"destructive"});return}
    /* flatten items to CSV fields */
    const itemsStr = items.map(i=>i.name).join(", ")
    const qtyStr   = items.map(i=>i.qty).join(", ")
    const total = items.reduce((t,i)=>t+i.total,0)
    const poToSend = { ...newPO, items:itemsStr, quantity:qtyStr, totalAmount:`₹${total.toFixed(2)}` }
    try{
      const res = await apiJSON("/purchase-orders","POST",poToSend)
      if(!res.ok) throw new Error()
      const created:PurchaseOrder = await res.json()
      const updOrders = [...orders,created]
      setOrders(updOrders); applyFilters(updOrders)
      /* reset form */
      setNewPO(emptyPO); setItems([])
      toast({title:"Purchase order created"})
    }catch{ toast({title:"Error",description:"Create failed",variant:"destructive"}) }
  }

  /* ======================================================== */
  /* render                                                   */
  /* ======================================================== */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <Button><ShoppingCart className="mr-2 h-4 w-4"/> Create Purchase Order</Button>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="create">Create New Order</TabsTrigger>
        </TabsList>

        {/* -------------- ORDERS TAB -------------- */}
        <TabsContent value="orders">
          <div className="flex items-center gap-4 my-4">
            <Input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} className="max-w-md"/>
            <Button variant="outline" onClick={()=>applyFilters()}><Search className="h-4 w-4 mr-2"/>Search</Button>
            <Select value={statusFil} onValueChange={v=>{setStatusFil(v as any);applyFilters(orders,search,v as any)}}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Status"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["Pending","Shipped","Delivered","Cancelled"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline"><FileDown className="h-4 w-4 mr-2"/>Export</Button>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle>Purchase Orders</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>{["PO ID","Supplier","Items","Qty","Total","Order Date","Expected","Status","Actions"].map(h=><TableHead key={h}>{h}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(po=>(
                    <TableRow key={po._id}>
                      <TableCell>{po.id}</TableCell><TableCell>{po.supplier}</TableCell>
                      <TableCell>{po.items}</TableCell><TableCell>{po.quantity}</TableCell>
                      <TableCell>{po.totalAmount}</TableCell><TableCell>{po.orderDate}</TableCell>
                      <TableCell>{po.expectedDelivery}</TableCell>
                      <TableCell><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge(po.status)}`}>{po.status}</span></TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={()=>{setSelPO(po);setDlgViewPO(true)}}><Eye className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={()=>{setSelPO(po);setDlgEdtPO(true)}}><Pencil className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={()=>{setSelPO(po);setDlgDelPO(true)}}><Trash className="h-4 w-4"/></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------- SUPPLIERS TAB -------------- */}
        <TabsContent value="suppliers">
          <div className="flex items-center justify-between my-4">
            <h2 className="text-xl font-semibold">Suppliers</h2>
            <Button onClick={()=>setDlgAddSup(true)}><Plus className="mr-2 h-4 w-4"/>Add Supplier</Button>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle>Supplier List</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>{["Supplier ID","Name","Contact","Email","Actions"].map(h=><TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
                <TableBody>
                  {suppliers.map(s=>(
                    <TableRow key={s._id}>
                      <TableCell>{s.supplierId}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.contact}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={()=>{setSupEdit(s);setDlgEdtSup(true)}}><Pencil className="h-4 w-4 mr-1"/>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------- CREATE NEW ORDER TAB -------------- */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Purchase Order</CardTitle>
              <CardDescription>Fill in the details and submit to create a PO</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePO} className="space-y-6">
                {/* supplier & dates */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Select value={newPO.supplierId} onValueChange={(sid)=>{
                      const s=suppliers.find(x=>x._id===sid)
                      setNewPO({...newPO,supplierId:sid,supplier:s?.name||""})
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select supplier"/></SelectTrigger>
                      <SelectContent>
                        {suppliers.map(s=><SelectItem key={s._id} value={s._id!}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Order Date</Label>
                    <Input type="date" value={newPO.orderDate} onChange={e=>setNewPO({...newPO,orderDate:e.target.value})}/>
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Delivery</Label>
                    <Input type="date" value={newPO.expectedDelivery} onChange={e=>setNewPO({...newPO,expectedDelivery:e.target.value})}/>
                  </div>
                </div>

                {/* item line entry */}
                <div className="space-y-2">
                  <Label>Add Item</Label>
                  <div className="grid grid-cols-12 gap-2">
                    <Input placeholder="Item name" className="col-span-5" id="itm"/>
                    <Input placeholder="Qty" type="number" min={1} className="col-span-2" id="qty"/>
                    <Input placeholder="Unit price" type="number" min={0} className="col-span-3" id="unit"/>
                    <Button type="button" className="col-span-2" variant="outline" onClick={()=>{
                      const itm=(document.getElementById("itm") as HTMLInputElement).value.trim()
                      const qty=parseInt((document.getElementById("qty") as HTMLInputElement).value,10)
                      const unit=parseFloat((document.getElementById("unit") as HTMLInputElement).value)
                      if(!itm||!qty||!unit) return
                      addLine({name:itm,qty,unit,total:qty*unit})
                      ;["itm","qty","unit"].forEach(id=>(document.getElementById(id) as HTMLInputElement).value="")
                    }}><Plus className="w-4 h-4"/></Button>
                  </div>
                </div>

                {/* items table */}
                <Table>
                  <TableHeader><TableRow>{["Item","Qty","Unit ₹","Total ₹",""].map(h=><TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
                  <TableBody>
                    {items.length===0?(
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No items added</TableCell></TableRow>
                    ):items.map((l,idx)=>(
                      <TableRow key={idx}>
                        <TableCell>{l.name}</TableCell>
                        <TableCell>{l.qty}</TableCell>
                        <TableCell>{l.unit.toFixed(2)}</TableCell>
                        <TableCell>{l.total.toFixed(2)}</TableCell>
                        <TableCell><Button size="icon" variant="ghost" onClick={()=>removeLine(idx)}><Trash className="w-4 h-4"/></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* totals */}
                <div className="flex justify-end">
                  <div className="w-60 space-y-1 text-sm">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₹{items.reduce((t,i)=>t+i.total,0).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tax (18%):</span><span>₹{(items.reduce((t,i)=>t+i.total,0)*0.18).toFixed(2)}</span></div>
                    <div className="flex justify-between font-semibold"><span>Total:</span><span>₹{(items.reduce((t,i)=>t+i.total,0)*1.18).toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea rows={3} value={newPO.notes} onChange={e=>setNewPO({...newPO,notes:e.target.value})}/>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="reset" onClick={()=>{setNewPO(emptyPO);setItems([])}}>Cancel</Button>
                  <Button type="submit">Create Purchase Order</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* dialogs for suppliers and POs – already implemented above */}
      {/* ADD SUPPLIER */}
      <Dialog open={dlgAddSup} onOpenChange={setDlgAddSup}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Add Supplier</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            {(["name","contact","email"] as const).map(f=>(
              <div key={f} className="space-y-2">
                <Label className="capitalize">{f}</Label>
                <Input value={(supForm as any)[f]} onChange={e=>setSupForm({...supForm,[f]:e.target.value})}/>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDlgAddSup(false)}>Cancel</Button>
            <Button onClick={addSupplier}>Add Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT SUPPLIER */}
      <Dialog open={dlgEdtSup} onOpenChange={setDlgEdtSup}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Edit Supplier</DialogTitle></DialogHeader>
          {supEdit && (
            <div className="grid gap-4 py-4">
              {(["name","contact","email"] as const).map(f=>(
                <div key={f} className="space-y-2">
                  <Label className="capitalize">{f}</Label>
                  <Input value={(supEdit as any)[f]} onChange={e=>setSupEdit({...supEdit,[f]:e.target.value})}/>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDlgEdtSup(false)}>Cancel</Button>
            <Button onClick={saveSupplier}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW / EDIT / DELETE PO dialogs – unchanged from previous message */}
      {/* VIEW */}
      <Dialog open={dlgViewPO} onOpenChange={setDlgViewPO}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Purchase Order Details</DialogTitle></DialogHeader>
          {selPO && (
            <div className="grid grid-cols-2 gap-4 py-4">
              {Object.entries(selPO).filter(([k])=>!["_id","supplierId"].includes(k))
                .map(([k,v])=>(
                  <div key={k}>
                    <p className="text-xs text-muted-foreground capitalize">{k.replace(/([A-Z])/g," $1")}</p>
                    <p>{v as string}</p>
                  </div>
              ))}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={()=>setDlgViewPO(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT */}
      <Dialog open={dlgEdtPO} onOpenChange={setDlgEdtPO}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Edit Purchase Order</DialogTitle></DialogHeader>
          {selPO && (
            <div className="grid gap-4 py-4">
              <Label>Status</Label>
              <Select value={selPO.status} onValueChange={v=>setSelPO({...selPO,status:v as Status})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{["Pending","Shipped","Delivered","Cancelled"].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Label>Items</Label>
              <Textarea rows={3} value={selPO.items} onChange={e=>setSelPO({...selPO,items:e.target.value})}/>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDlgEdtPO(false)}>Cancel</Button>
            {selPO && <Button onClick={()=>savePO(selPO)}>Save</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <Dialog open={dlgDelPO} onOpenChange={setDlgDelPO}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Delete Purchase Order</DialogTitle></DialogHeader>
          <DialogDescription>Are you sure you want to delete this purchase order?</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDlgDelPO(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deletePO}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
