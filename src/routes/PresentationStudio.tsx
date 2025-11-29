import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { generatePresentation } from '../lib/presentation-generator';
import type { PresentationDeck, PresentationSlide } from '../lib/presentation-schema';
import type { ResearchResult } from '../types';
import PresentationWizard from '../components/presentation/PresentationWizard';
import SlideRenderer from '../components/presentation/SlideRenderer';
import VoiceControl from '../components/presentation/VoiceControl';
import SpeakerNotesPanel from '../components/presentation/SpeakerNotesPanel';
import EditSlideModal from '../components/presentation/EditSlideModal';
import ImageEditorModal from '../components/presentation/ImageEditorModal';
import ResearchReview from '../components/presentation/ResearchReview';
import Button from '../components/ui/Button';
import { usePresentationExport } from '../hooks/usePresentationExport';

// Inline Icons
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

const PencilSquareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

const ArrowDownTrayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const CursorArrowRaysIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
    </svg>
);

export default function PresentationStudio() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setPetMessage, setChatOpen, setPetMood, gainXP } = useAppStore();

    const [presentation, setPresentation] = useState<PresentationDeck | null>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDesignMode, setIsDesignMode] = useState(false);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [editingImage, setEditingImage] = useState<{ url: string; prompt?: string } | null>(null);

    const [researchContext, setResearchContext] = useState<{ topic: string; results: ResearchResult[] } | null>(
        location.state?.researchContext || null
    );
    const [isReviewing, setIsReviewing] = useState(!!location.state?.researchContext);

    const { isExporting, handleExportPPTX, handleExportPDF } = usePresentationExport({
        deck: presentation,
        currentSlideIndex,
        setCurrentSlideIndex,
        setPetMood,
        setPetMessage
    });

    useEffect(() => {
        if (isGenerating) {
            setPetMessage("正在為您生成簡報魔法... ✨");
        } else if (isExporting) {
            setPetMessage("正在匯出您的傑作... 📤");
        } else if (presentation) {
            setPetMessage(null);
        }
    }, [isGenerating, isExporting, presentation, setPetMessage]);

    const handleGenerate = async (params: { topic: string; audience: string; vibe: string; theme: string; duration: number }) => {
        setIsGenerating(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 90) progress = 90;
            setGenerationProgress(progress);
        }, 500);

        try {
            const deck = await generatePresentation({
                ...params,
                researchContext: researchContext || undefined
            });
            clearInterval(interval);
            setGenerationProgress(100);
            setPresentation(deck);
            setCurrentSlideIndex(0);
            gainXP(25);
            setPetMessage("簡報生成完成！試試語音控制？ 🎤 (+25 XP)");
            setTimeout(() => setPetMessage(null), 3000);
        } catch (error) {
            clearInterval(interval);
            console.error("Generation failed:", error);
            setPetMessage("哎呀,生成失敗了。請再試一次! 😢");
        } finally {
            setIsGenerating(false);
            setGenerationProgress(0);
        }
    };

    const handleNextSlide = () => {
        if (presentation && currentSlideIndex < presentation.slides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
        }
    };

    const handlePrevSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
        }
    };

    const handleVoiceCommand = (command: string) => {
        console.log("Voice command:", command);
        if (command.includes('next') || command.includes('下一頁')) handleNextSlide();
        if (command.includes('back') || command.includes('上一頁')) handlePrevSlide();
        if (command.includes('notes') || command.includes('筆記')) setIsNotesOpen(true);
        if (command.includes('chat') || command.includes('聊天')) setChatOpen(true);
    };

    const handleSaveSlide = (updatedSlide: PresentationSlide) => {
        if (!presentation) return;
        const newSlides = [...presentation.slides];
        newSlides[currentSlideIndex] = updatedSlide;
        setPresentation({ ...presentation, slides: newSlides });
        setIsEditing(false);
    };

    const handleUpdateNotes = (notes: string) => {
        if (!presentation) return;
        const newSlides = [...presentation.slides];
        newSlides[currentSlideIndex] = { ...newSlides[currentSlideIndex], speakerNotes: notes };
        setPresentation({ ...presentation, slides: newSlides });
    };

    const handleRemix = () => {
        if (!presentation) return;
        const currentSlide = presentation.slides[currentSlideIndex];
        const layouts = ['bullet-points', 'section-header', 'split_left', 'split_right', 'image_focus', 'quote', 'timeline', 'comparison', 'statistic-focus', 'feature-grid-3', 'bento-grid'];
        const availableLayouts = layouts.filter(l => l !== currentSlide.layout);
        const randomLayout = availableLayouts[Math.floor(Math.random() * availableLayouts.length)];
        const updatedSlide = { ...currentSlide, layout: randomLayout };
        handleSaveSlide(updatedSlide as PresentationSlide);
        setPetMessage("✨ Magic Remix! 換個風格試試!");
        setTimeout(() => setPetMessage(null), 2000);
    };

    const handleEditImage = (url: string, prompt?: string) => {
        setEditingImage({ url, prompt });
    };

    const handleSaveImage = (newUrl: string, newPrompt?: string) => {
        if (!presentation) return;
        const newSlides = [...presentation.slides];
        newSlides[currentSlideIndex] = {
            ...newSlides[currentSlideIndex],
            content: { ...newSlides[currentSlideIndex].content, backgroundImage: newUrl, imagePrompt: newPrompt }
        };
        setPresentation({ ...presentation, slides: newSlides });
        setEditingImage(null);
    };

    const handleReviewConfirm = (finalResults: ResearchResult[]) => {
        if (researchContext) {
            setResearchContext({ ...researchContext, results: finalResults });
        }
        setIsReviewing(false);
    };

    if (!presentation) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
                <div className="w-full max-w-4xl">
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-4xl font-bold text-gray-900">Presentation Studio</h1>
                    </div>
                    {isReviewing && researchContext ? (
                        <ResearchReview initialResults={researchContext.results} onConfirm={handleReviewConfirm} onBack={() => navigate(-1)} />
                    ) : !isGenerating ? (
                        <PresentationWizard onGenerate={handleGenerate} isGenerating={isGenerating} initialTopic={researchContext?.topic} />
                    ) : (
                        <div className="mt-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-full">
                                <div className="flex justify-between text-sm text-gray-500 mb-2">
                                    <span>AI 正在思考架構...</span>
                                    <span>{Math.round(generationProgress)}%</span>
                                </div>
                                <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner w-full">
                                    <motion.div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" initial={{ width: 0 }} animate={{ width: `${generationProgress}%` }} transition={{ duration: 0.5 }} />
                                </div>
                                <p className="text-center text-gray-400 text-sm mt-4 animate-pulse">正在分析大數據、建構 SCQA 邏輯、生成圖表...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const currentSlide = presentation.slides[currentSlideIndex];

    return (
        <div className="h-screen w-full bg-gray-900 flex flex-col overflow-hidden relative">
            <div className="bg-gray-800 border-b border-gray-700 flex flex-wrap items-center justify-between px-4 py-2 md:px-6 md:h-16 z-20 shadow-md gap-2">
                <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
                    <div className="flex items-center space-x-1 mr-1 md:mr-2">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-400 hover:text-white p-1 md:p-2" title="上一頁"><ChevronLeftIcon /></Button>
                        <Button variant="ghost" onClick={() => navigate(1)} className="text-gray-400 hover:text-white p-1 md:p-2" title="下一頁"><ChevronRightIcon /></Button>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-300 hover:text-white hidden md:flex"><HomeIcon /></Button>
                    <span className="text-white font-medium truncate max-w-[150px] md:max-w-xs text-sm md:text-base">{presentation.title}</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2 overflow-x-auto no-scrollbar">
                    <Button variant="ghost" onClick={() => setIsNotesOpen(!isNotesOpen)} className={`text-gray-300 hover:text-white p-2 ${isNotesOpen ? 'bg-gray-700' : ''}`} title={isNotesOpen ? "隱藏講者筆記" : "顯示講者筆記"}>
                        <DocumentTextIcon /><span className="ml-2 hidden lg:inline">筆記</span>
                    </Button>
                    <div className="h-4 md:h-6 w-px bg-gray-700 mx-1 md:mx-2" />
                    <Button variant="secondary" onClick={handleRemix} title="隨機切換版型" className="px-2 md:px-4 text-xs md:text-sm"><SparklesIcon /><span className="hidden md:inline">Remix</span></Button>
                    <Button variant="secondary" onClick={() => setIsDesignMode(!isDesignMode)} className={`px-2 md:px-4 text-xs md:text-sm ${isDesignMode ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`} title={isDesignMode ? "關閉設計模式" : "開啟設計模式"}>
                        <CursorArrowRaysIcon /><span className="hidden md:inline">Design</span>
                    </Button>
                    <Button variant="secondary" onClick={() => setIsEditing(true)} title="編輯投影片" className="px-2 md:px-4 text-xs md:text-sm"><PencilSquareIcon /><span className="hidden md:inline">編輯</span></Button>
                    <div className="relative group">
                        <Button variant="primary" onClick={handleExportPPTX} disabled={isExporting} className="px-2 md:px-4 text-xs md:text-sm">
                            <ArrowDownTrayIcon /><span className="hidden md:inline">{isExporting ? '匯出中...' : 'PPTX'}</span><span className="inline md:hidden">PPTX</span>
                        </Button>
                    </div>
                    <Button variant="secondary" onClick={handleExportPDF} disabled={isExporting} className="px-2 md:px-4 text-xs md:text-sm"><span className="hidden md:inline">PDF</span><span className="inline md:hidden">PDF</span></Button>
                </div>
            </div>
            <div className="flex-1 relative flex items-center justify-center bg-gray-950 p-4 md:p-8 transition-all duration-300 ease-in-out" style={{ marginRight: isNotesOpen ? '20rem' : '0' }}>
                <div className="aspect-video w-full max-h-full shadow-2xl rounded-xl overflow-hidden bg-black relative ring-1 ring-white/10">
                    <AnimatePresence mode="wait">
                        <SlideRenderer key={currentSlide.id} slide={currentSlide} slideNumber={currentSlideIndex + 1} totalSlides={presentation.slides.length} theme={presentation.globalTheme} isExporting={isExporting} onEditImage={handleEditImage} isDesignMode={isDesignMode} />
                    </AnimatePresence>
                </div>
                <button onClick={handlePrevSlide} disabled={currentSlideIndex === 0} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-0 transition-all backdrop-blur-sm z-10"><ChevronLeftIcon /></button>
                <button onClick={handleNextSlide} disabled={currentSlideIndex === presentation.slides.length - 1} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-0 transition-all backdrop-blur-sm z-10"><ChevronRightIcon /></button>
            </div>
            <motion.div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-gray-800 shadow-xl z-10" initial={{ x: '100%' }} animate={{ x: isNotesOpen ? '0%' : '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <SpeakerNotesPanel notes={currentSlide.speakerNotes} onChange={handleUpdateNotes} isOpen={true} onClose={() => setIsNotesOpen(false)} />
            </motion.div>
            <VoiceControl onCommand={handleVoiceCommand} isListening={false} onError={(err) => console.error("Voice Error:", err)} />
            {isEditing && <EditSlideModal slide={currentSlide} onSave={handleSaveSlide} onClose={() => setIsEditing(false)} />}
            <AnimatePresence>{editingImage && <ImageEditorModal currentImage={editingImage.url} currentPrompt={editingImage.prompt} onSave={handleSaveImage} onClose={() => setEditingImage(null)} />}</AnimatePresence>
        </div>
    );
}
