'use client'

import React, { useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Bot, BrainCircuit, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function InsightsPage() {
    const [recommendations, setRecommendations] = useState<any>(null)
    const [loadingAI, setLoadingAI] = useState(false)
    const [selectedBranch, setSelectedBranch] = useState<string>("All")

    const generateRecommendations = async () => {
        setLoadingAI(true)
        try {
            const res = await api.post(`/api/admin/ai-recommendations?branch=${selectedBranch}`)
            setRecommendations(res.data)
        } catch (error) {
            console.error("Failed to generate recommendations:", error)
        } finally {
            setLoadingAI(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                    <BrainCircuit className="h-8 w-8 text-purple-600" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight dark:text-slate-50">AI Strategic Insights</h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Deep dive into batch performance and risk factors
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter Branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Branches</SelectItem>
                            <SelectItem value="CSE">CSE</SelectItem>
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="ECS">ECS</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        size="sm"
                        onClick={generateRecommendations}
                        disabled={loadingAI}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {loadingAI ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bot className="h-4 w-4 mr-2" />}
                        Generate Strategy
                    </Button>
                </div>
            </div>

            {/* Recommendations Section */}
            <div className="grid gap-6">
                {!recommendations ? (
                    <Card className="border-dashed border-2 dark:border-slate-800 dark:bg-slate-900/50">
                        <CardContent className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                            <Bot className="h-12 w-12 mb-4 opacity-20" />
                            <h3 className="text-lg font-medium">AI Strategy Generator</h3>
                            <p className="text-sm">Click "Generate Strategy" to analyze current {selectedBranch !== 'All' ? selectedBranch : ''} batch performance.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {recommendations.analysis_summary && (
                            <Card className="bg-purple-50/20 border-purple-200 dark:border-purple-900">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-purple-700 dark:text-purple-400">Executive Summary</CardTitle>
                                        <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            {selectedBranch} Analysis
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                        {recommendations.analysis_summary}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {recommendations.recommendations?.map((rec: any, idx: number) => (
                                <Card key={idx} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow dark:bg-slate-900 dark:border-slate-800">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="mb-2">{rec.target_batch}</Badge>
                                            <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'}>
                                                {rec.priority} Priority
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg">{rec.action_title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{rec.reason}</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono">
                                            Outcome: {rec.expected_outcome || "Performance Improvement"}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
