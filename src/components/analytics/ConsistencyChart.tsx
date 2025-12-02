import Card from '../ui/Card';

interface ConsistencyChartProps {
    streak: number;
    totalXP: number;
}

export default function ConsistencyChart({ streak, totalXP }: ConsistencyChartProps) {
    return (
        <Card className="p-6 h-full bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
            <h3 className="font-bold text-orange-900 mb-6 flex items-center gap-2">
                <span className="text-xl">🔥</span> 學習慣性
            </h3>

            <div className="flex items-center justify-center py-4">
                <div className="text-center">
                    <div className="text-6xl font-black text-orange-500 mb-2">{streak}</div>
                    <div className="text-sm text-orange-700 font-medium bg-orange-200/50 px-3 py-1 rounded-full inline-block">
                        連續天數
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between bg-white/60 p-3 rounded-xl">
                <span className="text-sm text-orange-800">總累積 XP</span>
                <span className="font-bold text-orange-600">{totalXP} XP</span>
            </div>
        </Card>
    );
}
