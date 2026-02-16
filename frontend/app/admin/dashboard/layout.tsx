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
import { ModeToggle } from '@/components/mode-toggle'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const role = localStorage.getItem('role')
        if (role !== 'admin') {
            router.replace('/admin/login')
        }
    }, [router])

    const handleLogout = () => {
        // Use the auth utility to clear everything
        const { clearAuth } = require('@/lib/auth')
        clearAuth()
        router.replace('/')
    }

    if (!isMounted) return null

    const navItems = [
        { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Skills Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
        { name: 'AI Insights', href: '/admin/dashboard/insights', icon: Bot },
        // { name: 'Students', href: '/admin/dashboard/students', icon: Users }, // Future scope
    ]

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-slate-950 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="p-6 flex items-center space-x-2 border-b border-gray-200 dark:border-slate-800">
                    <ShieldCheck className="h-6 w-6 text-red-600" />
                    <span className="text-xl font-bold text-gray-900 dark:text-slate-50">CampusIQ Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto p-8 relative bg-gray-50 dark:bg-slate-950">
                <div className="absolute top-4 right-4 z-50">
                    <ModeToggle />
                </div>
                {children}
            </main>
        </div>
    )
}
