/* app/dashboard/master/static-data/page.tsx */

"use client"

import { useEffect, useState, FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit as Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API = process.env.NEXT_PUBLIC_API_BASE ||  "http://localhost:4000/api"

const api = <T,>(url: string, init?: RequestInit) =>
  fetch(`${API}${url}`, { credentials: "include", ...init }).then((r) =>
    r.ok ? (r.json() as Promise<T>) : Promise.reject(r),
  )

const apiJSON = <T,>(url: string, method: string, body: unknown) =>
  api<T>(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

interface Course     { _id?: string; id: string; name: string; code: string; duration: string; type: string }
interface Department { _id?: string; id: string; name: string; code: string; head: string }
interface Subject    { _id?: string; id: string; name: string; code: string; department: string; credits: number }
interface Staff      { _id: string; name: string }

export default function StaticDataPage() {
  const { toast } = useToast()

  const [courses,     setCourses]     = useState<Course[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [subjects,    setSubjects]    = useState<Subject[]>([])
  const [staff,       setStaff]       = useState<Staff[]>([])

  const [tab,    setTab]    = useState<"courses" | "departments" | "subjects">("courses")
  const [search, setSearch] = useState("")

  const [dlgAdd,  setDlgAdd]  = useState(false)
  const [dlgEdit, setDlgEdit] = useState(false)
  const [dlgDel,  setDlgDel]  = useState(false)

  const [addRow,  setAddRow]  = useState<any>({})
  const [editRow, setEditRow] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      api<Course[]>("/courses"),
      api<Department[]>("/departments"),
      api<Subject[]>("/subjects"),
      api<Staff[]>("/staff"),
    ])
      .then(([c, d, s, st]) => {
        setCourses(c); setDepartments(d); setSubjects(s); setStaff(st);
      })
      .catch(() =>
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" }),
      )
  }, [toast])

  const buckets = { courses, departments, subjects } as const
  const rows = buckets[tab]

  const filtered = rows.filter((row) =>
    Object.values(row).some((v) =>
      (v ?? "")
        .toString()
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  )

  const refresh = (t = tab) => {
    const setters = { courses: setCourses, departments: setDepartments, subjects: setSubjects } as const
    api<any[]>(`/${t}`)
      .then((d) => setters[t](d))
      .catch(() => toast({ title: "Error", description: `Could not refresh ${t}`, variant: "destructive" }))
  }

  const columns = {
    courses:     ["id", "name", "code", "duration", "type"],
    departments: ["id", "name", "code", "head"],
    subjects:    ["id", "name", "code", "department", "credits"],
  } as const

  const headers = {
    courses:     ["Course ID", "Name", "Code", "Duration", "Type"],
    departments: ["Dept ID", "Name", "Code", "Head"],
    subjects:    ["Subject ID", "Name", "Code", "Department", "Credits"],
  }[tab]

  const addItem = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await apiJSON(`/${tab}`, "POST", addRow)
      toast({ title: `${tab.slice(0, -1)} added` })
      refresh()
      setDlgAdd(false)
      setAddRow({})
    } catch {
      toast({ title: "Error", description: "Create failed", variant: "destructive" })
    }
  }

  const saveEdit = async () => {
    if (!editRow?._id) return
    const { _id, id, createdAt, updatedAt, __v, ...body } = editRow
    try {
      await apiJSON(`/${tab}/${_id}`, "PUT", body)
      toast({ title: "Saved" })
      refresh()
      setDlgEdit(false)
    } catch {
      toast({ title: "Error", description: "Update failed", variant: "destructive" })
    }
  }

  const deleteItem = async () => {
    if (!editRow?._id) return
    try {
      await api(`/${tab}/${editRow._id}`, { method: "DELETE" })
      toast({ title: "Deleted" })
      refresh()
      setDlgDel(false)
    } catch {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Static Data Management</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>

        <div className="flex items-center justify-between my-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder={`Search ${tab}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80"
            />
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          <Button onClick={() => { setAddRow({}); setDlgAdd(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Add {tab.slice(0, -1)}
          </Button>
        </div>

        <TabsContent value={tab}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{tab[0].toUpperCase() + tab.slice(1)}</CardTitle>
              <CardDescription>{`Manage all ${tab}`}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row._id}>
                      {columns[tab].map((field) => (
                        <TableCell key={field}>{(row as any)[field]}</TableCell>
                      ))}
                      <TableCell className="whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => { setEditRow(row); setDlgEdit(true) }}>
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => { setEditRow(row); setDlgDel(true) }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dlgAdd} onOpenChange={setDlgAdd}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Add {tab.slice(0, -1)}</DialogTitle></DialogHeader>
          <form onSubmit={addItem} className="grid gap-4 py-4">
            {tab === "departments" ? (
              <>
                <Label>Name</Label>
                <Input required value={addRow.name || ""} onChange={e => setAddRow({ ...addRow, name: e.target.value })} />
                <Label>Code</Label>
                <Input required value={addRow.code || ""} onChange={e => setAddRow({ ...addRow, code: e.target.value })} />
                <Label>Head</Label>
                <Select required value={addRow.head || ""} onValueChange={v => setAddRow({ ...addRow, head: v })}>
                  <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>
                    {staff.map(st => (
                      <SelectItem key={st._id} value={st.name}>{st.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              columns[tab].filter(f => f !== "id").map((field) => (
                <div key={field}>
                  <Label className="capitalize">{field}</Label>
                  <Input
                    required
                    type={field === "credits" ? "number" : "text"}
                    value={(addRow as any)[field] ?? ""}
                    onChange={(e) =>
                      setAddRow({
                        ...addRow,
                        [field]: field === "credits" ? +e.target.value : e.target.value,
                      })
                    }
                  />
                </div>
              ))
            )}
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setDlgAdd(false)}>Cancel</Button>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dlgEdit} onOpenChange={setDlgEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Edit {tab.slice(0, -1)}</DialogTitle></DialogHeader>
          {editRow && (
            <div className="grid gap-4 py-4">
              {tab === "departments" ? (
                <>
                  <Label>Dept ID</Label>
                  <Input readOnly value={editRow.id} />
                  <Label>Name</Label>
                  <Input value={editRow.name} onChange={e => setEditRow({ ...editRow, name: e.target.value })} />
                  <Label>Code</Label>
                  <Input value={editRow.code} onChange={e => setEditRow({ ...editRow, code: e.target.value })} />
                  <Label>Head</Label>
                  <Select value={editRow.head} onValueChange={v => setEditRow({ ...editRow, head: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {staff.map(st => (
                        <SelectItem key={st._id} value={st.name}>{st.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                columns[tab].map((field) => (
                  <div key={field}>
                    <Label className="capitalize">{field}</Label>
                    <Input
                      readOnly={field === "id"}
                      type={field === "credits" ? "number" : "text"}
                      value={(editRow as any)[field] ?? ""}
                      onChange={(e) =>
                        setEditRow({
                          ...editRow,
                          [field]: field === "credits" ? +e.target.value : e.target.value,
                        })
                      }
                    />
                  </div>
                ))
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlgEdit(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dlgDel} onOpenChange={setDlgDel}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete {tab.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <DialogDescription>This action cannot be undone.</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlgDel(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteItem}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
