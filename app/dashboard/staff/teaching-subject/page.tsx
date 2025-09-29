"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
} from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Search, Eye, Plus, BookOpen, Pencil, Trash } from "lucide-react";

/* ───────── small API helper ───────── */
const API  = process.env.NEXT_PUBLIC_API_BASE ||  "http://localhost:4000/api";
const api  = (p: string, o: RequestInit = {}) =>
  fetch(`${API}${p}`, { headers:{ "Content-Type":"application/json" }, ...o })
    .then(r => (r.ok ? r.json() : Promise.reject(r.statusText)));

export default function TeachingSubjectPage() {
  /* ---------- teaching-subject list ---------- */
  const [all,  setAll ] = useState<any[]>([]);
  const [list, setList] = useState<any[]>([]);
  const loadAlloc = useCallback(async () => {
    const data = await api("/teaching-subjects");
    setAll(data);
    setList(data);
  }, []);

  useEffect(() => { loadAlloc(); }, [loadAlloc]);

  /* ---------- staff list + map ---------- */
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffMap,  setStaffMap ] = useState<Record<string, any>>({});
  useEffect(() => {
    api("/staff").then((data) => {
      setStaffList(data);
      setStaffMap(Object.fromEntries(data.map((s:any) => [s.id, s])));
    });
  }, []);

  /* ---------- search ---------- */
  const [searchTerm, setSearch] = useState("");
  const handleSearch = () => {
    const q = searchTerm.toLowerCase();
    setList(
      all.filter(i =>
        i.staffName.toLowerCase().includes(q)   ||
        i.staffId.toLowerCase().includes(q)     ||
        i.subject.toLowerCase().includes(q)     ||
        i.department.toLowerCase().includes(q)  ||
        i.course.toLowerCase().includes(q)
      )
    );
  };

  /* ---------- dialog + form state ---------- */
  const blank = {
    staffId:"", staffName:"", department:"",
    subject:"", course:"", batch:"", semester:"",
  };
  const [form,      setForm]      = useState(blank);
  const [staffOpts, setStaffOpts] = useState<any[]>([]);
  const [dlgNew, setDlgNew] = useState(false);
  const [dlgEdit,setDlgEdit]= useState(false);
  const [dlgView,setDlgView]= useState(false);
  const [dlgDel, setDlgDel] = useState(false);
  const [current,setCurrent]= useState<any>(null);

  /* fetch staff dropdown only when needed */
  useEffect(() => {
    if ((dlgNew || dlgEdit) && !staffOpts.length) {
      api("/staff").then(setStaffOpts);
    }
  }, [dlgNew, dlgEdit, staffOpts.length]);

  /* ---------- CRUD ---------- */
  const saveNew = async () => {
    await api("/teaching-subjects", { method:"POST", body:JSON.stringify(form) });
    loadAlloc(); setForm(blank); setDlgNew(false);
  };
  const saveEdit = async () => {
    await api(`/teaching-subjects/${current._id}`, { method:"PUT", body:JSON.stringify(form) });
    loadAlloc(); setDlgEdit(false);
  };
  const confirmDel = async () => {
    await api(`/teaching-subjects/${current._id}`, { method:"DELETE" });
    loadAlloc(); setDlgDel(false);
  };

  /* ---------- UI ---------- */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Teaching Subject Allocation</h1>

        {/* New Allocation Dialog */}
        <Dialog open={dlgNew} onOpenChange={setDlgNew}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Assign New Subject</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>Assign New Subject</DialogTitle></DialogHeader>

            <div className="grid gap-3 py-4">
              <Label>Staff</Label>
              <Select
                value={form.staffId}
                onValueChange={(v) => {
                  const s = staffOpts.find((x:any) => x.id === v);
                  if (s) setForm({ ...form, staffId:s.id, staffName:s.name, department:s.department });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>
                  {staffOpts.map((s:any) => (
                    <SelectItem key={s._id} value={s.id}>{s.id} — {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {["subject","course","batch","semester"].map((f) => (
                <Input key={f} placeholder={f} value={(form as any)[f] || ""}
                       onChange={(e)=>setForm({ ...form, [f]: e.target.value })}/>
              ))}
            </div>

            <DialogFooter><Button onClick={saveNew}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>Search allocations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md">
            <Input placeholder="Search…" value={searchTerm} onChange={e=>setSearch(e.target.value)} />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4"/>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 flex justify-between">
          <div><p className="text-sm text-muted-foreground">Total Allocations</p>
          <h3 className="text-2xl font-bold">{all.length}</h3></div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary"/>
          </div></CardContent></Card>

        <Card><CardContent className="pt-6 flex justify-between">
          <div><p className="text-sm text-muted-foreground">Active Teachers</p>
          <h3 className="text-2xl font-bold">
            {staffList.filter(s => s.status === "Active").length}
          </h3></div>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-green-600"/>
          </div></CardContent></Card>

        <Card><CardContent className="pt-6 flex justify-between">
          <div><p className="text-sm text-muted-foreground">Subjects Covered</p>
          <h3 className="text-2xl font-bold">{new Set(all.map(r=>r.subject)).size}</h3></div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-blue-600"/>
          </div></CardContent></Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle>Allocations</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>{["Alloc ID","Staff","Dept","Subject","Course","Batch","Sem","Status","Actions"]
                .map(h=><TableHead key={h}>{h}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {list.map(r => {
                const staffStatus = staffMap[r.staffId]?.status ?? "Active";
                const badgeClass =
                  staffStatus === "Active"
                    ? "bg-green-100 text-green-800"
                    : staffStatus === "On Leave"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800";  // Former

                return (
                  <TableRow key={r._id}>
                    <TableCell>{r.allocId}</TableCell>
                    <TableCell>{r.staffName}
                      <br/><span className="text-xs text-muted-foreground">{r.staffId}</span></TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>{r.subject}</TableCell>
                    <TableCell>{r.course}</TableCell>
                    <TableCell>{r.batch}</TableCell>
                    <TableCell>{r.semester}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                        {staffStatus}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button size="icon" variant="ghost"
                              onClick={()=>{setCurrent(r);setDlgView(true);}}>
                        <Eye className="w-4 h-4"/></Button>
                      <Button size="icon" variant="ghost"
                              onClick={()=>{setCurrent(r);setForm(r);setDlgEdit(true);}}>
                        <Pencil className="w-4 h-4"/></Button>
                      <Button size="icon" variant="ghost" className="text-red-600"
                              onClick={()=>{setCurrent(r);setDlgDel(true);}}>
                        <Trash className="w-4 h-4"/></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={dlgView} onOpenChange={setDlgView}>
        <DialogContent>
          <DialogHeader><DialogTitle>Allocation Details</DialogTitle></DialogHeader>
          {current && (
            <Table className="w-full">
              <TableBody>
                {Object.entries(current)
                  .filter(([k]) => !["__v","_id"].includes(k))
                  .map(([k,v]) => (
                    <TableRow key={k}>
                      <TableCell className="font-medium w-40 capitalize">
                        {k.replace(/([A-Z])/g," $1")}
                      </TableCell>
                      <TableCell>{String(v)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={dlgEdit} onOpenChange={setDlgEdit}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Edit Allocation</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-4">
            {["subject","course","batch","semester"].map(f=>(
              <Input key={f} placeholder={f} value={(form as any)[f]||""}
                     onChange={e=>setForm({...form,[f]:e.target.value})}/>
            ))}
          </div>
          <DialogFooter><Button onClick={saveEdit}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={dlgDel} onOpenChange={setDlgDel}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Delete Allocation</DialogTitle></DialogHeader>
          <p>Are you sure you want to delete <span className="font-semibold">{current?.allocId}</span>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDlgDel(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDel}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
