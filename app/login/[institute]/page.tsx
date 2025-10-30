"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

export default function InstituteLoginPage() {
  const { institute } = useParams<{ institute: string }>()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string>("")

  const pretty = (key?: string) => {
    if (!key) return "Institute"
    const map: Record<string, string> = {
      playgroup: "Playgroup",
      nursery: "Nursery",
      sujunor: "Sujunor",
      susenior: "Susenior",
    }
    return map[key] || key.replace(/-/g, " ")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const response = await fetch(`/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ institute, email, password }),
      })
      const data = await response.json()
      if (response.ok) {
        router.push("/dashboard")
      } else {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      setError("An error occurred. Please try again later.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{pretty(String(institute))} Login</CardTitle>
          <CardDescription className="text-center">Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-red-500 text-center mb-2">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/login" className="text-sm text-muted-foreground underline">Back</Link>
          <Link href="/signup" className="text-sm text-muted-foreground underline">Create account</Link>
        </CardFooter>
      </Card>
    </div>
  )
}


