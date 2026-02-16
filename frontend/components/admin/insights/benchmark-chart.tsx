import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface BatchData {
    batch: string
    avg_prs: number
}

interface BenchmarkChartProps {
    data: BatchData[]
}

export function BenchmarkChart({ data }: BenchmarkChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No benchmarking data available
            </div>
        )
    }

    return (
        <Card className="col-span-1 dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="dark:text-slate-50">Performance vs Benchmark</CardTitle>
                <CardDescription className="dark:text-slate-400">
                    Average PRS by Batch compared to Industry Standard (60)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                            <XAxis
                                dataKey="batch"
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                                contentStyle={{
                                    backgroundColor: '#334155',
                                    borderColor: '#475569',
                                    borderRadius: '6px',
                                    color: '#ffffff'
                                }}
                                itemStyle={{ color: '#ffffff' }}
                                labelStyle={{ color: '#ffffff' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <ReferenceLine y={60} label="Target (60)" stroke="red" strokeDasharray="3 3" />
                            <Bar dataKey="avg_prs" name="Avg PRS" barSize={40} radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.avg_prs >= 60 ? '#22c55e' : entry.avg_prs >= 40 ? '#eab308' : '#ef4444'} />
                                ))}
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
