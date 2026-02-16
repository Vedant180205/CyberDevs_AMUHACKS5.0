"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle, FileText, Upload } from "lucide-react"
import api from "@/lib/api"

interface ResumeAnalyzerProps {
    studentData: any
    onUpdate: () => void
}

export function ResumeAnalyzer({ studentData, onUpdate }: ResumeAnalyzerProps) {
    const [analyzing, setAnalyzing] = useState(false)

    const resume = studentData?.resume
    const hasResume = !!resume?.raw_text

    const handleAnalyze = async () => {
        setAnalyzing(true)
        try {
            await api.post("/api/student/analyze-resume")
            onUpdate() // Refresh data
        } catch (error) {
            console.error("Analysis failed:", error)
            alert("Failed to analyze resume. Please try again.")
        } finally {
            setAnalyzing(false)
        }
    }

    if (!hasResume) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Resume Analysis</CardTitle>
                    <CardDescription>Upload your resume in Profile Settings to unlock AI insights.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6 text-gray-400">
                    <FileText className="h-12 w-12 mb-2" />
                    <p>No resume uploaded yet.</p>
                </CardContent>
            </Card>
        )
    }

    const { resume_score, ats_score, missing_sections, profile_mismatches, suggestions, last_analyzed_at } = resume

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-500"
        if (score >= 60) return "bg-yellow-500"
        return "bg-red-500"
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>Resume Intelligence</CardTitle>
                    <CardDescription>AI-powered ATS & Quality Analysis</CardDescription>
                </div>
                <Button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    size="sm"
                    variant={last_analyzed_at ? "outline" : "default"}
                >
                    {analyzing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            {last_analyzed_at ? "Re-Analyze" : "Analyze Now"}
                        </>
                    )}
                </Button>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Resume Score</span>
                            <span className={resume_score >= 80 ? "text-green-600" : "text-yellow-600"}>{resume_score}/100</span>
                        </div>
                        <Progress value={resume_score} className={getScoreColor(resume_score)} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>ATS Compatibility</span>
                            <span className={ats_score >= 80 ? "text-green-600" : "text-yellow-600"}>{ats_score}/100</span>
                        </div>
                        <Progress value={ats_score} className={getScoreColor(ats_score)} />
                    </div>
                </div>

                {/* Suggestions & Issues */}
                <div className="space-y-4">
                    {missing_sections?.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                            <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> Missing Sections
                            </h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {missing_sections.map((sec: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="bg-white text-red-600 border-red-200">
                                        {sec}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile_mismatches?.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                            <h4 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> Profile Mismatches
                            </h4>
                            <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
                                {profile_mismatches.map((m: string, i: number) => (
                                    <li key={i}>{m}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {suggestions?.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-500" /> Improvement Suggestions
                            </h4>
                            <ul className="space-y-1">
                                {suggestions.map((s: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-200 pl-2 border-l-2 border-blue-200">
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
