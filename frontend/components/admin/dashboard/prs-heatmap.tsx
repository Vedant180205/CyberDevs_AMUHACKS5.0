import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import api from '@/lib/api'
import { Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HeatmapData {
    branch: string
    year: string
    count: number
    avg_prs: number
    avg_github: number
    avg_resume: number
    avg_skills: number
    avg_cgpa: number
}

type MetricType = 'avg_prs' | 'avg_github' | 'avg_resume' | 'avg_skills' | 'avg_cgpa'

export function PrsHeatmap() {
    const [data, setData] = useState<HeatmapData[]>([])
    const [loading, setLoading] = useState(true)
    const [metric, setMetric] = useState<MetricType>('avg_prs')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/admin/dashboard/heatmap')
                setData(res.data.heatmap)
            } catch (error) {
                console.error("Failed to fetch heatmap data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Prepare grid data
    // Rows: Branches, Cols: Years
    const branches = Array.from(new Set(data.map(d => d.branch))).sort()
    const years = Array.from(new Set(data.map(d => d.year))).sort()

    const getColor = (score: number) => {
        if (score >= 70) return "bg-emerald-500 text-white"     // Excellent
        if (score >= 50) return "bg-emerald-200 text-teal-900"  // Good
        if (score >= 40) return "bg-amber-200 text-amber-900"   // Average
        return "bg-rose-500 text-white"                         // Critical
    }

    const getMetricLabel = (m: MetricType) => {
        switch (m) {
            case 'avg_prs': return 'Total PRS Score'
            case 'avg_github': return 'GitHub Readiness'
            case 'avg_resume': return 'Resume ATS Score'
            case 'avg_skills': return 'Skill Proficiency'
            case 'avg_cgpa': return 'Academic Performance'
        }
    }

    if (loading) {
        return (
            <Card className="col-span-1 md:col-span-2 lg:col-span-7 dark:bg-slate-900 dark:border-slate-800">
                <div className="h-[200px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </Card>
        )
    }

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-7 dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="dark:text-slate-50">Branch Performance Heatmap</CardTitle>
                        <CardDescription className="dark:text-slate-400">
                            Analyzing <span className="font-semibold text-primary">{getMetricLabel(metric)}</span> by Branch and Year
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Metric Selector */}
                        <Select value={metric} onValueChange={(v) => setMetric(v as MetricType)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Metric" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="avg_prs">Total PRS Score</SelectItem>
                                <SelectItem value="avg_github">GitHub Readiness</SelectItem>
                                <SelectItem value="avg_resume">Resume ATS Score</SelectItem>
                                <SelectItem value="avg_skills">Skill Proficiency</SelectItem>
                                <SelectItem value="avg_cgpa">Academic Performance</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Legend */}
                        <div className="hidden md:flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500"></div><span className="text-muted-foreground">&gt;70</span></div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-200"></div><span className="text-muted-foreground">50-70</span></div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-200"></div><span className="text-muted-foreground">40-50</span></div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-rose-500"></div><span className="text-muted-foreground">&lt;40</span></div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-separate border-spacing-1">
                        <thead>
                            <tr>
                                <th className="p-2 text-left font-medium text-muted-foreground">Branch \ Year</th>
                                {years.map(year => (
                                    <th key={year} className="p-2 font-medium text-muted-foreground">{year}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {branches.map(branch => (
                                <tr key={branch}>
                                    <td className="p-2 font-semibold dark:text-slate-300">{branch}</td>
                                    {years.map(year => {
                                        const cell = data.find(d => d.branch === branch && d.year === year)
                                        const score = cell ? cell[metric] : 0

                                        return (
                                            <td key={`${branch}-${year}`} className="p-0 text-center">
                                                {cell ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    className={`
                                                                        w-full h-12 rounded-md flex items-center justify-center font-bold shadow-sm transition-transform hover:scale-105 cursor-pointer
                                                                        ${getColor(score)}
                                                                    `}
                                                                >
                                                                    {score}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="bg-slate-700 text-white border-slate-600">
                                                                <p className="font-semibold">{branch} - {year}</p>
                                                                <p>{getMetricLabel(metric)}: {score}</p>
                                                                <p className="text-xs opacity-80">(Total Students: {cell.count})</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <div className="w-full h-12 rounded-md bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-muted-foreground/30 text-xs">
                                                        -
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
