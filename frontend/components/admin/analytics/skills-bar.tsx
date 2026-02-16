import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface SkillData {
    skill: string
    count: number
}

interface SkillsBarProps {
    data: SkillData[]
}

export function SkillsBarChart({ data }: SkillsBarProps) {
    // Top 15 skills for a good list view
    const chartData = data.slice(0, 15)

    if (!data || data.length === 0) {
        return (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No skill data available
            </div>
        )
    }

    return (
        <Card className="col-span-2 dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="dark:text-slate-50">Top Skills Ranking</CardTitle>
                <CardDescription className="dark:text-slate-400">
                    Most in-demand skills sorted by student proficiency count
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Taller height to accommodate 15 bars comfortably */}
                <div className="h-[600px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" opacity={0.5} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="skill"
                                type="category"
                                width={100}
                                tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                                contentStyle={{
                                    backgroundColor: '#334155',
                                    borderColor: '#475569',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    color: '#ffffff'
                                }}
                                itemStyle={{ color: '#ffffff' }}
                                labelStyle={{ color: '#ffffff' }}
                            />
                            <Bar
                                dataKey="count"
                                barSize={20}
                                radius={[0, 4, 4, 0]}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index < 3 ? '#2563eb' : '#60a5fa'} // Top 3 darker blue
                                    />
                                ))}
                                <LabelList
                                    dataKey="count"
                                    position="right"
                                    fill="#64748b"
                                    fontSize={12}
                                    fontWeight="bold"
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
