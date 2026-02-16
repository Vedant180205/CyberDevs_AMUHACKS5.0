import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import api from '@/lib/api'

export function CompanyFunnelChart() {
    const [companies, setCompanies] = useState<any[]>([])
    const [selectedCompany, setSelectedCompany] = useState<string>("")
    const [funnelData, setFunnelData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    // Fetch list of companies for dropdown
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await api.get('/api/admin/companies')
                setCompanies(res.data)
                if (res.data.length > 0) {
                    setSelectedCompany(res.data[0]._id)
                }
            } catch (err) {
                console.error("Failed to fetch companies", err)
            }
        }
        fetchCompanies()
    }, [])

    // Fetch funnel data when company changes
    useEffect(() => {
        if (!selectedCompany) return

        const fetchFunnel = async () => {
            setLoading(true)
            try {
                const res = await api.get(`/api/admin/company-funnel?company_id=${selectedCompany}`)
                setFunnelData(res.data)
            } catch (err) {
                console.error("Failed to fetch funnel data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchFunnel()
    }, [selectedCompany])

    if (!selectedCompany && companies.length === 0) {
        return <div className="h-[300px] flex items-center justify-center">Loading Companies...</div>
    }

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="dark:text-slate-50">Recruitment Eligibility Funnel</CardTitle>
                    <CardDescription className="dark:text-slate-400">
                        {funnelData ? `${funnelData.role} @ ${funnelData.company_name}` : "Select a company"}
                    </CardDescription>
                </div>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                        {companies.map((c: any) => (
                            <SelectItem key={c._id} value={c._id}>
                                {c.company_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={funnelData?.funnel || []}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="stage"
                                    type="category"
                                    width={120}
                                    tick={{ fontSize: 12 }}
                                    interval={0}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                                    contentStyle={{
                                        backgroundColor: '#334155',
                                        borderColor: '#475569',
                                        borderRadius: '6px',
                                        color: '#ffffff'
                                    }}
                                    itemStyle={{ color: '#ffffff' }}
                                    labelStyle={{ color: '#ffffff' }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
                                    {
                                        funnelData?.funnel.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))
                                    }
                                    <LabelList dataKey="count" position="right" fill="var(--foreground)" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
