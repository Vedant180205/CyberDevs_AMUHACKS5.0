import React from 'react'
import { ReportGenerator } from '@/components/admin/dashboard/report-generator'

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-50">Reports Engine</h1>
                <p className="text-muted-foreground mt-2">Generate and download batch-wise performance and placement readiness reports.</p>
            </div>
            
            <div className="max-w-3xl">
                <ReportGenerator />
            </div>
        </div>
    )
}
