'use client'

import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts'
import { Loader2, Sparkles, TrendingUp, Users, AlertTriangle, CheckCircle, Bot } from 'lucide-react'
import { RiskDonutChart } from '@/components/admin/dashboard/risk-donut'
import { CompanyFunnelChart } from '@/components/admin/dashboard/company-funnel'
import { PrsHeatmap } from '@/components/admin/dashboard/prs-heatmap'

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [skillsData, setSkillsData] = useState<any[]>([])
    const [recommendations, setRecommendations] = useState<any>(null)
    const [loadingStats, setLoadingStats] = useState(true)
    const [loadingAI, setLoadingAI] = useState(false)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoadingStats(true)
        try {
            const [summaryRes, skillsRes] = await Promise.all([
                api.get('/api/admin/dashboard/summary'),
                api.get('/api/admin/skills-analytics')
            ])
            setStats(summaryRes.data)
            setSkillsData(skillsRes.data.top_skills)
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error)
        } finally {
            setLoadingStats(false)
        }
    }

    const generateRecommendations = async () => {
        setLoadingAI(true)
        try {
            const res = await api.post('/api/admin/ai-recommendations')
            setRecommendations(res.data)
        } catch (error) {
            console.error("Failed to generate recommendations:", error)
        } finally {
            setLoadingAI(false)
        }
    }

    if (loadingStats) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-50">Executive Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-slate-50">{stats?.total_students || 0}</div>
                        <p className="text-xs text-muted-foreground">Registered on platform</p>
                    </CardContent>
                </Card>
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">Average PRS</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-slate-50">{stats?.avg_prs || 0}</div>
                        <p className="text-xs text-muted-foreground">Placement Readiness Score</p>
                    </CardContent>
                </Card>
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">High Risk (Red)</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.red_count || 0}</div>
                        <p className="text-xs text-muted-foreground">Students requiring attention</p>
                    </CardContent>
                </Card>
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">Job Ready (Green)</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.green_count || 0}</div>
                        <p className="text-xs text-muted-foreground">Eligible for placements</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="dark:text-slate-50">Top Skills Distribution</CardTitle>
                        <CardDescription className="dark:text-slate-400">Most common skills across all batches</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={skillsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="skill"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#334155',
                                            borderRadius: '6px',
                                            border: '1px solid #475569',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            color: '#ffffff'
                                        }}
                                        cursor={{ fill: 'transparent' }}
                                        itemStyle={{ color: '#ffffff' }}
                                        labelStyle={{ color: '#ffffff' }}
                                    />
                                    <Bar dataKey="count" fill="#adfa1d" radius={[4, 4, 0, 0]}>
                                        {skillsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#60a5fa'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Insights Section */}
                <Card className="col-span-3 border-l-4 border-l-purple-500 bg-purple-50/10 dark:bg-slate-900 dark:border dark:border-slate-800 dark:border-l-4 dark:border-l-purple-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center dark:text-slate-50"><Sparkles className="mr-2 h-5 w-5 text-purple-600" /> AI Insights</CardTitle>
                            <Button
                                size="sm"
                                onClick={generateRecommendations}
                                disabled={loadingAI}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {loadingAI ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                Analyze
                            </Button>
                        </div>
                        <CardDescription className="dark:text-slate-400">
                            Generate Groq-powered training recommendations for specific batches.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!recommendations ? (
                            <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                <Bot className="h-8 w-8 mb-2 opacity-50" />
                                <p>Click "Analyze" to generate insights</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                                    <h4 className="font-semibold text-sm mb-1 text-purple-700 dark:text-purple-400">Analysis Summary</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">{recommendations.analysis_summary}</p>
                                </div>
                                <h4 className="font-semibold text-sm mt-2 dark:text-slate-50">Recommended Interventions:</h4>
                                {recommendations.recommendations?.map((rec: any, idx: number) => (
                                    <div key={idx} className="p-3 border rounded-lg bg-white dark:bg-slate-800 border-l-4 border-l-blue-500 shadow-sm relative overflow-hidden dark:border-slate-700">
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="font-bold text-sm dark:text-slate-50">{rec.action_title}</h5>
                                            <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'} className="text-[10px]">
                                                {rec.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">Target: {rec.target_batch}</p>
                                        <p className="text-xs text-gray-600 dark:text-slate-300 mb-2">{rec.reason}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* New Analytics Row: Risk Donut & Company Funnel */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-3">
                    {stats && (
                        <RiskDonutChart
                            data={{
                                red: stats.red_count,
                                yellow: stats.yellow_count,
                                green: stats.green_count
                            }}
                        />
                    )}
                </div>
                <div className="col-span-4">
                    <CompanyFunnelChart />
                </div>
            </div>

            {/* Heatmap Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-7">
                    <PrsHeatmap />
                </div>
            </div>
        </div>
    )
}
