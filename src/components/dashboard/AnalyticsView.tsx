import { useAnalytics } from '../../hooks/useAnalytics';
import AIInsightPanel from '../analytics/AIInsightPanel';
import MemoryHealthChart from '../analytics/MemoryHealthChart';
import FocusEfficiencyChart from '../analytics/FocusEfficiencyChart';
import KnowledgeGalaxyChart from '../analytics/KnowledgeGalaxyChart';
import ConsistencyChart from '../analytics/ConsistencyChart';
import { motion } from 'framer-motion';

export default function AnalyticsView() {
    const analytics = useAnalytics();

    return (
        <div className="space-y-6">
            {/* AI Insights */}
            <AIInsightPanel insights={analytics.insights} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Row 1: Memory & Focus (Larger) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1"
                >
                    <MemoryHealthChart
                        retentionRate={analytics.memory.retentionRate}
                        riskItems={analytics.memory.riskItems}
                        totalQuestions={analytics.memory.totalQuestions}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <FocusEfficiencyChart data={analytics.focus.trends} />
                </motion.div>

                {/* Row 2: Knowledge & Consistency */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <KnowledgeGalaxyChart
                        totalNodes={analytics.knowledge.totalNodes}
                        connectionRate={analytics.knowledge.connectionRate}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <ConsistencyChart
                        streak={analytics.consistency.streak}
                        totalXP={analytics.consistency.totalXP}
                    />
                </motion.div>

                {/* Placeholder for future expansion */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center p-6 text-gray-400 min-h-[200px]"
                >
                    <div className="text-center">
                        <div className="text-2xl mb-2">🚀</div>
                        <p>更多分析功能開發中...</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
