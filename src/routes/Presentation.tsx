import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import type { ResearchResult } from '../types';

interface Slide {
    title: string;
    content: string;
    type: 'cover' | 'content' | 'end';
    source?: string;
    imagePrompt?: string;
}

const Presentation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const results = (location.state?.results as ResearchResult[]) || [];
    const topic = (location.state?.topic as string) || '研究報告';

    const [currentSlide, setCurrentSlide] = useState(0);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'Escape') {
                navigate('/research');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide]);

    if (!results.length) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <p className="text-xl text-gray-500">沒有可顯示的簡報內容</p>
                <Button onClick={() => navigate('/research')}>返回研究</Button>
            </div>
        );
    }

    const slides: Slide[] = [
        {
            title: topic,
            content: '研究報告簡報',
            type: 'cover',
        },
        ...results.map((r) => ({
            title: r.title,
            content: r.summary,
            source: r.sourceUrl,
            imagePrompt: r.imagePrompt,
            type: 'content' as const,
        })),
        {
            title: '謝謝聆聽',
            content: 'Q & A',
            type: 'end',
        },
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) setCurrentSlide((p) => p + 1);
    };

    const handlePrev = () => {
        if (currentSlide > 0) setCurrentSlide((p) => p - 1);
    };

    const slide = slides[currentSlide];

    // Generate better image URL using Unsplash Source with keywords
    const getImageUrl = (prompt?: string) => {
        if (!prompt) return '';
        // Extract keywords (first 3 words) for better relevance
        const keywords = prompt.split(' ').slice(0, 3).join(',');
        return `https://source.unsplash.com/800x600/?${encodeURIComponent(keywords)}`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] space-y-8 py-8">
            {/* Slide Container */}
            <div className="w-full max-w-5xl aspect-[16/9] bg-white rounded-3xl shadow-2xl overflow-hidden relative flex flex-col transition-all duration-500 border border-gray-100">

                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600" />

                <div className="flex-1 flex flex-col p-12 md:p-16">
                    {/* Slide Header */}
                    <div className="mb-8">
                        <h1 className={`font-bold text-primary-900 leading-tight ${slide.type === 'cover' ? 'text-5xl md:text-6xl text-center mt-20' : 'text-3xl md:text-4xl'
                            }`}>
                            {slide.title}
                        </h1>
                        {slide.type !== 'cover' && <div className="w-20 h-1 bg-primary-200 mt-4 rounded-full" />}
                    </div>

                    {/* Slide Content Layout */}
                    <div className={`flex-1 ${slide.type === 'content' ? 'grid grid-cols-1 md:grid-cols-2 gap-8 items-center' : 'flex flex-col justify-center items-center'}`}>

                        {/* Text Content */}
                        <div className="prose prose-lg text-gray-600 max-w-none">
                            <p className={`${slide.type === 'cover' ? 'text-2xl text-center' : 'text-lg leading-relaxed'}`}>
                                {slide.content}
                            </p>
                            {slide.source && (
                                <p className="text-sm text-gray-400 mt-6 not-prose">
                                    資料來源: <a href={slide.source} target="_blank" rel="noreferrer" className="hover:underline text-primary-500 truncate inline-block max-w-xs align-bottom">{slide.source}</a>
                                </p>
                            )}
                        </div>

                        {/* Image Content (Only for content slides) */}
                        {slide.type === 'content' && slide.imagePrompt && (
                            <div className="relative group rounded-2xl overflow-hidden shadow-lg aspect-video bg-gray-100">
                                <img
                                    src={getImageUrl(slide.imagePrompt)}
                                    alt={slide.imagePrompt}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[10px] text-white truncate">Prompt: {slide.imagePrompt}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Progress */}
                <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-center text-gray-400 text-sm font-mono border-t border-gray-50 bg-gray-50/50">
                    <span>{topic}</span>
                    <span>{currentSlide + 1} / {slides.length}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100">
                <Button variant="ghost" onClick={handlePrev} disabled={currentSlide === 0} className="rounded-full w-12 h-12 !p-0 flex items-center justify-center">
                    ←
                </Button>
                <span className="text-sm text-gray-500 font-medium">
                    使用鍵盤方向鍵切換
                </span>
                <Button variant="ghost" onClick={handleNext} disabled={currentSlide === slides.length - 1} className="rounded-full w-12 h-12 !p-0 flex items-center justify-center">
                    →
                </Button>
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <Button variant="secondary" onClick={() => navigate('/research')} className="text-sm">
                    結束放映
                </Button>
            </div>
        </div>
    );
};

export default Presentation;
