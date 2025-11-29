import { useState } from 'react';
import type { PresentationSlide } from '../../lib/presentation-schema';

interface EditSlideModalProps {
    slide: PresentationSlide;
    onSave: (updatedSlide: PresentationSlide) => void;
    onClose: () => void;
}

export default function EditSlideModal({ slide, onSave, onClose }: EditSlideModalProps) {
    const [title, setTitle] = useState(slide.content.title);
    const [subtitle, setSubtitle] = useState(slide.content.subtitle || '');
    const [mainPoint, setMainPoint] = useState(slide.content.mainPoint || '');
    const [bullets, setBullets] = useState(slide.content.bullets || []);

    const handleSave = () => {
        const updatedSlide: PresentationSlide = {
            ...slide,
            content: {
                ...slide.content,
                title,
                subtitle: subtitle || undefined,
                mainPoint: mainPoint || undefined,
                bullets: bullets.length > 0 ? bullets : undefined,
            },
        };
        onSave(updatedSlide);
        onClose();
    };

    const updateBullet = (index: number, value: string) => {
        const newBullets = [...bullets];
        newBullets[index] = value;
        setBullets(newBullets);
    };

    const addBullet = () => {
        setBullets([...bullets, '']);
    };

    const removeBullet = (index: number) => {
        setBullets(bullets.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">編輯投影片</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            標題 *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="投影片標題"
                        />
                    </div>

                    {/* Subtitle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            副標題
                        </label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="可選的副標題"
                        />
                    </div>

                    {/* Main Point */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            重點摘要
                        </label>
                        <textarea
                            value={mainPoint}
                            onChange={(e) => setMainPoint(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="這張投影片的核心重點"
                        />
                    </div>

                    {/* Bullets */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            條列項目
                        </label>
                        <div className="space-y-2">
                            {bullets.map((bullet, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={bullet}
                                        onChange={(e) => updateBullet(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder={`項目 ${index + 1}`}
                                    />
                                    <button
                                        onClick={() => removeBullet(index)}
                                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                    >
                                        −
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addBullet}
                                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                            >
                                + 新增項目
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    >
                        儲存變更
                    </button>
                </div>
            </div>
        </div>
    );
}
