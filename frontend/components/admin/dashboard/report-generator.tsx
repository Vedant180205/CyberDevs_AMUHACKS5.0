'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileDown, Loader2 } from 'lucide-react'
import api from '@/lib/api'

export function ReportGenerator() {
    const [branch, setBranch] = useState<string>('All')
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        setLoading(true)
        try {
            // Note: Since we need to download a file, we use responseType: 'blob'
            const response = await api.get(`/api/admin/report/branch?branch=${encodeURIComponent(branch)}`, {
                responseType: 'blob'
            })
            
            // Create a temporary link to download the blob
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            
            // Safe filename fallback
            const safeBranch = branch === 'All' ? 'All_Branches' : branch.replace(/\s+/g, '_')
            link.setAttribute('download', `CampusIQ_${safeBranch}_Report.pdf`)
            
            document.body.appendChild(link)
            link.click()
            
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
        } catch (error) {
            console.error('Failed to download PDF:', error)
            alert('Failed to generate report. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10">
            <CardHeader className="pb-3">
                <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2 text-lg">
                    <FileDown className="h-5 w-5" />
                    Professional Reports
                </CardTitle>
                <CardDescription className="text-blue-600/80 dark:text-blue-400">
                    Generate and download a comprehensive batch placement readiness PDF report.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="space-y-1.5 w-full sm:w-[200px]">
                        <label className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                            Select Branch
                        </label>
                        <Select value={branch} onValueChange={setBranch}>
                            <SelectTrigger className="bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 focus:ring-blue-500">
                                <SelectValue placeholder="All Branches" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Branches</SelectItem>
                                <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                                <SelectItem value="IT">Information Tech (IT)</SelectItem>
                                <SelectItem value="ECS">Electronics (ECS)</SelectItem>
                                <SelectItem value="AI&DS">AI & Data Science</SelectItem>
                                <SelectItem value="MECH">Mechanical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Button 
                        onClick={handleDownload} 
                        disabled={loading}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                            <><FileDown className="mr-2 h-4 w-4" /> Download PDF</>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
