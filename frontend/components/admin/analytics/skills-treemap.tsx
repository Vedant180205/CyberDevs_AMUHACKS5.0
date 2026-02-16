import { ResponsiveContainer, Treemap, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState } from 'react'

interface SkillData {
    skill: string
    count: number
}

interface SkillsTreemapProps {
    data: SkillData[]
}

const COLORS = [
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#2563eb', // blue-600
    '#93c5fd', // blue-300
    '#1d4ed8', // blue-700
    '#8b5cf6', // violet-500
    '#a78bfa', // violet-400
    '#7c3aed', // violet-600
]

const CustomContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, value, colors } = props

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: colors[index % colors.length],
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {width > 50 && height > 30 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={14}
                    fontWeight="bold"
                    dy={-5} // Move up slightly
                >
                    {name}
                </text>
            )}
            {width > 50 && height > 30 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                    dy={12} // Move down
                >
                    {value}
                </text>
            )}
        </g>
    )
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border rounded-lg shadow-lg p-2 text-sm z-50">
                <p className="font-semibold">{payload[0].payload.name}</p>
                <p className="text-muted-foreground">Students: {payload[0].value}</p>
            </div>
        )
    }
    return null
}

export function SkillsTreemap({ data }: SkillsTreemapProps) {
    // Transform data for Recharts Treemap
    // It expects a nested structure usually, but works with flat if we use dataKey
    // But for better coloring, let's just pass array and let it handle
    const chartData = data.map(d => ({
        name: d.skill,
        size: d.count
    }))

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
                <CardTitle className="dark:text-slate-50">Skill Proficiency Landscape</CardTitle>
                <CardDescription className="dark:text-slate-400">
                    Sized by number of students possessing each skill
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={chartData}
                            dataKey="size"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomContent colors={COLORS} />}
                            isAnimationActive={false}
                        >
                            <Tooltip content={<CustomTooltip />} />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
