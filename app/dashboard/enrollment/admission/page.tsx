"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileDown, Filter, Eye, Download, UserPlus, Edit, Trash, CheckCircle, RefreshCcw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { API_BASE_URL } from "@/lib/config"

const courseOptions = [
  " play ground",
  "Nursery",
  "Sujunior",
  "Susenior",
]

const batchOptions = ["2023-24", "2024-25", "2025-26"]

const seedAdmissions = () =>
  Array.from({ length: 100 }).map((_, index) => {
    const program = courseOptions[index % courseOptions.length]
    const id = `SEED-ADM-${(index + 1).toString().padStart(3, "0")}`
    const studentId = `SEED-STU-${(index + 1).toString().padStart(3, "0")}`
    const date = `2025-01-${((index % 28) + 1).toString().padStart(2, "0")}`
    const statusCycle = ["Pending", "Approved", "Rejected"]
    const feeCycle = ["Pending", "Paid", "Partially Paid"]

    return {
      admissionId: id,
      id,
      studentId,
      name: `Seed Student ${index + 1}`,
      phone: `99999${(10000 + index).toString().slice(-5)}`,
      email: `seed${index + 1}@example.com`,
      course: program,
      program,
      batch: batchOptions[index % batchOptions.length],
      date,
      status: statusCycle[index % statusCycle.length],
      feeStatus: feeCycle[index % feeCycle.length],
      documents: [],
      notes: "Sample seeded admission",
    }
  })

const requiredDocuments = [
  "ID Proof",
  "Address Proof",
  "Previous Marksheet",
  "Transfer Certificate",
  "Character Certificate",
  "Photographs",
  "Medical Certificate",
]

