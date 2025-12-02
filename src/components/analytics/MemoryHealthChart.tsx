import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';

interface MemoryHealthChartProps {
    retentionRate: number;
    riskItems: number;
    totalQuestions: number;
}

export default function MemoryHealthChart({ retentionRate, riskItems, totalQuestions }: MemoryHealthChartProps) {
    const data = [
        { value: retentionRate },
        { value: 100 - retentionRate }
    ];

    const color = retentionRate >= 80 ? '#22c55e' : retentionRate >= 60 ? '#eab308' : '#ef4444';

    return (
        <Card className="p-6 h-full">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-xl">🧠</span> 記憶健康度
            </h3>

            <div className="flex flex-row md:flex-col items-center justify-between md:justify-center">
                <div className="h-40 w-40 relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill={color} />
                                <Cell fill="#f1f5f9" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-black text-gray-800">{retentionRate}%</span>
                        <span className="text-xs text-gray-500 font-medium">留存率</span>
                    </div>
                </div>

                <div className="flex-1 pl-6 md:pl-0 md:pt-6 md:w-full space-y-3">
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                        <div className="text-xs text-red-600 font-medium mb-1">遺忘危險區</div>
                        <div className="text-2xl font-bold text-red-700">{riskItems} <span className="text-sm font-normal text-red-500">個知識點</span></div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <div className="text-xs text-blue-600 font-medium mb-1">總複習題數</div>
                        <div className="text-2xl font-bold text-blue-700">{totalQuestions} <span className="text-sm font-normal text-blue-500">題</span></div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
