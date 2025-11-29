import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresentationStore } from '../../store/usePresentationStore';
import Button from '../ui/Button';
import { clsx } from 'clsx';

interface PresentationWizardProps {
    onGenerate: (data: {
        topic: string;
        audience: string;
        vibe: string;
        theme: string;
        duration: number;
    }) => void;
    isGenerating: boolean;
    initialTopic?: string;
}

const STEPS = [
    { id: 'topic', title: '你想做什麼主題的簡報？', subtitle: '輸入關鍵字或完整主題' },
    { id: 'audience', title: '這份簡報是給誰看的？', subtitle: 'AI 會根據對象調整語氣' },
    { id: 'vibe', title: '你希望呈現什麼風格？', subtitle: '決定視覺與文字的氛圍' },
    { id: 'theme', title: '選擇一個配色主題', subtitle: '決定投影片的視覺基調' },
    { id: 'duration', title: '預計講多久？', subtitle: 'AI 會控制投影片的數量' },
];

const AUDIENCE_OPTIONS = [
    { id: 'classmates', label: '同學', icon: '🎓', desc: '輕鬆、互動、迷因' },
    { id: 'professor', label: '教授', icon: '👨‍🏫', desc: '學術、嚴謹、引用' },
    { id: 'investors', label: '投資人', icon: '💰', desc: '數據、願景、精簡' },
    { id: 'general', label: '大眾', icon: '🌍', desc: '通俗、故事、易懂' },
];

const VIBE_OPTIONS = [
    { id: 'fun', label: '幽默有趣', icon: '😂', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'serious', label: '專業嚴肅', icon: '👔', color: 'bg-slate-100 border-slate-300' },
    { id: 'tech', label: '未來科技', icon: '🤖', color: 'bg-blue-100 border-blue-300' },
    { id: 'minimal', label: '極簡主義', icon: '✨', color: 'bg-gray-100 border-gray-300' },
];

const THEME_OPTIONS = [
    { id: 'modern', label: 'Modern Blue', color: 'from-[#667eea] to-[#764ba2]' },
    { id: 'classic', label: 'Classic Light', color: 'from-[#f5f7fa] to-[#c3cfe2]' },
    { id: 'tech', label: 'Cyber Dark', color: 'from-[#0f2027] to-[#2c5364]' },
    { id: 'nature', label: 'Fresh Nature', color: 'from-[#56ab2f] to-[#a8e063]' },
    { id: 'minimal', label: 'Clean White', color: 'from-[#ffffff] to-[#e0e0e0]' },
    { id: 'playful', label: 'Playful Pop', color: 'from-[#f093fb] to-[#f5576c]' },
];

export default function PresentationWizard({ onGenerate, isGenerating, initialTopic = '' }: PresentationWizardProps) {
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        topic: initialTopic,
        audience: '',
        vibe: '',
        theme: 'modern',
        duration: 5,
    });

    const { setPreference } = usePresentationStore();

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            // Save preferences for future
            setPreference('defaultDuration', data.duration);
            onGenerate(data);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const isStepValid = () => {
        if (step === 0) return data.topic.length > 0;
        if (step === 1) return data.audience.length > 0;
        if (step === 2) return data.vibe.length > 0;
        if (step === 3) return data.theme.length > 0;
        return true;
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 min-h-[500px] flex flex-col">
            {/* Progress Bar */}
            <div className="h-2 bg-gray-100 w-full">
                <motion.div
                    className="h-full bg-primary-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <div className="flex-1 p-6 md:p-12 flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{STEPS[step].title}</h2>
                        <p className="text-gray-500 mb-6 md:mb-8">{STEPS[step].subtitle}</p>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {/* Step 1: Topic */}
                            {step === 0 && (
                                <input
                                    type="text"
                                    value={data.topic}
                                    onChange={(e) => setData({ ...data, topic: e.target.value })}
                                    placeholder="例如：量子力學的未來應用..."
                                    className="w-full text-xl md:text-2xl p-4 border-b-2 border-gray-200 focus:border-primary-500 outline-none bg-transparent transition-colors placeholder-gray-300"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && isStepValid() && handleNext()}
                                />
                            )}

                            {/* Step 2: Audience */}
                            {step === 1 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {AUDIENCE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setData({ ...data, audience: opt.id })}
                                            className={clsx(
                                                "p-4 md:p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02]",
                                                data.audience === opt.id
                                                    ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                                                    : "border-gray-100 hover:border-primary-200 hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="text-3xl md:text-4xl mb-3">{opt.icon}</div>
                                            <div className="font-bold text-gray-900">{opt.label}</div>
                                            <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Step 3: Vibe */}
                            {step === 2 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {VIBE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setData({ ...data, vibe: opt.id })}
                                            className={clsx(
                                                "p-4 md:p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02]",
                                                data.vibe === opt.id
                                                    ? "ring-2 ring-offset-2 ring-primary-500 scale-[1.02]"
                                                    : "border-transparent opacity-80 hover:opacity-100",
                                                opt.color
                                            )}
                                        >
                                            <div className="text-3xl md:text-4xl mb-3">{opt.icon}</div>
                                            <div className="font-bold text-gray-900">{opt.label}</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Step 4: Theme */}
                            {step === 3 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {THEME_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setData({ ...data, theme: opt.id })}
                                            className={clsx(
                                                "p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] relative overflow-hidden group h-24 sm:h-auto",
                                                data.theme === opt.id
                                                    ? "border-primary-500 ring-2 ring-primary-200"
                                                    : "border-gray-100 hover:border-primary-200"
                                            )}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${opt.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                            <div className="relative z-10 flex items-center h-full">
                                                <div className="font-bold text-white text-lg shadow-sm">{opt.label}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Step 5: Duration */}
                            {step === 4 && (
                                <div className="flex flex-col items-center justify-center h-full space-y-8">
                                    <div className="text-5xl md:text-6xl font-bold text-primary-600 font-mono">
                                        {data.duration} <span className="text-2xl text-gray-400">min</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="3"
                                        max="30"
                                        step="1"
                                        value={data.duration}
                                        onChange={(e) => setData({ ...data, duration: parseInt(e.target.value) })}
                                        className="w-full max-w-md h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                    />
                                    <p className="text-sm text-gray-500">
                                        預計生成 {Math.ceil(data.duration / 1.5)} - {Math.ceil(data.duration / 1)} 張投影片
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Footer Navigation */}
                <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-50">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 0 || isGenerating}
                        className={step === 0 ? 'invisible' : ''}
                    >
                        上一步
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={!isStepValid() || isGenerating}
                        className="px-8 py-3 text-lg rounded-xl shadow-lg shadow-primary-200"
                    >
                        {isGenerating ? '生成中...' : step === STEPS.length - 1 ? '✨ 開始生成魔法簡報' : '下一步 →'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
