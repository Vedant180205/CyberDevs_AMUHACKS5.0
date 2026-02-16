import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface SkillData {
    skill: string
    count: number
}

interface SkillsRadialProps {
    data: SkillData[]
}

const COLORS = [
    '#1d4ed8', // blue-700
    '#2563eb', // blue-600
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#93c5fd', // blue-300
    '#7c3aed', // violet-600
    '#8b5cf6', // violet-500
    '#a78bfa', // violet-400
    '#c4b5fd', // violet-300
    '#ddd6fe', // violet-200
]

export function SkillsRadialChart({ data }: SkillsRadialProps) {
    // Take top 10 for radial (too many rings looks bad)
    const chartData = data.slice(0, 10).map((d, index) => ({
        name: d.skill,
        count: d.count,
        fill: COLORS[index % COLORS.length]
    }))

    if (!data || data.length === 0) {
        return (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No skill data available
            </div>
        )
    }

    const style = {
        top: '50%',
        right: 0,
        transform: 'translate(0, -50%)',
        lineHeight: '24px',
    };

    return (
        <Card className="col-span-2 dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="dark:text-slate-50">Top Skills Dominance</CardTitle>
                <CardDescription className="dark:text-slate-400">
                    Radial view of the 10 most popular skills among students
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            cx="40%"
                            cy="50%"
                            innerRadius="10%"
                            outerRadius="80%"
                            barSize={20}
                            data={chartData}
                        >
                            <RadialBar
                                label={{ position: 'insideStart', fill: '#fff' }}
                                background
                                dataKey="count"
                                cornerRadius={10}
                            />
                            <Legend
                                iconSize={10}
                                layout="vertical"
                                verticalAlign="middle"
                                wrapperStyle={style}
                                content={({ payload }) => (
                                    <ul className="list-none space-y-2">
                                        {payload?.map((entry: any, index: number) => (
                                            <li key={`item-${index}`} className="flex items-center text-sm font-medium dark:text-slate-300">
                                                <span
                                                    className="block w-3 h-3 rounded-full mr-2"
                                                    style={{ backgroundColor: entry.payload.fill }}
                                                />
                                                {entry.value}: <span className="ml-1 font-bold">{entry.payload.count}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--background)',
                                    borderColor: 'var(--border)',
                                    borderRadius: '8px'
                                }}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
