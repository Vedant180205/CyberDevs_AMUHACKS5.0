import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface BatchRiskData {
    batch: string
    red: number
    yellow: number
    green: number
    total: number
}

interface BatchRiskChartProps {
    data: BatchRiskData[]
}

const COLORS = {
    red: '#ef4444',    // red-500
    yellow: '#eab308', // yellow-500
    green: '#22c55e'   // green-500
}

export function BatchRiskChart({ data }: BatchRiskChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No batch data available
            </div>
        )
    }

    return (
        <Card className="col-span-1 dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="dark:text-slate-50">Batch Risk Distribution</CardTitle>
                <CardDescription className="dark:text-slate-400">
                    Risk levels across different batches (Year + Branch)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                            <XAxis
                                dataKey="batch"
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
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
                            <Bar dataKey="red" name="High Risk (<40)" stackId="a" fill={COLORS.red} radius={[0, 0, 4, 4]} />
                            <Bar dataKey="yellow" name="Medium Risk (40-60)" stackId="a" fill={COLORS.yellow} />
                            <Bar dataKey="green" name="Job Ready (>60)" stackId="a" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
