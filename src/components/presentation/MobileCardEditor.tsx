import { motion } from 'framer-motion';
import type { PresentationDeck, PresentationSlide } from '../../lib/presentation-schema';

interface MobileCardEditorProps {
    deck: PresentationDeck;
    currentSlideIndex: number;
    onSlideSelect: (index: number) => void;
    onEditSlide: (slide: PresentationSlide) => void;
}

export default function MobileCardEditor({
    deck,
    currentSlideIndex,
    onSlideSelect,
    onEditSlide,
}: MobileCardEditorProps) {
    return (
        <div className="w-full max-w-md mx-auto pb-20 px-4 space-y-6">
            <div className="text-center py-6">
                <h2 className="text-2xl font-bold text-white mb-2">Story Mode</h2>
                <p className="text-gray-400 text-sm">Scroll to review, tap to edit</p>
            </div>

            {deck.slides.map((slide, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSlideSelect(index)}
                    className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 ${index === currentSlideIndex
                        ? 'border-primary-500 shadow-lg shadow-primary-500/20 scale-[1.02]'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                        }`}
                >
                    <div className="p-5 bg-gray-900 min-h-[160px] flex flex-col justify-center relative">
                        {/* Background hint */}
                        <div
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{
                                background: getThemeGradient(slide.theme || deck.globalTheme)
                            }}
                        />

                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 relative z-10">
                            {slide.content.title}
                        </h3>

                        {slide.content.subtitle && (
                            <p className="text-sm text-gray-400 mb-3 line-clamp-2 relative z-10">
                                {slide.content.subtitle}
                            </p>
                        )}

                        {/* Content Indicators */}
                        <div className="flex gap-2 mt-2 relative z-10">
                            {slide.content.bullets && slide.content.bullets.length > 0 && (
                                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700 flex items-center">
                                    📝 {slide.content.bullets.length}
                                </span>
                            )}
                            {slide.content.chartData && (
                                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700 flex items-center">
                                    📊 Chart
                                </span>
                            )}
                            {slide.content.diagramCode && (
                                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700 flex items-center">
                                    🔄 Flow
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-800 p-3 flex justify-end border-t border-gray-700">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditSlide(slide);
                            }}
                            className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span>✏️</span> Edit
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function getThemeGradient(theme: string = 'modern') {
    const gradients: Record<string, string> = {
        modern: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        classic: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        tech: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        nature: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
        minimal: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
        playful: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    };
    return gradients[theme] || gradients.modern;
}
