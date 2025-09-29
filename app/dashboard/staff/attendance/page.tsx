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
import { Calendar, Check, FileDown, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = process.env.NEXT_PUBLIC_API_BASE ||  "http://localhost:4000/api";

/* tiny fetch helper ---------------------------------------------------- */
const api = (p: string, o: RequestInit = {}) =>
  fetch(`${API}${p}`, { headers: { "Content-Type": "application/json" }, ...o })
    .then(r => (r.ok ? r.json() : Promise.reject(r.statusText)));

/* PDF helper ----------------------------------------------------------- */
const exportPDF = (rows: any[], selectedDate: string) => {
  if (!rows.length) return;
  const doc = new jsPDF("landscape");
  doc.setFontSize(18).text(`Attendance – ${selectedDate}`, 14, 20);

  autoTable(doc, {
    head: [["ID", "Name", "Dept", "In", "Out", "Status"]],
    body: rows.map(r => [
      r.staffId, r.name, r.department,
      r.checkIn || "-", r.checkOut || "-", r.status,
    ]),
    startY: 30,
    styles: { fontSize: 8 },
  });

  doc.save(`attendance-${selectedDate}.pdf`);
};

/* ===================================================================== */
export default function StaffAttendancePage() {
  const { toast } = useToast();

  /* ---------------- state ---------------- */
  const [date, setDate]       = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("all");
  const [rows, setRows]       = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- data fetch ---------------- */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = `?date=${date}&search=${encodeURIComponent(search)}&status=${status}`;
      setRows(await api(`/attendance${qs}`));
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [date, search, status, toast]);

  /* mark present quick-patch */
  const markPresent = async (id: string) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    await api(`/attendance/${id}/mark-present`, {
      method: "PATCH",
      body: JSON.stringify({ checkIn: now }),
    });
    load();
  };

  /* initial + param-change load */
  useEffect(() => { load(); }, [load]);

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Staff Attendance</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> Mark Attendance
          </Button>
          <Button onClick={() => exportPDF(rows, date)}>
            <FileDown className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* filter card */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>Search &amp; drill down</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Search</Label>
            <div className="flex gap-2">
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="name, ID, dept…" />
              <Button variant="outline" onClick={load}><Search className="h-4 w-4" /></Button>
            </div>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                {["all", "Present", "Absent", "Late"].map(s => (
                  <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* table card */}
      <Card>
        <CardHeader><CardTitle>Attendance for {date}</CardTitle></CardHeader>
        <CardContent>
          {loading ? "Loading…" : (
            <Table>
              <TableHeader>
                <TableRow>
                  {["ID", "Name", "Dept", "Date", "In", "Out", "Status", "Actions"].map(h => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r._id}>
                    <TableCell>{r.staffId}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>{r.date?.slice(0, 10)}</TableCell>
                    <TableCell>{r.checkIn || "-"}</TableCell>
                    <TableCell>{r.checkOut || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === "Present" ? "bg-green-100 text-green-700"
                      : r.status === "Absent" ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-800"}`}>
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {r.status === "Absent" && (
                        <Button variant="ghost" size="sm" className="text-green-600"
                          onClick={() => markPresent(r._id)}
                        >
                          <Check className="h-4 w-4 mr-1" /> Mark Present
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
