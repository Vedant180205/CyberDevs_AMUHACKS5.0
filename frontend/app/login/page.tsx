'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await api.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      })

      const { access_token } = response.data

      // Use auth utilities
      const { setAuthToken, setUserRole } = await import('@/lib/auth')
      setAuthToken(access_token)

      // Check if student
      try {
        const studentRes = await api.get("/api/student/me", {
          headers: { Authorization: `Bearer ${access_token}` }
        })

        const studentData = studentRes.data

        setUserRole("student")

        // profile completion check
        const profileCompleted =
          studentData.branch &&
          studentData.year &&
          studentData.skills &&
          studentData.skills.length > 0

        if (!profileCompleted) {
          router.push("/student/profile")
        } else {
          router.push("/dashboard")
        }

        return
      } catch (err) {
        // if student/me fails, try admin
      }

      // Check if admin
      setUserRole("admin")
      router.push("/admin/stats")

    } catch (err: any) {
      console.error("Login Error:", err)
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-4 relative overflow-hidden">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[70vh] h-[70vh] rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -left-[10%] w-[60vh] h-[60vh] rounded-full bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden ring-1 ring-white/50">
          <CardHeader className="space-y-2 text-center pb-6 border-b border-gray-100/50 bg-gradient-to-b from-white to-gray-50/50 pt-6">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-1">
              <span className="text-white font-bold text-lg">CQ</span>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1 text-sm">
                Sign in to access your CampusIQ dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-6 px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@college.edu"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 h-10 transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-700 font-medium text-sm">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 h-10 transition-all text-sm"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-700 py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-sm font-semibold">Authentication Failed</AlertTitle>
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 bg-gray-50/50 py-4 border-t border-gray-100">
            <div className="text-center w-full">
              <p className="text-xs text-gray-400">
                Secure authentication powered by CampusIQ
              </p>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; 2026 CampusIQ. Secure Placement Intelligence.
        </p>
      </motion.div>
    </div>
  )
}
