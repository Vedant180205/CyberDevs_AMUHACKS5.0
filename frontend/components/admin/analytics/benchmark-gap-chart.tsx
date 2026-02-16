"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from "recharts"
import api from "@/lib/api"
import { Loader2 } from "lucide-react"

interface GapData {
    branch: string
    year: string
    actual_prs: number
    target_prs: number
    gap: number
    status: "Above" | "Below"
}

export function BenchmarkGapChart() {
    const [data, setData] = useState<GapData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchGapData = async () => {
            try {
                const res = await api.get("/api/admin/analytics/gap-analysis")
                setData(res.data.gap_analysis)
            } catch (error) {
                console.error("Failed to fetch gap analysis", error)
            } finally {
                setLoading(false)
            }
        }
        fetchGapData()
    }, [])

    if (loading) {
        return (
            <Card className="col-span-1 md:col-span-2 lg:col-span-4 dark:bg-slate-900 dark:border-slate-800">
                <div className="h-[350px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </Card>
        )
    }

    // Transform data for chart: Group by Branch-Year
    // We want to show: 1st Year CSE, 2nd Year CSE...
    const chartData = data.map(item => ({
        name: `${item.year.split(" ")[0]} ${item.branch}`, // e.g. "1st CSE"
        actual: item.actual_prs,
        target: item.target_prs,
        gap: item.gap,
        status: item.status
    }))

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="dark:text-slate-50">Benchmark Gap Analysis</CardTitle>
                <CardDescription className="dark:text-slate-400">
                    Comparing Actual PRS vs Target Benchmarks across Batches
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700" />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={80}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#334155', opacity: 0.1 }}
                                contentStyle={{
                                    backgroundColor: '#334155',
                                    borderColor: '#475569',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    color: '#f8fafc'
                                }}
                                itemStyle={{ color: '#f8fafc' }}
                                labelStyle={{ color: '#e2e8f0', marginBottom: '0.25rem' }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(value) => <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{value}</span>}
                            />

                            {/* Target Bar (Neutral) */}
                            <Bar
                                dataKey="target"
                                name="Benchmark Target"
                                fill="#94a3b8" // Slate-400 (Visible on both white & dark bg)
                                radius={[0, 4, 4, 0]}
                                barSize={12}
                            />

                            {/* Actual Bar (Colored by Gap) */}
                            <Bar
                                dataKey="actual"
                                name="Actual PRS"
                                radius={[0, 4, 4, 0]}
                                barSize={12}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.actual >= entry.target ? "#10b981" : "#f43f5e"} // Emerald-500 / Rose-500
                                        stroke={entry.actual >= entry.target ? "#059669" : "#e11d48"} // Slight border for pop
                                        strokeWidth={1}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
