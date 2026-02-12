'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Lock, ShieldCheck } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AdminLoginPage() {
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

            const { access_token, role } = response.data

            if (role !== 'admin') {
                setError("Unauthorized: Access restricted to administrators.")
                setIsLoading(false)
                return
            }

            localStorage.setItem('token', access_token)
            localStorage.setItem('role', role)

            router.push('/admin/dashboard')

        } catch (err: any) {
            console.error("Auth Error:", err)
            const detail = err.response?.data?.detail
            setError(detail || "Authentication failed. Please check your credentials.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-red-600">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-2">
                        <ShieldCheck className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
                    <CardDescription>Secure access for CampusIQ Administrators</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Admin Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@campusiq.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="pl-10"
                                />
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                            {isLoading ? "Authenticating..." : "Access Dashboard"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-gray-500">
                    Restricted Area • Authorized Personnel Only
                </CardFooter>
            </Card>
        </div>
    )
}
