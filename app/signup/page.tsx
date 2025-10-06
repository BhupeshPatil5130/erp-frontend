"use client"

import type React from "react"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { API_BASE_URL } from "@/lib/config"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Building2, UserPlus } from "lucide-react"

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="text-sm text-muted-foreground">Loading…</span></div>}>
      <SignupInner />
    </Suspense>
  )
}

function SignupInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [institute, setInstitute] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const q = searchParams?.get("institute") || ""
    if (q) setInstitute(q)
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    try {
      const response = await fetch( `${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          institute,
          name,
          email,
          password
        })
      })

      if (response.ok) {
        router.push("/login")
      } else {
        const error = await response.json()
        alert(error.message || "Signup failed")
      }
    } catch (error) {
      console.error("Signup Error:", error)
      alert("Something went wrong. Please try again.")
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institute">Institute</Label>
                <Select value={institute} onValueChange={setInstitute} required>
                  <SelectTrigger id="institute">
                    <SelectValue placeholder="Select Institute" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="playgroup">Playgroup</SelectItem>
                    <SelectItem value="nursery">Nursery</SelectItem>
                    <SelectItem value="sujunor">Sujunor</SelectItem>
                    <SelectItem value="susenior">Susenior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
  )
}
