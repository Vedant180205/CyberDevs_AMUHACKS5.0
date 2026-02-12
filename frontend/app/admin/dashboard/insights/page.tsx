'use client'

import React, { useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Bot, BrainCircuit } from 'lucide-react'

export default function InsightsPage() {
    const [recommendations, setRecommendations] = useState<any>(null)
    const [loadingAI, setLoadingAI] = useState(false)

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <BrainCircuit className="h-8 w-8 text-purple-600" />
                    <h1 className="text-3xl font-bold tracking-tight">AI Strategic Insights</h1>
                    <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                </div>
                <Button
                    size="lg"
                    onClick={generateRecommendations}
                    disabled={loadingAI}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {loadingAI ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bot className="h-4 w-4 mr-2" />}
                    Generate New Strategy
                </Button>
            </div>

            <div className="grid gap-6">
                {!recommendations ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                            <Bot className="h-16 w-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-medium">No Analysis Generated</h3>
                            <p>Click the button above to analyze current batch performance using Groq AI.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card className="bg-purple-50/20 border-purple-200 dark:border-purple-900">
                            <CardHeader>
                                <CardTitle className="text-purple-700 dark:text-purple-400">Executive Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                    {recommendations.analysis_summary}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {recommendations.recommendations?.map((rec: any, idx: number) => (
                                <Card key={idx} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
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
                                            Expected Outcome: {rec.expected_outcome || "Performance Improvement"}
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
