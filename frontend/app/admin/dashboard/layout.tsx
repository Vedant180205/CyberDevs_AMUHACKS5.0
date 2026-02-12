'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    BarChart3,
    Bot,
    LogOut,
    Settings,
    ShieldCheck,
    Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const role = localStorage.getItem('role')
        if (role !== 'admin') {
            router.push('/admin/login')
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        router.push('/admin/login')
    }

    if (!isMounted) return null

    const navItems = [
        { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Skills Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
        { name: 'AI Insights', href: '/admin/dashboard/insights', icon: Bot },
        // { name: 'Students', href: '/admin/dashboard/students', icon: Users }, // Future scope
    ]

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-6 flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700">
                    <ShieldCheck className="h-6 w-6 text-red-600" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">CampusIQ Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    )
}
