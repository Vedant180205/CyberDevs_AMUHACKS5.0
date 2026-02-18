'use client'

import React, { useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Loader2,
    Search,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Database,
    ChevronRight,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Filter {
    field: string
    op: string
    value: string | number | string[]
}

interface ParsedQuery {
    filters: Filter[]
    sort_by?: string
    sort_order?: string
    limit?: number
}

interface StudentResult {
    name: string
    branch: string
    year: string
    prs_score?: number
    cgpa?: number
    github_analysis?: { github_score?: number }
    scores?: {
        linkedin?: number
        resume?: number
        aptitude?: number
        coding?: number
        softskills?: number
    }
}

interface NLQResponse {
    parsed_query: ParsedQuery
    results: StudentResult[]
    result_count: number
    cached: boolean
}

// ---------------------------------------------------------------------------
// Helper: human-readable operator label
// ---------------------------------------------------------------------------
const OP_LABELS: Record<string, string> = {
    eq: '=',
    gt: '>',
    gte: '≥',
    lt: '<',
    lte: '≤',
    in: 'in',
}

// ---------------------------------------------------------------------------
// Example queries shown as chips
// ---------------------------------------------------------------------------
const EXAMPLE_QUERIES = [
    'Show me TY ECS students with github score above 60',
    'Give me all students with prs score above 75',
    'List final year IT students with cgpa above 8',
    'Find CSE students with prs score between 40 and 70',
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdminAIQueryPanel() {
    const [queryText, setQueryText] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [response, setResponse] = useState<NLQResponse | null>(null)

    const runQuery = async (text?: string) => {
        const q = (text ?? queryText).trim()
        if (!q) return

        setLoading(true)
        setError(null)
        setResponse(null)

        try {
            const res = await api.post<NLQResponse>('/api/admin/ai-query', {
                query_text: q,
                limit: 50,
            })
            setResponse(res.data)
        } catch (err: any) {
            const detail =
                err?.response?.data?.detail ??
                'Something went wrong. Please try again.'
            setError(detail)
        } finally {
            setLoading(false)
        }
    }

    const handleExampleClick = (q: string) => {
        setQueryText(q)
        runQuery(q)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3">
                <Sparkles className="h-8 w-8 text-indigo-500" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight dark:text-slate-50">
                        Natural Language Query
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        Ask questions about students in plain English — powered by Groq AI
                    </p>
                </div>
            </div>

            {/* Search Box */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                id="nlq-input"
                                className="pl-9 text-base dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                                placeholder='e.g. "Show me TY ECS students with github score above 60"'
                                value={queryText}
                                onChange={(e) => setQueryText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') runQuery()
                                }}
                                disabled={loading}
                            />
                        </div>
                        <Button
                            id="nlq-run-btn"
                            onClick={() => runQuery()}
                            disabled={loading || !queryText.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[110px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Running…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Run Query
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Example chips */}
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-slate-400 self-center">Try:</span>
                        {EXAMPLE_QUERIES.map((q) => (
                            <button
                                key={q}
                                onClick={() => handleExampleClick(q)}
                                disabled={loading}
                                className="text-xs px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/10">
                    <CardContent className="flex items-start gap-3 pt-5">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Query Failed</p>
                            <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {response && (
                <>
                    {/* Interpreted Filters */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Interpreted Filters
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {response.cached && (
                                        <Badge variant="outline" className="text-xs text-slate-500">
                                            Cached
                                        </Badge>
                                    )}
                                    <Badge
                                        variant="outline"
                                        className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                                    >
                                        {response.result_count} result{response.result_count !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {response.parsed_query.filters.map((f, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 text-sm font-mono"
                                    >
                                        <span className="font-semibold">{f.field}</span>
                                        <span className="text-indigo-500">{OP_LABELS[f.op] ?? f.op}</span>
                                        <span>
                                            {Array.isArray(f.value) ? f.value.join(', ') : String(f.value)}
                                        </span>
                                    </span>
                                ))}
                                {response.parsed_query.filters.length === 0 && (
                                    <span className="text-sm text-slate-400">No filters applied (returning all students)</span>
                                )}
                            </div>
                            {response.parsed_query.sort_by && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <ChevronRight className="h-3 w-3" />
                                    Sorted by{' '}
                                    <span className="font-mono text-slate-700 dark:text-slate-300">
                                        {response.parsed_query.sort_by}
                                    </span>{' '}
                                    ({response.parsed_query.sort_order ?? 'desc'})
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Results Table */}
                    {response.results.length === 0 ? (
                        <Card className="border-dashed border-2 dark:border-slate-800 dark:bg-slate-900/50">
                            <CardContent className="flex flex-col items-center justify-center h-[160px] text-muted-foreground">
                                <Database className="h-10 w-10 mb-3 opacity-20" />
                                <p className="text-sm">No students matched your query.</p>
                                <p className="text-xs mt-1 text-slate-400">Try relaxing the filters.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="dark:bg-slate-900 dark:border-slate-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Student Results</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                                                    Name
                                                </th>
                                                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                                                    Branch
                                                </th>
                                                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                                                    Year
                                                </th>
                                                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                                                    PRS Score
                                                </th>
                                                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                                                    GitHub Score
                                                </th>
                                                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                                                    CGPA
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {response.results.map((student, idx) => {
                                                const githubScore =
                                                    student.github_analysis?.github_score ?? '—'
                                                const prs = student.prs_score ?? '—'
                                                const cgpa = student.cgpa ?? '—'

                                                // PRS badge colour
                                                const prsNum =
                                                    typeof student.prs_score === 'number'
                                                        ? student.prs_score
                                                        : -1
                                                const prsBadge =
                                                    prsNum >= 70
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                                        : prsNum >= 40
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                                                        : prsNum >= 0
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                                        : 'bg-slate-100 text-slate-500'

                                                return (
                                                    <tr
                                                        key={idx}
                                                        className="border-b last:border-0 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                                                            {student.name}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant="outline" className="text-xs">
                                                                {student.branch}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                            {student.year}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span
                                                                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${prsBadge}`}
                                                            >
                                                                {prs}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                                                            {githubScore}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                                                            {cgpa}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Empty state (before any query) */}
            {!response && !error && !loading && (
                <Card className="border-dashed border-2 dark:border-slate-800 dark:bg-slate-900/50">
                    <CardContent className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                        <Sparkles className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">Ask anything about your students</h3>
                        <p className="text-sm mt-1">
                            Type a natural language query above or click an example to get started.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
