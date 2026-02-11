'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Trophy, Target, TrendingUp, BookOpen, CheckCircle,
    Search, Briefcase, ChevronRight, Star, AlertCircle,
    Github, Linkedin, FileText, Code, Zap, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import gsap from 'gsap'

// --- Interfaces ---
interface StudentProfile {
    _id: string
    full_name: string
    prs_score: number
    tier: string
    branch: string
    year: string
    cgpa: number
    prs_breakdown: { [key: string]: number }
    github?: string
    linkedin?: string
    resume_text?: string
}

interface MicroTask {
    _id: string
    task: string
    status: 'pending' | 'completed'
}

interface CompanyAnalysis {
    student: string
    company: string
    lens_analysis: {
        match_score: string
        analysis: string
    }
}

export default function DashboardPage() {
    const router = useRouter()
    const [profile, setProfile] = React.useState<StudentProfile | null>(null)
    const [tasks, setTasks] = React.useState<MicroTask[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    // Company Lens State
    const [companySearch, setCompanySearch] = React.useState('')
    const [lensLoading, setLensLoading] = React.useState(false)
    const [lensResult, setLensResult] = React.useState<CompanyAnalysis | null>(null)

    // Gauge Ref
    const gaugeRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    router.push('/login')
                    return
                }

                const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (profileRes.status === 401) {
                    toast.error("Session expired. Please login again.")
                    router.push('/login')
                    return
                }

                if (profileRes.status === 404) {
                    toast.error("Profile not found. Please complete onboarding.")
                    router.push('/onboard')
                    return
                }

                if (!profileRes.ok) {
                    throw new Error('Failed to fetch profile')
                }
                const profileData = await profileRes.json()
                setProfile(profileData)

                if (profileData._id) {
                    const tasksRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${profileData._id}/tasks`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                    if (tasksRes.ok) {
                        const tasksData = await tasksRes.json()
                        setTasks(tasksData)
                    }
                }

            } catch (error) {
                console.error('Dashboard load error:', error)
                toast.error('Failed to load dashboard data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [router])

    React.useEffect(() => {
        if (!isLoading && profile && gaugeRef.current) {
            // GSAP Animation for Gauge
            const score = profile.prs_score || 0
            gsap.fromTo(gaugeRef.current,
                { '--progress': 0 } as any,
                { '--progress': score, duration: 2, ease: 'power2.out' }
            )
        }
    }, [isLoading, profile])

    const handleTaskToggle = async (taskId: string, currentStatus: string) => {
        if (!profile) return
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'

        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t))

        try {
            const token = localStorage.getItem('token')
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${profile._id}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })
            toast.success(`Task marked as ${newStatus}`)
        } catch (error) {
            console.error('Task update failed', error)
            toast.error('Failed to update task')
            // Revert
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: currentStatus as 'pending' | 'completed' } : t))
        }
    }

    const runCompanyLens = async () => {
        if (!companySearch.trim() || !profile) return
        setLensLoading(true)
        setLensResult(null)

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${profile._id}/eligibility/${companySearch}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                setLensResult({
                    student: profile.full_name,
                    company: data.company,
                    lens_analysis: {
                        match_score: data.status.skills.match_percent.toFixed(0) + '%',
                        analysis: data.eligible ? "You are eligible based on branch and criteria." : "You do not meet the criteria yet."
                    }
                })
            } else {
                toast.error("Company not found in database")
            }
        } catch (error) {
            console.error(error)
            toast.error("Analysis failed")
        } finally {
            setLensLoading(false)
        }
    }

    const runAIAnalyzer = (type: string) => {
        toast.info(`Running ${type} Analysis...`)
        // Future: Wire up to actual endpoints
        // For now, simulate logic
        setTimeout(() => toast.success("Analysis Complete (Simulation)"), 1500)
    }

    if (isLoading) return <DashboardSkeleton />

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                        Hello, {profile?.full_name?.split(' ')[0] || 'Scholar'}!
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {profile?.branch} • {profile?.year === '4' ? 'Final Year' : `${profile?.year} Year`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1 bg-white border-blue-200 text-blue-700 shadow-sm">
                        <Trophy className="w-3 h-3 mr-2 text-yellow-500" />
                        Top 15% of Branch
                    </Badge>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                        {profile?.full_name?.charAt(0)}
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: PRS & Metrics (lg:col-span-8) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* PRS Hero Card */}
                    <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 -z-10"></div>
                        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">

                            {/* Animated Gauge */}
                            <div className="relative w-48 h-48 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="96" cy="96" r="88" className="stroke-gray-200 fill-none stroke-[12px]" />
                                    <circle
                                        cx="96" cy="96" r="88"
                                        className={cn(
                                            "fill-none stroke-[12px] transition-all duration-1000 ease-out",
                                            (profile?.prs_score || 0) > 75 ? "stroke-emerald-500" :
                                                (profile?.prs_score || 0) > 40 ? "stroke-yellow-500" : "stroke-red-500"
                                        )}
                                        strokeDasharray="552"
                                        strokeDashoffset={552 - (552 * (profile?.prs_score || 0)) / 100}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-gray-800">{profile?.prs_score?.toFixed(0)}</span>
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">PRS Score</span>
                                </div>
                            </div>

                            {/* Text & NBA */}
                            <div className="space-y-4 flex-1 text-center md:text-left">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Deployment Ready</h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Your profile is looking strong! You are in the <span className="text-blue-600 font-bold">{profile?.tier} Tier</span>.
                                        Focus on projects to boost your score further.
                                    </p>
                                </div>

                                {/* Next Best Action */}
                                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-colors"></div>
                                    <div className="relative flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Zap className="w-5 h-5 text-yellow-300" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-blue-100 uppercase tracking-wider">Next Best Action</p>
                                            <p className="font-bold">Complete "Full Stack" Certification</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 ml-auto text-white/70" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard
                            icon={Github}
                            label="GitHub"
                            value={profile?.github ? "Linked" : "Missing"}
                            sub={profile?.github ? "Profile Active" : "Add to Boost"}
                            color={profile?.github ? "text-gray-900" : "text-gray-400"}
                        />
                        <MetricCard
                            icon={Linkedin}
                            label="LinkedIn"
                            value={profile?.linkedin ? "Linked" : "Missing"}
                            sub={profile?.linkedin ? "Network Ready" : "Add to Boost"}
                            color={profile?.linkedin ? "text-blue-700" : "text-gray-400"}
                        />
                        <MetricCard
                            icon={FileText}
                            label="Resume"
                            value={profile?.resume_text ? "Uploaded" : "Pending"}
                            sub={profile?.prs_breakdown?.resume ? `${profile.prs_breakdown.resume}/20 pts` : "Analysis Ready"}
                            color={profile?.resume_text ? "text-emerald-600" : "text-gray-400"}
                        />
                        <MetricCard
                            icon={BookOpen}
                            label="Aptitude"
                            value={profile?.prs_breakdown?.aptitude ? "Measured" : "Pending"}
                            sub={profile?.prs_breakdown?.aptitude ? "Score Added" : "Take Test"}
                            color={profile?.prs_breakdown?.aptitude ? "text-purple-600" : "text-gray-400"}
                        />
                    </div>

                    {/* Weekly Action Plan */}
                    <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-600" /> Weekly Action Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {tasks.length === 0 ? (
                                <p className="text-gray-500 italic flex flex-col items-center py-4">
                                    <span>No active tasks.</span>
                                    <Button variant="outline" size="sm" className="mt-2" onClick={() => runAIAnalyzer("Task Generation")}>
                                        <Zap className="w-3 h-3 mr-1" /> Generate New Plan
                                    </Button>
                                </p>
                            ) : (
                                tasks.map((task) => (
                                    <div
                                        key={task._id}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                                            task.status === 'completed' ? "bg-emerald-50 border-emerald-100" : "bg-white border-gray-100 hover:border-blue-200"
                                        )}
                                        onClick={() => handleTaskToggle(task._id, task.status)}
                                    >
                                        <div className={cn(
                                            "mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                            task.status === 'completed' ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
                                        )}>
                                            {task.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium transition-all",
                                            task.status === 'completed' ? "text-gray-400 line-through" : "text-gray-700"
                                        )}>
                                            {task.task}
                                        </span>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column: Company Lens & Analyzers (lg:col-span-4) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Company Lens */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Search className="w-5 h-5" /> Company Lens
                            </CardTitle>
                            <CardDescription className="text-indigo-100">
                                Check your eligibility for dream companies.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g. Google"
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                                    value={companySearch}
                                    onChange={(e) => setCompanySearch(e.target.value)}
                                />
                                <Button size="icon" variant="secondary" onClick={runCompanyLens} disabled={lensLoading}>
                                    {lensLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>

                            <AnimatePresence>
                                {lensResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-white/10 rounded-lg border border-white/20 text-sm space-y-2"
                                    >
                                        <div className="flex justify-between items-center font-bold">
                                            <span>{lensResult.company}</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{lensResult.lens_analysis.match_score}</span>
                                        </div>
                                        <p className="text-xs text-indigo-100 leading-relaxed">
                                            {lensResult.lens_analysis.analysis}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Analyzers List */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider pl-1">Technical Analyzers</h3>

                        <AnalyzerCard
                            icon={Github}
                            title="GitHub Insight"
                            status="Review Pending"
                            desc="Project classification needed."
                            action="Analyze"
                            onAction={() => runAIAnalyzer("GitHub")}
                        />
                        <AnalyzerCard
                            icon={Linkedin}
                            title="LinkedIn Audit"
                            status="Action Required"
                            desc="Missing 'About' section."
                            alert
                            action="Audit"
                            onAction={() => runAIAnalyzer("LinkedIn")}
                        />
                        <AnalyzerCard
                            icon={FileText}
                            title="Resume Rewrite"
                            status="AI Available"
                            desc="Gemini critique ready."
                            action="Critique"
                            onAction={() => runAIAnalyzer("Resume")}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

function MetricCard({ icon: Icon, label, value, sub, color }: any) {
    return (
        <Card className="border-0 shadow-md bg-white/60 backdrop-blur hover:bg-white/80 transition-colors">
            <CardContent className="p-4 space-y-3">
                <div className={cn("p-2 rounded-lg w-fit", color.replace('text-', 'bg-').replace('600', '100').replace('700', '100').replace('900', '100'))}>
                    <Icon className={cn("w-5 h-5", color)} />
                </div>
                <div>
                    <h4 className="text-xl font-bold text-gray-800">{value}</h4>
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function AnalyzerCard({ icon: Icon, title, status, desc, alert, action, onAction }: any) {
    return (
        <div className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="p-2.5 bg-gray-50 group-hover:bg-blue-50 rounded-lg text-gray-600 group-hover:text-blue-600 transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-gray-800 text-sm truncate">{title}</h4>
                    {alert && <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
                <p className="text-xs text-gray-500 truncate">{desc}</p>
            </div>
            {action && (
                <Button size="sm" variant="ghost" className="text-xs h-7 px-2 hover:bg-blue-100 hover:text-blue-600" onClick={onAction}>
                    {action}
                </Button>
            )}
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen p-8 space-y-8">
            <div className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}
