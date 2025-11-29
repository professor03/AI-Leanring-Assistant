import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

interface ImageEditorModalProps {
    currentImage: string;
    currentPrompt?: string;
    onSave: (newImageUrl: string, newPrompt?: string) => void;
    onClose: () => void;
}

export default function ImageEditorModal({ currentImage, currentPrompt, onSave, onClose }: ImageEditorModalProps) {
    const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('upload');
    const [previewUrl, setPreviewUrl] = useState(currentImage);
    const [prompt, setPrompt] = useState(currentPrompt || '');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        try {
            // Use Pollinations API
            const encodedPrompt = encodeURIComponent(prompt);
            const newUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

            // Pre-load image to ensure it works
            const img = new Image();
            img.src = newUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            setPreviewUrl(newUrl);
        } catch (error) {
            console.error("Image generation failed", error);
            alert("生成失敗，請稍後再試");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        onSave(previewUrl, activeTab === 'generate' ? prompt : undefined);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">編輯圖片</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        📤 上傳圖片
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'generate' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('generate')}
                    >
                        ✨ AI 生成
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Preview Area */}
                    <div className="mb-6 aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center relative group">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400">預覽圖片</span>
                        )}
                    </div>

                    {activeTab === 'upload' ? (
                        <div className="space-y-4">
                            <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                <div className="text-gray-600">
                                    <span className="block text-2xl mb-2">📁</span>
                                    <span className="font-medium">點擊選擇檔案</span>
                                    <span className="block text-xs text-gray-400 mt-1">支援 JPG, PNG, WebP</span>
                                </div>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">AI 提示詞 (Prompt)</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                                    placeholder="描述您想要的圖片..."
                                />
                            </div>
                            <Button
                                variant="secondary"
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt}
                                className="w-full justify-center"
                            >
                                {isGenerating ? '生成中...' : '🪄 重新生成'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                    <Button variant="ghost" onClick={onClose}>取消</Button>
                    <Button variant="primary" onClick={handleSave}>確認使用</Button>
                </div>
            </motion.div>
        </div>
    );
}