export default function AdmissionPage() {
  const { toast } = useToast()
  const [admissionData, setAdmissionData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null)
  const [newAdmission, setNewAdmission] = useState({
    academicYear: "",
    admissionDate: "",
    name: "",
    dob: "",
    gender: "",
    program: "",
    nationality: "",
    admissionType: "",
    uniformRequired: "yes",
    discountApplicable: "no",
    phone: "",
    email: "",
    course: "",
    batch: "",
    notes: "",
    documents: [] as string[],
    fatherName: "",
    motherName: "",
    fatherMobile: "",
    motherMobile: "",
    fatherOccupation: "",
    motherOccupation: "",
    fatherEmail: "",
    motherEmail: "",
    fatherOrg: "",
    motherOrg: "",
    address: "",
    postalCode: "",
    city: "",
    state: "",
    country: "",
    transportRequired: "no",
    previousSchooling: "no",
    kinAttended: "no",
    siblings: "no",
  })
  const [activeTab, setActiveTab] = useState("all")

  const fetchAdmissions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admissions`, { credentials: "include" })
      const apiData = res.ok ? await res.json() : []
      const combined = [...apiData, ...seedAdmissions()]
      setAdmissionData(combined)
      setFilteredData(combined)
    } catch (err) {
      console.error("Failed to fetch admissions", err)
      const fallback = seedAdmissions()
      setAdmissionData(fallback)
      setFilteredData(fallback)
    }
  }

  useEffect(() => {
    fetchAdmissions()
  }, [])

  const handleSearch = () => {
    const filtered = admissionData.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    setFilteredData(filtered)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "all") setFilteredData(admissionData)
    else setFilteredData(admissionData.filter((item) => item.status.toLowerCase() === value.toLowerCase()))
  }

  const handleAddAdmission = async () => {
    try {
      const newId = `ADM${Math.floor(1000 + Math.random() * 9000)}`
      const studentId = `STU${Math.floor(1000 + Math.random() * 9000)}`
      const date = new Date().toISOString().split("T")[0]
      const body = {
        ...newAdmission,
        id: newId,
        studentId,
        date,
        status: "Pending",
        feeStatus: "Pending",
        course: newAdmission.program || newAdmission.course,
      }

      await fetch(`${API_BASE_URL}/api/admissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      })

      toast({ title: "Admission Added", description: `Created admission for ${newAdmission.name}` })
      setIsAddDialogOpen(false)
      handleResetForm()
      fetchAdmissions()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditAdmission = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admissions/${selectedAdmission._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedAdmission),
        credentials: "include",
      })

      toast({ title: "Admission Updated", description: `Updated ${selectedAdmission.name}` })
      setIsEditDialogOpen(false)
      fetchAdmissions()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAdmission = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admissions/${selectedAdmission._id}`, {
        method: "DELETE",
        credentials: "include",
      })

      toast({ title: "Admission Deleted", description: `${selectedAdmission.name} was deleted.` })
      setIsDeleteDialogOpen(false)
      fetchAdmissions()
    } catch (err) {
      console.error(err)
    }
  }

  const handleApproveAdmission = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admissions/${selectedAdmission._id}/approve`, {
        method: "POST",
        credentials: "include",
      })

      toast({ title: "Admission Approved", description: `Approved ${selectedAdmission.name}` })
      setIsApproveDialogOpen(false)
      fetchAdmissions()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDocumentUpload = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admissions/${selectedAdmission._id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: selectedAdmission.documents }),
        credentials: "include",
      })

      toast({ title: "Documents Updated", description: `Updated documents for ${selectedAdmission.name}` })
      setIsDocumentsDialogOpen(false)
      fetchAdmissions()
    } catch (err) {
      console.error(err)
    }
  }

  const toggleDocument = (document: string) => {
    if (!selectedAdmission) return
    const docs = [...selectedAdmission.documents]
    const exists = docs.includes(document)
    if (exists) docs.splice(docs.indexOf(document), 1)
    else docs.push(document)
    setSelectedAdmission({ ...selectedAdmission, documents: docs })
  }

  const toggleNewDocument = (document: string) => {
    const docs = [...newAdmission.documents]
    const exists = docs.includes(document)
    if (exists) docs.splice(docs.indexOf(document), 1)
    else docs.push(document)
    setNewAdmission({ ...newAdmission, documents: docs })
  }

  const handleResetForm = () => {
    setNewAdmission({
      academicYear: "",
      admissionDate: "",
      name: "",
      dob: "",
      gender: "",
      program: "",
      nationality: "",
      admissionType: "",
      uniformRequired: "yes",
      discountApplicable: "no",
      phone: "",
      email: "",
      course: "",
      batch: "",
      notes: "",
      documents: [],
      fatherName: "",
      motherName: "",
      fatherMobile: "",
      motherMobile: "",
      fatherOccupation: "",
      motherOccupation: "",
      fatherEmail: "",
      motherEmail: "",
      fatherOrg: "",
      motherOrg: "",
      address: "",
      postalCode: "",
      city: "",
      state: "",
      country: "",
      transportRequired: "no",
      previousSchooling: "no",
      kinAttended: "no",
      siblings: "no",
    })
  }

  const summaryByProgram = admissionData.reduce<Record<string, number>>((acc, item) => {
    const key = (item.program || item.course || "Other").toString()
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create Admission</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Quick Add
            </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(summaryByProgram).map(([program, count]) => (
          <Card key={program} className="border-emerald-100 bg-emerald-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{program}</CardTitle>
              <CardDescription className="text-sm">Total Enquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold">{count}</div>
                <div className="h-2 w-20 bg-emerald-100 rounded-full">
                  <div className="h-2 bg-emerald-500 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="create" className="space-y-4" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="create">Create Admission</TabsTrigger>
          <TabsTrigger value="all">Admission List</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Admission Form</CardTitle>
              <CardDescription>Redesigned to match the reference layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border bg-emerald-50 border-emerald-100 p-4">
                <h3 className="text-lg font-semibold text-emerald-800 mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Academic Year *</Label>
                    <Select onValueChange={(v) => setNewAdmission({ ...newAdmission, academicYear: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Academic Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apr25-Mar26">Apr 25 - Mar 26</SelectItem>
                        <SelectItem value="Apr24-Mar25">Apr 24 - Mar 25</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Admission Date *</Label>
                  <Input
                      type="month"
                      value={newAdmission.admissionDate}
                      onChange={(e) => setNewAdmission({ ...newAdmission, admissionDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Student Name *</Label>
                    <Input
                      placeholder="To be printed on the certificate"
                    value={newAdmission.name}
                    onChange={(e) => setNewAdmission({ ...newAdmission, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                  <Input
                      type="date"
                      value={newAdmission.dob}
                      onChange={(e) => setNewAdmission({ ...newAdmission, dob: e.target.value })}
                  />
                </div>
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <RadioGroup
                      className="flex flex-wrap gap-4"
                      value={newAdmission.gender}
                      onValueChange={(v) => setNewAdmission({ ...newAdmission, gender: v })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Boy</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Girl</Label>
                      </div>
                    </RadioGroup>
              </div>
              <div className="space-y-2">
                    <Label>Program Name *</Label>
                    <Select onValueChange={(v) => setNewAdmission({ ...newAdmission, program: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Play group">Play group</SelectItem>
                        <SelectItem value="Nursery">Nursery</SelectItem>
                        <SelectItem value="Euro Junior">Euro Junior</SelectItem>
                        <SelectItem value="Euro Senior">Euro Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nationality</Label>
                <Input
                      placeholder="Enter Nationality"
                      value={newAdmission.nationality}
                      onChange={(e) => setNewAdmission({ ...newAdmission, nationality: e.target.value })}
                />
              </div>
                <div className="space-y-2">
                    <Label>Admission Type *</Label>
                    <Select onValueChange={(v) => setNewAdmission({ ...newAdmission, admissionType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <Label>Is Uniform Required *</Label>
                    <RadioGroup
                      className="flex gap-4"
                      value={newAdmission.uniformRequired}
                      onValueChange={(v) => setNewAdmission({ ...newAdmission, uniformRequired: v })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="uniform-yes" />
                        <Label htmlFor="uniform-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="uniform-no" />
                        <Label htmlFor="uniform-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Applicable *</Label>
                    <RadioGroup
                      className="flex gap-4"
                      value={newAdmission.discountApplicable}
                      onValueChange={(v) => setNewAdmission({ ...newAdmission, discountApplicable: v })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="discount-yes" />
                        <Label htmlFor="discount-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="discount-no" />
                        <Label htmlFor="discount-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="rounded-md border bg-emerald-50 border-emerald-100 p-4">
                <h3 className="text-lg font-semibold text-emerald-800 mb-4">Parent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Father Name"
                    value={newAdmission.fatherName}
                    onChange={(e) => setNewAdmission({ ...newAdmission, fatherName: e.target.value })}
                  />
                  <Input
                    placeholder="Mother Name"
                    value={newAdmission.motherName}
                    onChange={(e) => setNewAdmission({ ...newAdmission, motherName: e.target.value })}
                  />
                  <Input
                    placeholder="Father Mobile"
                    value={newAdmission.fatherMobile}
                    onChange={(e) => setNewAdmission({ ...newAdmission, fatherMobile: e.target.value })}
                  />
                  <Input
                    placeholder="Mother Mobile"
                    value={newAdmission.motherMobile}
                    onChange={(e) => setNewAdmission({ ...newAdmission, motherMobile: e.target.value })}
                  />
                  <Input
                    placeholder="Father Occupation"
                    value={newAdmission.fatherOccupation}
                    onChange={(e) => setNewAdmission({ ...newAdmission, fatherOccupation: e.target.value })}
                  />
                  <Input
                    placeholder="Mother Occupation"
                    value={newAdmission.motherOccupation}
                    onChange={(e) => setNewAdmission({ ...newAdmission, motherOccupation: e.target.value })}
                  />
                  <Input
                    placeholder="Father Email"
                    value={newAdmission.fatherEmail}
                    onChange={(e) => setNewAdmission({ ...newAdmission, fatherEmail: e.target.value })}
                  />
                  <Input
                    placeholder="Mother Email"
                    value={newAdmission.motherEmail}
                    onChange={(e) => setNewAdmission({ ...newAdmission, motherEmail: e.target.value })}
                  />
                  <Input
                    placeholder="Father Organisation Name"
                    value={newAdmission.fatherOrg}
                    onChange={(e) => setNewAdmission({ ...newAdmission, fatherOrg: e.target.value })}
                  />
                  <Input
                    placeholder="Mother Organisation Name"
                    value={newAdmission.motherOrg}
                    onChange={(e) => setNewAdmission({ ...newAdmission, motherOrg: e.target.value })}
                  />
                </div>
              </div>

              <div className="rounded-md border bg-emerald-50 border-emerald-100 p-4">
                <h3 className="text-lg font-semibold text-emerald-800 mb-4">Address & Batch</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Address *"
                    value={newAdmission.address}
                    onChange={(e) => setNewAdmission({ ...newAdmission, address: e.target.value })}
                  />
                  <Input
                    placeholder="Postal Code *"
                    value={newAdmission.postalCode}
                    onChange={(e) => setNewAdmission({ ...newAdmission, postalCode: e.target.value })}
                  />
                  <Input
                    placeholder="City *"
                    value={newAdmission.city}
                    onChange={(e) => setNewAdmission({ ...newAdmission, city: e.target.value })}
                  />
                  <Input
                    placeholder="State *"
                    value={newAdmission.state}
                    onChange={(e) => setNewAdmission({ ...newAdmission, state: e.target.value })}
                  />
                  <Input
                    placeholder="Country *"
                    value={newAdmission.country}
                    onChange={(e) => setNewAdmission({ ...newAdmission, country: e.target.value })}
                  />
                  <Select onValueChange={(v) => setNewAdmission({ ...newAdmission, batch: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batchOptions.map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          {batch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label>Transport Required?</Label>
                    <RadioGroup
                      className="flex gap-4"
                      value={newAdmission.transportRequired}
                      onValueChange={(v) => setNewAdmission({ ...newAdmission, transportRequired: v })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="transport-yes" />
                        <Label htmlFor="transport-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="transport-no" />
                        <Label htmlFor="transport-no">No</Label>
                      </div>
                    </RadioGroup>
              </div>
                  <div className="space-y-2">
                    <Label>Previous Schooling?</Label>
                    <RadioGroup
                      className="flex gap-4"
                      value={newAdmission.previousSchooling}
                      onValueChange={(v) => setNewAdmission({ ...newAdmission, previousSchooling: v })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="prev-yes" />
                        <Label htmlFor="prev-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="prev-no" />
                        <Label htmlFor="prev-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Has kin attended EuroKids before?</Label>
                    <RadioGroup
                      className="flex gap-4"
                      value={newAdmission.kinAttended}
                      onValueChange={(v) => setNewAdmission({ ...newAdmission, kinAttended: v })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="kin-yes" />
                        <Label htmlFor="kin-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="kin-no" />
                        <Label htmlFor="kin-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Does the child have siblings?</Label>
                    <RadioGroup
                      className="flex gap-4"
                      value={newAdmission.siblings}
                      onValueChange={(v) => setNewAdmission({ ...newAdmission, siblings: v })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="sib-yes" />
                        <Label htmlFor="sib-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="sib-no" />
                        <Label htmlFor="sib-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Documents</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {requiredDocuments.map((document) => (
                    <div key={document} className="flex items-center space-x-2">
                      <Checkbox
                        id={`document-${document}`}
                        checked={newAdmission.documents.includes(document)}
                        onCheckedChange={() => toggleNewDocument(document)}
                      />
                      <Label htmlFor={`document-${document}`}>{document}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newAdmission.notes}
                  onChange={(e) => setNewAdmission({ ...newAdmission, notes: e.target.value })}
                  placeholder="Enter any additional information"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAddAdmission}>Confirm</Button>
                <Button variant="secondary" onClick={handleResetForm}>
                  <RefreshCcw className="h-4 w-4 mr-2" /> Reload
              </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Back
                </Button>
      </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {activeTab === "all"
                  ? "All Admissions"
                  : activeTab === "pending"
                    ? "Pending Admissions"
                    : activeTab === "approved"
                      ? "Approved Admissions"
                      : "Rejected Admissions"}
              </CardTitle>
              <CardDescription>Manage all student admissions from this panel</CardDescription>
            </CardHeader>
            <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 flex items-center gap-2">
            <Input
              placeholder="Search by name, ID, phone, email or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead> UID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((admission) => (
                  <TableRow key={`${admission.studentId}-${admission.admissionId}`}>
                <TableCell>{admission.admissionId}</TableCell>
                      <TableCell>{admission.studentId}</TableCell>
                      <TableCell>{admission.name}</TableCell>
                      <TableCell>{admission.phone}</TableCell>
                      <TableCell>{admission.email}</TableCell>
                      <TableCell>{admission.course}</TableCell>
                      <TableCell>{admission.batch}</TableCell>
                      <TableCell>{admission.date}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            admission.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : admission.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {admission.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAdmission(admission)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAdmission(admission)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAdmission(admission)
                              setIsDocumentsDialogOpen(true)
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {admission.status === "Pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedAdmission(admission)
                                setIsApproveDialogOpen(true)
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAdmission(admission)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Admission Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Admission Details</DialogTitle>
            <DialogDescription>Detailed information about the admission.</DialogDescription>
          </DialogHeader>
          {selectedAdmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Admission ID</h3>
                  <p>{selectedAdmission.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Student ID</h3>
                  <p>{selectedAdmission.studentId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p>{selectedAdmission.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p>{selectedAdmission.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>{selectedAdmission.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Course</h3>
                  <p>{selectedAdmission.course}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Batch</h3>
                  <p>{selectedAdmission.batch}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p>{selectedAdmission.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedAdmission.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedAdmission.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedAdmission.status}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fee Status</h3>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedAdmission.feeStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : selectedAdmission.feeStatus === "Partially Paid"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedAdmission.feeStatus === "Refunded"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedAdmission.feeStatus}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Documents Submitted</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedAdmission.documents.map((doc: string) => (
                    <span
                      key={doc}
                      className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="text-sm">{selectedAdmission.notes}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedAdmission && selectedAdmission.status === "Pending" && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false)
                  setIsApproveDialogOpen(true)
                }}
              >
                Approve Admission
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admission Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Admission</DialogTitle>
            <DialogDescription>Update the admission details. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {selectedAdmission && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedAdmission.name}
                    onChange={(e) => setSelectedAdmission({ ...selectedAdmission, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={selectedAdmission.phone}
                    onChange={(e) => setSelectedAdmission({ ...selectedAdmission, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedAdmission.email}
                  onChange={(e) => setSelectedAdmission({ ...selectedAdmission, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-course">Course</Label>
                  <Select
                    defaultValue={selectedAdmission.course}
                    onValueChange={(value) => setSelectedAdmission({ ...selectedAdmission, course: value })}
                  >
                    <SelectTrigger id="edit-course">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseOptions.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-batch">Batch</Label>
                  <Select
                    defaultValue={selectedAdmission.batch}
                    onValueChange={(value) => setSelectedAdmission({ ...selectedAdmission, batch: value })}
                  >
                    <SelectTrigger id="edit-batch">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batchOptions.map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          {batch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Admission Status</Label>
                  <Select
                    defaultValue={selectedAdmission.status}
                    onValueChange={(value) => setSelectedAdmission({ ...selectedAdmission, status: value })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fee-status">Fee Status</Label>
                  <Select
                    defaultValue={selectedAdmission.feeStatus}
                    onValueChange={(value) => setSelectedAdmission({ ...selectedAdmission, feeStatus: value })}
                  >
                    <SelectTrigger id="edit-fee-status">
                      <SelectValue placeholder="Select fee status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Additional Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={selectedAdmission.notes}
                  onChange={(e) => setSelectedAdmission({ ...selectedAdmission, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAdmission}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this admission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmission}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Documents</DialogTitle>
            <DialogDescription>Update the documents submitted for this admission.</DialogDescription>
          </DialogHeader>
          {selectedAdmission && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Required Documents</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {requiredDocuments.map((document) => (
                    <div key={document} className="flex items-center space-x-2">
                      <Checkbox
                        id={`doc-${document}`}
                        checked={selectedAdmission.documents.includes(document)}
                        onCheckedChange={() => toggleDocument(document)}
                      />
                      <Label htmlFor={`doc-${document}`}>{document}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-notes">Document Notes</Label>
                <Textarea
                  id="doc-notes"
                  value={selectedAdmission.notes}
                  onChange={(e) => setSelectedAdmission({ ...selectedAdmission, notes: e.target.value })}
                  placeholder="Enter any notes about the documents"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDocumentsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDocumentUpload}>Save Documents</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Admission</DialogTitle>
            <DialogDescription>Confirm approval of this admission application.</DialogDescription>
          </DialogHeader>
          {selectedAdmission && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-sm font-medium">Student Information</h3>
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {selectedAdmission.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Course:</span> {selectedAdmission.course}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Batch:</span> {selectedAdmission.batch}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Document Verification</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {requiredDocuments.map((document) => (
                    <div key={document} className="flex items-center space-x-2">
                      <Checkbox
                        id={`verify-${document}`}
                        checked={selectedAdmission.documents.includes(document)}
                        disabled={!selectedAdmission.documents.includes(document)}
                      />
                      <Label
                        htmlFor={`verify-${document}`}
                        className={!selectedAdmission.documents.includes(document) ? "text-gray-400" : ""}
                      >
                        {document} {!selectedAdmission.documents.includes(document) && <span>(Not Submitted)</span>}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approval-notes">Approval Notes</Label>
                <Textarea
                  id="approval-notes"
                  value={selectedAdmission.notes}
                  onChange={(e) => setSelectedAdmission({ ...selectedAdmission, notes: e.target.value })}
                  placeholder="Enter any notes for approval"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveAdmission}>Approve Admission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
