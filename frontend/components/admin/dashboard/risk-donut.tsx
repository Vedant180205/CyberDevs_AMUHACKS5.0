import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = {
    red: "#ef4444",    // Red-500
    yellow: "#eab308", // Yellow-500
    green: "#22c55e",  // Green-500
}

interface RiskDonutProps {
    data: {
        red: number
        yellow: number
        green: number
    }
}

export function RiskDonutChart({ data }: RiskDonutProps) {
    const chartData = [
        { name: "High Risk (<40)", value: data.red, color: COLORS.red },
        { name: "Medium Risk (40-60)", value: data.yellow, color: COLORS.yellow },
        { name: "Job Ready (>60)", value: data.green, color: COLORS.green },
    ]

    // Filter out zero values to avoid ugly empty segments if desired, 
    // but usually showing 0 is fine. 
    // We want to ensure at least some data exists to render.
    const hasData = chartData.some(d => d.value > 0)

    if (!hasData) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No student data available
            </div>
        )
    }

    return (
        <Card className="col-span-1 dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold dark:text-slate-50">
                    Risk Segmentation
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#334155', // Slate-700
                                    borderColor: '#475569',     // Slate-600
                                    borderRadius: '6px',
                                    color: '#ffffff'
                                }}
                                itemStyle={{ color: '#ffffff' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => <span className="text-sm dark:text-slate-300">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
