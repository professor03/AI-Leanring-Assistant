import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { DailyMission } from '../../types/memory';

interface MissionCardProps {
    mission: DailyMission;
}

export default function MissionCard({ mission }: MissionCardProps) {
    const progressPercent = Math.min((mission.progress / mission.target) * 100, 100);

    return (
        <div className={clsx(
            "relative overflow-hidden rounded-2xl p-4 border transition-all duration-300",
            mission.completed
                ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-200 shadow-sm"
                : "bg-white border-gray-100 hover:border-gray-200"
        )}>
            {/* Background Pattern for completed */}
            {mission.completed && (
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <div className="text-6xl">🏆</div>
                </div>
            )}

            <div className="flex items-start gap-4 relative z-10">
                <div className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm",
                    mission.completed ? "bg-amber-100" : "bg-gray-50"
                )}>
                    {mission.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={clsx(
                            "font-bold truncate",
                            mission.completed ? "text-amber-900" : "text-gray-900"
                        )}>
                            {mission.description}
                        </h4>
                        {mission.completed && (
                            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                                COMPLETED
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>+{mission.rewardXP} XP</span>
                        <span>{mission.progress} / {mission.target}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className={clsx(
                                "h-full rounded-full",
                                mission.completed ? "bg-amber-500" : "bg-primary-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
