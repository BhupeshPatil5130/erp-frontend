"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { API_BASE_URL } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  BookOpen,
  DollarSign,
  FileText,
  CreditCard,
  Receipt,
  AlertCircle,
  Building,
  UserCheck,
  BookOpenCheck,
  Briefcase,
  GraduationCap,
  Bus,
  Home,
  BarChart3,
  Smartphone,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"


export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentDate] = useState(
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  )
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [enquiryCount, setEnquiryCount] = useState(0)
  const [userName, setUserName] = useState<string>("")
  const [lsqEnquiryCount, setLsqEnquiryCount] = useState(0)
  const [grossAdmissionCount, setGrossAdmissionCount] = useState(0)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const defaultEnquiryPieData: any[] = [
      { name: "Playgroup", value: 45, count: 120, fill: "#f97316" },
      { name: "Nursery", value: 30, count: 80, fill: "#fb923c" },
      { name: "Euro Junior", value: 15, count: 40, fill: "#ea580c" },
      { name: "Euro Senior", value: 10, count: 25, fill: "#c2410c" },
    ]

    const defaultAdmissionPieData: any[] = [
      { name: "Playgroup", value: 50, count: 100, fill: "#f97316" },
      { name: "Nursery", value: 25, count: 50, fill: "#fb923c" },
      { name: "Euro Junior", value: 15, count: 30, fill: "#ea580c" },
      { name: "Euro Senior", value: 10, count: 20, fill: "#c2410c" },
    ]

    const defaultEnrollmentTrendsData = [
      { month: "Jan", playGroup: 30, nursery: 22, euroJunior: 15, euroSenior: 10 },
      { month: "Feb", playGroup: 35, nursery: 24, euroJunior: 18, euroSenior: 12 },
      { month: "Mar", playGroup: 40, nursery: 28, euroJunior: 20, euroSenior: 14 },
      { month: "Apr", playGroup: 38, nursery: 26, euroJunior: 19, euroSenior: 13 },
      { month: "May", playGroup: 42, nursery: 30, euroJunior: 21, euroSenior: 16 },
    ]

    const defaultFeeCollectionData = [
      { month: "Jan", amount: 120000 },
      { month: "Feb", amount: 150000 },
      { month: "Mar", amount: 140000 },
      { month: "Apr", amount: 160000 },
      { month: "May", amount: 175000 },
    ]

    const defaultEnquiryTableData = [
      { id: "ENQ-101", reportDate: "2025-04-01", quantity: 12, status: "Open", remarks: "Initial enquiry", asOn: "2025-04-02" },
      { id: "ENQ-102", reportDate: "2025-04-03", quantity: 8, status: "In Progress", remarks: "Follow-up", asOn: "2025-04-04" },
      { id: "ENQ-103", reportDate: "2025-04-05", quantity: 5, status: "Closed", remarks: "Converted", asOn: "2025-04-06" },
    ]

    const fetchAdmissionChartData = async () => {
      try {
        const response = await axios.get( `${API_BASE_URL}/api/admissions/admission-stats`)
        setDashboardData((prev: any) => ({
          ...prev,
          charts: {
            ...prev?.charts,
            admissionData: Array.isArray(response.data) && response.data.length > 0 ? response.data : defaultAdmissionPieData,
          },
        }))
      } catch (error) {
        console.error("Error fetching admission chart data:", error)
        setDashboardData((prev: any) => ({
          ...prev,
          charts: {
            ...prev?.charts,
            admissionData: defaultAdmissionPieData,
          },
        }))
      }
    };

    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/enquiries/count`),
          axios.get(`${API_BASE_URL}/api/profile`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/api/lsq-enquiries/count`),
          axios.get(`${API_BASE_URL}/api/admissions/count`),
          axios.get(`${API_BASE_URL}/api/enquiry-stats`),
        ])

        const enquiryRes = results[0].status === "fulfilled" ? results[0].value : null
        const userRes     = results[1].status === "fulfilled" ? results[1].value : null
        const lsqRes      = results[2].status === "fulfilled" ? results[2].value : null
        const admissionRes= results[3].status === "fulfilled" ? results[3].value : null
        const chartRes    = results[4].status === "fulfilled" ? results[4].value : null

        if (enquiryRes?.data?.count !== undefined) setEnquiryCount(enquiryRes.data.count)
        if (lsqRes?.data?.count !== undefined) setLsqEnquiryCount(lsqRes.data.count)
        if (admissionRes?.data?.count !== undefined) setGrossAdmissionCount(admissionRes.data.count)
        if (Array.isArray(chartRes?.data) && chartRes.data.length > 0) {
          setChartData(chartRes.data)
        } else {
          setChartData(defaultEnquiryPieData)
        }

        if (userRes?.data?.name) setUserName(userRes.data.name)

        setDashboardData((prev: any) => ({
          ...prev,
          metrics: {
            ...prev?.metrics,
            enquiry: enquiryRes?.data?.count ?? 0,
            lsqEnquiry: lsqRes?.data?.count ?? 0,
            admission: admissionRes?.data?.count ?? 0,
          },
          charts: {
            ...prev?.charts,
            enrollmentTrendsData: prev?.charts?.enrollmentTrendsData ?? defaultEnrollmentTrendsData,
            feeCollectionData: prev?.charts?.feeCollectionData ?? defaultFeeCollectionData,
            enquiryData: prev?.charts?.enquiryData ?? defaultEnquiryTableData,
          }
        }))
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        // Set safe defaults so UI remains functional
        setChartData(defaultEnquiryPieData)
        setDashboardData((prev: any) => ({
          ...prev,
          charts: {
            ...prev?.charts,
            enrollmentTrendsData: defaultEnrollmentTrendsData,
            feeCollectionData: defaultFeeCollectionData,
            enquiryData: defaultEnquiryTableData,
            admissionData: prev?.charts?.admissionData ?? defaultAdmissionPieData,
          }
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchData();
    fetchAdmissionChartData();

    // Periodically refresh counts and charts so dashboard updates dynamically
    const intervalId = setInterval(() => {
      void fetchData();
      void fetchAdmissionChartData();
    }, 20000); // every 20s

    return () => clearInterval(intervalId);
  }, [])

  const handleCardClick = (route: string, title: string) => {
    toast({
      title: `Navigating to ${title}`,
      description: "Loading data...",
      duration: 2000,
    })
    router.push(route)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
          <p className="text-sm text-muted-foreground">Count: {payload[0].payload.count}</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6 bg-orange-300 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {userName ? `Mr. ${userName}` : "Partners to your Own ERP Tool"}  
          </h1>
          <p className="text-muted-foreground">Today is {currentDate}</p>
        </div>
       {/* <Button onClick={() => router.push("/dashboard/enrollment/enquiry/new")}>+ New Enquiry</Button> */}
      </div>
      {/* Core Modules Section */}
      {/* <div>
        <h2 className="text-xl font-semibold mb-4">Core Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {coreModules.map((module, index) => (
            <Card
              key={index}
              className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
              onClick={() => handleCardClick(module.route, module.title)}
            >
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <div className="mb-1 mt-1">{module.icon}</div>
                <h3 className="text-sm font-medium">{module.title}</h3>
                <p className="text-xs text-muted-foreground">{module.count} items</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div> */}

      {/* Key Metrics Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Row 1 */}
          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/enrollment/enquiry", "Enquiry")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">Enquiry</h3>
                <Users className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold">{enquiryCount.toLocaleString()}</p>

            </CardContent>
          </Card>

          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/enrollment/lsq-enquiry", "LSQ Enquiry")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">LSQ Enquiry</h3>
                <FileText className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold">{lsqEnquiryCount.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/enrollment/admission", "Gross Admission")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">Gross Admission</h3>
                <BookOpen className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold">{grossAdmissionCount.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/enrollment/admission-status", "Quit")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">Quit</h3>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold"> {dashboardData?.metrics?.quit != null ? dashboardData.metrics.quit.toLocaleString() : "0"}</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/enrollment/transfer-stage", "Transfer In")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">Transfer In</h3>
                <Users className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold"> {dashboardData?.metrics?.quit != null ? dashboardData.metrics.quit.toLocaleString() : "0"}</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/enrollment/transfer-stage", "Transfer Out")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">Transfer Out</h3>
                <FileText className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold"> {dashboardData?.metrics?.quit != null ? dashboardData.metrics.quit.toLocaleString() : "0"}</p>
            </CardContent>
          </Card>

          {/* Row 2 */}
          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/fee/deposit-status", "FCR Deposited")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">FCR Deposited</h3>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold"> {dashboardData?.metrics?.quit != null ? dashboardData.metrics.quit.toLocaleString() : "0"}</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/fee/deposit-status", "FCR Pending")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">FCR Pending</h3>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold"> {dashboardData?.metrics?.quit != null ? dashboardData.metrics.quit.toLocaleString() : "0"}</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/fee/payment-detail", "Payment Due")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">Payment Due</h3>
                <Users className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold"> {dashboardData?.metrics?.quit != null ? dashboardData.metrics.quit.toLocaleString() : "0"}</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/account/soa-details", "Receivable")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">Receivable</h3>
                <FileText className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold">₹{dashboardData?.metrics?.quit != null ? dashboardData.metrics.quit.toLocaleString() : "0"}</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/fee/deposit-amount", "Collection")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">Collection</h3>
                <Receipt className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold">₹{dashboardData?.metrics?.quit != null ? dashboardData.metrics.quit.toLocaleString() : "0"}</p>
            </CardContent>
          </Card>

          <Card
            className="bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-colors cursor-pointer border-l-4 border-l-orange-500"
            onClick={() => handleCardClick("/dashboard/fee/discount-type", "Credit Note")}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium">Credit Note</h3>
                <CreditCard className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-lg font-bold">₹{(dashboardData?.metrics?.creditNote / 100000).toFixed(2)}L</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* navigation tab */}
      <Tabs defaultValue="EnquiriesAdmissions" className="space-y-4">
        <TabsList className="bg-orange-100">
          <TabsTrigger value="EnquiriesAdmissions">Enquiries & Admissions </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="fee-structure">Fee Structure</TabsTrigger>
        </TabsList>
        {/* navigation tab */}

        <TabsContent value="EnquiriesAdmissions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-orange-50 border border-orange-200">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Enquiries by Program</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent, value }) => `${name} ${(percent * 100).toFixed(0)}% (${value})`}
                        outerRadius={80}
                        fill="#f97316"
                        dataKey="value"
                      >
                        {chartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill || "#f97316"} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border border-orange-200">
            <CardContent className="pt-6">
  <h3 className="text-lg font-semibold mb-4">Admissions by Program</h3>

  {dashboardData?.charts?.admissionData?.length > 0 ? (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dashboardData.charts.admissionData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            labelLine
            label={({ name, percent, value }) =>
              `${name} ${(percent * 100).toFixed(0)}% (${value})`
            }
          >
            {dashboardData.charts.admissionData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.fill || "#f97316"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-sm text-muted-foreground text-center mt-2">
        Total:{" "}
        {dashboardData.charts.admissionData.reduce(
          (sum: number, item: any) => sum + item.value,
          0
        )}
      </p>
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">No admission data available</p>
  )}
</CardContent>


            </Card>

          </div>


        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-orange-50 border border-orange-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Enrollment Trends</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData?.charts?.enrollmentTrendsData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="playGroup" name="Play Group" fill="#fb923c" />
                    <Bar dataKey="nursery" name="Nursery" fill="#f97316" />
                    <Bar dataKey="euroJunior" name="Euro Junior" fill="#ea580c" />
                    <Bar dataKey="euroSenior" name="Euro Senior" fill="#c2410c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => {
                    toast({
                      title: "Generating report",
                      description: "Your enrollment report is being generated",
                    })
                  }}
                >
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border border-orange-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Fee Collection Trends</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardData?.charts?.feeCollectionData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Fee Collection"
                      stroke="#f97316"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-orange-50 border border-orange-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Shortage Damage Order</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="border px-4 py-2 text-left">Number</th>
                      <th className="border px-4 py-2 text-left">Report Date</th>
                      <th className="border px-4 py-2 text-left">Quantity</th>
                      <th className="border px-4 py-2 text-left">Status</th>
                      <th className="border px-4 py-2 text-left">Remarks</th>
                      <th className="border px-4 py-2 text-left">As On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData?.charts?.enquiryData || []).map((entry: any, index: number) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{entry.id}</td>
                        <td className="border px-4 py-2">{entry.reportDate}</td>
                        <td className="border px-4 py-2">{entry.quantity}</td>
                        <td className="border px-4 py-2">{entry.status}</td>
                        <td className="border px-4 py-2">{entry.remarks}</td>
                        <td className="border px-4 py-2">{entry.asOn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => {
                    toast({
                      title: "Generating report",
                      description: "Your shortage damage report is being generated",
                    })
                    router.push("/dashboard/shortage/report")
                  }}
                >
                  All Shortage/Damage
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fee-structure" className="space-y-4">
          <Card className="bg-orange-50 border border-orange-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Fee Rate Card (Offline)</h3>

              <div className="mb-6">
                <div className="bg-orange-100 p-2 font-medium">Euro Junior (ApprovedByAllIndiaBM)</div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-orange-50">
                        <th className="border px-4 py-2 text-left">Fee Description</th>
                        <th className="border px-4 py-2 text-right">Rate</th>
                        <th className="border px-4 py-2 text-right">Royalty Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.feeStructure?.euroJunior.map((fee: any, index: number) => (
                        <tr key={index} className="bg-orange-50">
                          <td className="border px-4 py-2">{fee.description}</td>
                          <td className="border px-4 py-2 text-right">{fee.rate}</td>
                          <td className="border px-4 py-2 text-right">{fee.royaltyPercentage}</td>
                        </tr>
                      ))}
                      <tr className="bg-orange-50">
                        <td className="border px-4 py-2 font-medium text-orange-600">Total Fee</td>
                        <td className="border px-4 py-2 text-right font-medium text-orange-600">
                          {dashboardData?.feeStructure?.euroJunior.reduce(
                            (total: number, fee: any) => total + fee.rate,
                            0,
                          )}
                        </td>
                        <td className="border px-4 py-2 text-right">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-orange-100 p-2 font-medium">Euro Senior (ApprovedByAllIndiaBM)</div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-orange-50">
                        <th className="border px-4 py-2 text-left">Fee Description</th>
                        <th className="border px-4 py-2 text-right">Rate</th>
                        <th className="border px-4 py-2 text-right">Royalty Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.feeStructure?.euroSenior.map((fee: any, index: number) => (
                        <tr key={index} className="bg-orange-50">
                          <td className="border px-4 py-2">{fee.description}</td>
                          <td className="border px-4 py-2 text-right">{fee.rate}</td>
                          <td className="border px-4 py-2 text-right">{fee.royaltyPercentage}</td>
                        </tr>
                      ))}
                      <tr className="bg-orange-50">
                        <td className="border px-4 py-2 font-medium text-orange-600">Total Fee</td>
                        <td className="border px-4 py-2 text-right font-medium text-orange-600">
                          {dashboardData?.feeStructure?.euroSenior.reduce(
                            (total: number, fee: any) => total + fee.rate,
                            0,
                          )}
                        </td>
                        <td className="border px-4 py-2 text-right">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => {
                    router.push("/dashboard/fee/structure")
                    toast({
                      title: "Navigating to Fee Structure",
                      description: "Loading fee structure management",
                    })
                  }}
                >
                  Manage Fee Structure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

  )
}
