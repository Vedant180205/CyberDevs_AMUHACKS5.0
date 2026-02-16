'use client'

import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Sidebar, Loader2, BarChart3, TrendingUp } from 'lucide-react'
import { SkillsBarChart } from '@/components/admin/analytics/skills-bar'
import { BenchmarkGapChart } from '@/components/admin/analytics/benchmark-gap-chart'

export default function AnalyticsPage() {
    const [skillsData, setSkillsData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await api.get('/api/admin/skills-analytics')
            setSkillsData(res.data.top_skills)
        } catch (error) {
            console.error("Failed to fetch skills analytics:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold tracking-tight dark:text-slate-50">Advanced Analytics</h1>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {/* Benchmark Gap Analysis (New High-Value Chart) */}
                <BenchmarkGapChart />

                {/* Existing Skills Chart */}
                <SkillsBarChart data={skillsData} />
            </div>
        </div>
    )
}
