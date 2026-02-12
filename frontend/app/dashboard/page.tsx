'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { clearAuth, getUserRole } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
    TrendingUp,
    Github,
    Building2,
    Star,
    Code,
    GitBranch,
    Clock,
    LogOut,
    Sparkles,
    Target,
    Award,
    RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'

import { ProfileEditModal } from '@/components/profile-edit-modal'

export default function DashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [studentData, setStudentData] = useState<any>(null)
    const [prsData, setPrsData] = useState<any>(null)
    const [githubData, setGithubData] = useState<any>(null)
    const [companyMatches, setCompanyMatches] = useState<any[]>([])
    const [companyAIAnalysis, setCompanyAIAnalysis] = useState<any>(null)
    const [analyzingPRS, setAnalyzingPRS] = useState(false)
    const [analyzingGithub, setAnalyzingGithub] = useState(false)
    const [loadingCompanyMatches, setLoadingCompanyMatches] = useState(false)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            // Fetch student profile
            const studentRes = await api.get('/api/student/me')
            setStudentData(studentRes.data)

            // If student has PRS data already, set it
            if (studentRes.data.prs_score !== undefined) {
                setPrsData({
                    prs_score: studentRes.data.prs_score,
                    prs_level: studentRes.data.prs_level,
                    breakdown: studentRes.data.prs_breakdown
                })
            }

            // If student has GitHub analysis, set it
            if (studentRes.data.github_analysis) {
                setGithubData(studentRes.data.github_analysis)
            }

            setLoading(false)
        } catch (error) {
            console.error('Dashboard data fetch error:', error)
            setLoading(false)
        }
    }

    const handleCalculatePRS = async () => {
        setAnalyzingPRS(true)
        try {
            const res = await api.post('/api/student/calculate-prs')
            setPrsData({
                prs_score: res.data.prs_score,
                prs_level: res.data.prs_level,
                breakdown: res.data.prs_breakdown
            })
            alert(`✅ PRS Calculated: ${res.data.prs_score}/100`)
        } catch (error: any) {
            console.error('PRS calculation error:', error)
            const msg = error.response?.data?.detail || "Failed to calculate PRS. Ensure GitHub analysis is complete."
            alert(`❌ Error: ${msg}`)
        } finally {
            setAnalyzingPRS(false)
        }
    }

    const handleAnalyzeGithub = async () => {
        setAnalyzingGithub(true)
        try {
            const res = await api.post('/api/student/analyze/github')
            setGithubData(res.data.github_analysis)
            alert('✅ GitHub analysis completed successfully!')
            // Refresh dashboard to potentially enable PRS if it was blocked
            fetchDashboardData()
        } catch (error: any) {
            console.error('GitHub analysis error:', error)
            const errorMessage = error.response?.data?.detail || 'Failed to analyze GitHub profile. Please try again later.'
            alert(`❌ Error: ${errorMessage}`)
        } finally {
            setAnalyzingGithub(false)
        }
    }

    const handleCompanyLens = async () => {
        setLoadingCompanyMatches(true)
        try {
            const res = await api.get('/api/student/company-match')
            setCompanyMatches(res.data.company_matches || [])
            setCompanyAIAnalysis(res.data.ai_analysis || null)
        } catch (error) {
            console.error('Company match error:', error)
            alert('Failed to load company matches. Please try again.')
        } finally {
            setLoadingCompanyMatches(false)
        }
    }



    const handleLogout = () => {
        clearAuth()
        router.push('/login')
    }

    const getPRSColor = (score: number) => {
        if (score >= 80) return 'from-green-500 to-emerald-600'
        if (score >= 60) return 'from-blue-500 to-indigo-600'
        if (score >= 40) return 'from-yellow-500 to-orange-600'
        return 'from-red-500 to-rose-600'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-48" />
                        <Skeleton className="h-48" />
                        <Skeleton className="h-48" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {studentData?.name || 'Student'}!
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {studentData?.branch} • Year {studentData?.year} • CGPA {studentData?.cgpa}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ProfileEditModal
                            studentData={studentData}
                            onUpdate={fetchDashboardData}
                        />
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </motion.div>

                {/* PRS Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl mb-6">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        Placement Readiness Score (PRS)
                                    </CardTitle>
                                    <CardDescription>Your overall placement readiness assessment</CardDescription>
                                </div>
                                <Button
                                    onClick={handleCalculatePRS}
                                    disabled={analyzingPRS}
                                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    {analyzingPRS ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            {prsData ? 'Recalculate' : 'Calculate PRS'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {prsData ? (
                                <div className="space-y-6">
                                    {/* PRS Score Display */}
                                    <div className="flex items-center gap-6">
                                        <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${getPRSColor(prsData.prs_score)} flex items-center justify-center shadow-lg`}>
                                            <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center">
                                                <span className="text-3xl font-bold text-gray-900">{prsData.prs_score}</span>
                                                <span className="text-xs text-gray-500">/ 100</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{prsData.prs_level}</h3>
                                            <Progress value={prsData.prs_score} className="h-3" />
                                        </div>
                                    </div>

                                    {/* PRS Breakdown */}
                                    {prsData.breakdown && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                            {Object.entries(prsData.breakdown).map(([key, value]: [string, any]) => (
                                                <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 uppercase mb-1">{key.replace('_', ' ')}</p>
                                                    <p className="text-xl font-bold text-gray-900">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>Click "Calculate PRS" to get your placement readiness score</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Second Row: GitHub Analysis + Company Lens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* GitHub Analysis */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl h-full">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <Github className="h-5 w-5 text-gray-900" />
                                        GitHub Analysis
                                    </CardTitle>
                                    <Button
                                        onClick={handleAnalyzeGithub}
                                        disabled={analyzingGithub || !studentData?.github_url}
                                        size="sm"
                                        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    >
                                        {analyzingGithub ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <GitBranch className="h-4 w-4" />
                                                Analyze GitHub
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {githubData ? (
                                    <div className="space-y-6">
                                        {/* Overview Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <Code className="h-5 w-5 text-blue-600 mb-1" />
                                                <p className="text-xl font-bold text-gray-900">{githubData.public_repos || 0}</p>
                                                <p className="text-xs text-gray-500">Repositories</p>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <Star className="h-5 w-5 text-green-600 mb-1" />
                                                <p className="text-xl font-bold text-gray-900">{githubData.activity_summary?.commits_last_90_days_estimated || 0}</p>
                                                <p className="text-xs text-gray-500">Commits (90d)</p>
                                            </div>
                                            <div className="bg-purple-50 p-3 rounded-lg">
                                                <GitBranch className="h-5 w-5 text-purple-600 mb-1" />
                                                <p className="text-xl font-bold text-gray-900">{githubData.activity_summary?.active_repos_last_90_days || 0}</p>
                                                <p className="text-xs text-gray-500">Active Repos</p>
                                            </div>
                                            <div className="bg-indigo-50 p-3 rounded-lg">
                                                <TrendingUp className="h-5 w-5 text-indigo-600 mb-1" />
                                                <p className="text-xl font-bold text-gray-900">{githubData.github_score || 0}</p>
                                                <p className="text-xs text-gray-500">GitHub Score</p>
                                            </div>
                                        </div>

                                        {/* Followers / Following */}
                                        <div className="flex gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <span className="font-semibold text-gray-900">{githubData.followers || 0}</span>
                                                <span className="text-gray-500">followers</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="font-semibold text-gray-900">{githubData.following || 0}</span>
                                                <span className="text-gray-500">following</span>
                                            </div>
                                        </div>

                                        {/* Top Languages */}
                                        {githubData.top_languages && githubData.top_languages.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">Top Languages</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {githubData.top_languages.map((lang: string) => (
                                                        <Badge key={lang} variant="secondary" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                                            {lang}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Project Types Distribution */}
                                        {githubData.project_type_distribution && Object.keys(githubData.project_type_distribution).length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">Project Types</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(githubData.project_type_distribution).map(([type, count]: [string, any]) => (
                                                        <Badge key={type} variant="outline" className="text-xs">
                                                            {type} ({count})
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Top Repositories */}
                                        {githubData.repo_analysis && githubData.repo_analysis.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-3">Top Repositories</p>
                                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                                    {githubData.repo_analysis.slice(0, 5).map((repo: any, idx: number) => (
                                                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-gray-900 text-sm">{repo.repo_name}</h4>
                                                                    {repo.description && (
                                                                        <p className="text-xs text-gray-600 mt-1">{repo.description}</p>
                                                                    )}
                                                                </div>
                                                                {repo.active_in_last_90_days && (
                                                                    <Badge className="bg-green-500 text-white text-xs">Active</Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                                {repo.languages_used?.slice(0, 3).map((lang: string) => (
                                                                    <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                                                                ))}
                                                            </div>

                                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <GitBranch className="h-3 w-3" />
                                                                    {repo.commits_last_90_days_estimated || 0} commits
                                                                </span>
                                                                {repo.project_type && (
                                                                    <span className="text-blue-600">{repo.project_type}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Github className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-sm">
                                            {studentData?.github_url
                                                ? 'Click "Analyze GitHub" to get insights'
                                                : 'Add GitHub URL in profile to analyze'}
                                        </p>
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Company Lens */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl h-full">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-indigo-600" />
                                        Company Matches
                                    </CardTitle>
                                    <Button
                                        onClick={handleCompanyLens}
                                        disabled={loadingCompanyMatches}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        {loadingCompanyMatches ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Award className="h-4 w-4" />
                                                Find Matches
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {companyMatches.length > 0 ? (
                                    <div className="space-y-6">
                                        {/* AI Profile Analysis */}
                                        {companyAIAnalysis && (
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                                    AI Profile Analysis
                                                </h4>

                                                {companyAIAnalysis.overall_profile_summary && (
                                                    <p className="text-sm text-gray-700 mb-3">{companyAIAnalysis.overall_profile_summary}</p>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {/* Strengths */}
                                                    {companyAIAnalysis.profile_strengths?.length > 0 && (
                                                        <div className="bg-white p-3 rounded-lg">
                                                            <p className="text-xs font-semibold text-green-700 mb-2">💪 Strengths</p>
                                                            <ul className="space-y-1">
                                                                {companyAIAnalysis.profile_strengths.slice(0, 3).map((strength: string, idx: number) => (
                                                                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                                                                        <span className="text-green-500 mt-0.5">✓</span>
                                                                        <span>{strength}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Weaknesses */}
                                                    {companyAIAnalysis.profile_weaknesses?.length > 0 && (
                                                        <div className="bg-white p-3 rounded-lg">
                                                            <p className="text-xs font-semibold text-orange-700 mb-2">📈 Areas to Improve</p>
                                                            <ul className="space-y-1">
                                                                {companyAIAnalysis.profile_weaknesses.slice(0, 3).map((weakness: string, idx: number) => (
                                                                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                                                                        <span className="text-orange-500 mt-0.5">→</span>
                                                                        <span>{weakness}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Company Matches with AI Insights */}
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {companyMatches.map((match: any, idx: number) => {
                                                const aiInsight = companyAIAnalysis?.company_insights?.find(
                                                    (insight: any) => insight.company_name === match.company_name
                                                )

                                                return (
                                                    <div key={idx} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                                        {/* Company Header */}
                                                        <div className="p-3 flex justify-between items-center">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-900">{match.company_name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {match.match_percent}% match • {match.role} • {match.tier}
                                                                </p>
                                                            </div>
                                                            <Badge
                                                                variant={match.eligible ? "default" : "outline"}
                                                                className={match.eligible ? "bg-green-600 text-white" : "bg-red-50 text-red-700 border-red-200"}
                                                            >
                                                                {match.eligible ? 'Eligible' : 'Not Eligible'}
                                                            </Badge>
                                                        </div>

                                                        {/* AI Insights */}
                                                        {aiInsight && (
                                                            <div className="px-3 pb-3 space-y-2 border-t border-gray-200 pt-3 bg-white">
                                                                {/* Match Reasoning */}
                                                                {aiInsight.match_reasoning && (
                                                                    <div>
                                                                        <p className="text-xs font-medium text-blue-700 mb-1">🎯 Why You Match:</p>
                                                                        <p className="text-xs text-gray-600">{aiInsight.match_reasoning}</p>
                                                                    </div>
                                                                )}

                                                                {/* Eligibility Explanation */}
                                                                {aiInsight.eligibility_explanation && (
                                                                    <div>
                                                                        <p className="text-xs font-medium text-gray-700 mb-1">
                                                                            {match.eligible ? '✅ Eligibility:' : '❌ Not Eligible:'}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600">{aiInsight.eligibility_explanation}</p>
                                                                    </div>
                                                                )}

                                                                {/* Improvement Suggestions */}
                                                                {aiInsight.improvement_suggestions?.length > 0 && (
                                                                    <div>
                                                                        <p className="text-xs font-medium text-purple-700 mb-1">💡 Suggestions:</p>
                                                                        <ul className="space-y-1">
                                                                            {aiInsight.improvement_suggestions.map((suggestion: string, sidx: number) => (
                                                                                <li key={sidx} className="text-xs text-gray-600 flex items-start gap-1">
                                                                                    <span>•</span>
                                                                                    <span>{suggestion}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Top Priority Actions */}
                                        {companyAIAnalysis?.top_priority_actions?.length > 0 && (
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                                    <Target className="h-4 w-4 text-blue-600" />
                                                    Top Priority Actions
                                                </h4>
                                                <ul className="space-y-1.5">
                                                    {companyAIAnalysis.top_priority_actions.map((action: string, idx: number) => (
                                                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                            <span className="text-blue-600 font-bold">{idx + 1}.</span>
                                                            <span>{action}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-sm">Click "Find Matches" to see company opportunities with AI analysis</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Skills Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>Your Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {studentData?.skills?.map((skill: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div >
    )
}
