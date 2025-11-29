import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import mermaid from 'mermaid';
import type { PresentationSlide, SlideTheme } from '../../lib/presentation-schema';
import DraggableElement from './DraggableElement';

// Helper for chart colors
const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

interface EditableImageProps {
    src: string;
    alt: string;
    className?: string;
    prompt?: string;
    onEdit?: (url: string, prompt?: string) => void;
}

const EditableImage: React.FC<EditableImageProps> = ({ src, alt, className, prompt, onEdit }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`relative group cursor-pointer ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(src, prompt);
            }}
        >
            <img src={src} alt={alt} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0 opacity-100'}`}>
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

interface SlideRendererProps {
    slide: PresentationSlide;
    slideNumber: number;
    totalSlides: number;
    theme?: SlideTheme;
    isExporting?: boolean;
    onEditImage?: (url: string, prompt?: string) => void;
    isDesignMode?: boolean;
}

export default function SlideRenderer({ slide, slideNumber, totalSlides, theme = 'modern', isExporting = false, onEditImage, isDesignMode = false }: SlideRendererProps) {
    const mermaidRef = useRef<HTMLDivElement>(null);
    const [mermaidSvg, setMermaidSvg] = useState<string>('');

    useEffect(() => {
        if (slide.content.diagramCode && mermaidRef.current) {
            mermaid.initialize({ startOnLoad: true, theme: 'dark', securityLevel: 'loose' });
            mermaid.render(`mermaid-${slide.id}`, slide.content.diagramCode).then((result) => {
                setMermaidSvg(result.svg);
            });
        }
    }, [slide.content.diagramCode, slide.id]);

    const getBackgroundStyle = () => {
        const currentTheme = slide.theme || theme;
        switch (currentTheme) {
            case 'modern': return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
            case 'classic': return 'linear-gradient(135deg, #3f2e3e 0%, #2c1b2d 100%)'; // Elegant dark purple/brown
            case 'tech': return 'linear-gradient(135deg, #000000 0%, #111111 100%)';
            case 'nature': return 'linear-gradient(135deg, #14532d 0%, #064e3b 100%)';
            case 'minimal': return '#000000';
            case 'playful': return 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)';
            default: return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
        }
    };

    const getAnim = (delay: number) => ({
        initial: isExporting ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: isExporting ? 0 : delay }
    });

    const renderChart = () => {
        return (
            <ResponsiveContainer width="100%" height="100%">
                {slide.content.chartType === 'bar' ? (
                    <BarChart data={slide.content.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="name" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                        <YAxis stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} isAnimationActive={!isExporting}>
                            {slide.content.chartData?.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                ) : (
                    <PieChart>
                        <Pie data={slide.content.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" isAnimationActive={!isExporting}>
                            {slide.content.chartData?.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    </PieChart>
                )}
            </ResponsiveContainer>
        );
    };
    const renderContent = () => {
        switch (slide.layout) {
            case 'title':
                return (
                    <div className="text-center max-w-4xl px-4">
                        <DraggableElement isEditing={isDesignMode} className="mb-4 md:mb-6">
                            <motion.h1 {...getAnim(0.2)} className="text-4xl md:text-7xl font-bold text-white leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                                {slide.content.title}
                            </motion.h1>
                        </DraggableElement>
                        <DraggableElement isEditing={isDesignMode} className="mb-8 md:mb-12">
                            <motion.p {...getAnim(0.4)} className="text-xl md:text-3xl text-white/80 font-light">
                                {slide.content.subtitle}
                            </motion.p>
                        </DraggableElement>
                        <motion.div {...getAnim(0.6)} className="mt-8 md:mt-12 w-16 md:w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
                    </div>
                );

            case 'section-header':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <motion.div {...getAnim(0.2)} className="text-6xl md:text-9xl font-bold text-white/5 mb-[-1rem] md:mb-[-2rem] z-0 select-none">
                            {slideNumber}
                        </motion.div>
                        <DraggableElement isEditing={isDesignMode} className="z-10 relative">
                            <motion.h2 {...getAnim(0.3)} className="text-3xl md:text-6xl font-bold text-white">
                                {slide.content.title}
                            </motion.h2>
                        </DraggableElement>
                        <motion.div {...getAnim(0.4)} className="mt-6 md:mt-8 flex items-center space-x-4">
                            <div className="h-px w-8 md:w-12 bg-white/30" />
                            <span className="text-base md:text-xl text-white/60 uppercase tracking-widest">{slide.content.subtitle || 'Section'}</span>
                            <div className="h-px w-8 md:w-12 bg-white/30" />
                        </motion.div>
                    </div>
                );

            case 'bullet-points':
                return (
                    <div className="w-full max-w-5xl px-4 md:px-0">
                        <DraggableElement isEditing={isDesignMode} className="mb-6 md:mb-12">
                            <motion.h2 {...getAnim(0.1)} className="text-3xl md:text-5xl font-bold text-white border-l-4 md:border-l-8 border-blue-500 pl-4 md:pl-6">
                                {slide.content.title}
                            </motion.h2>
                        </DraggableElement>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                            <div className="space-y-4 md:space-y-6">
                                {slide.content.bullets?.map((bullet: string, index: number) => (
                                    <motion.div key={index} {...getAnim(0.3 + index * 0.1)} className="flex items-start space-x-3 md:space-x-4 group">
                                        <div className="flex-shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 mt-2 md:mt-3 rounded-full bg-blue-400 group-hover:scale-150 transition-transform" />
                                        <p className="text-lg md:text-xl text-white/90 leading-relaxed">{bullet}</p>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="flex items-center justify-center hidden md:flex">
                                {slide.content.backgroundImage ? (
                                    <motion.div {...getAnim(0.4)} className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                        <EditableImage src={slide.content.backgroundImage} alt="Illustration" prompt={slide.content.imagePrompt} onEdit={onEditImage} />
                                    </motion.div>
                                ) : (
                                    <div className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <span className="text-white/20 text-6xl">📝</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'split_left':
                return (
                    <div className="w-full h-full flex flex-col md:flex-row">
                        <motion.div {...getAnim(0.2)} className="w-full md:w-1/2 h-48 md:h-full relative overflow-hidden flex-shrink-0">
                            {slide.content.backgroundImage ? (
                                <EditableImage src={slide.content.backgroundImage} alt="Visual" className="w-full h-full" prompt={slide.content.imagePrompt} onEdit={onEditImage} />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                                    <span className="text-white/20 text-2xl md:text-4xl">Image Placeholder</span>
                                </div>
                            )}
                        </motion.div>
                        <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center overflow-y-auto max-h-full custom-scrollbar">
                            <motion.h2 {...getAnim(0.3)} className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">{slide.content.title}</motion.h2>
                            <motion.p {...getAnim(0.4)} className="text-lg md:text-xl text-white/80 mb-6 md:mb-8 leading-relaxed">{slide.content.mainPoint}</motion.p>
                            <ul className="space-y-3 md:space-y-4">
                                {slide.content.bullets?.map((bullet: string, i: number) => (
                                    <motion.li key={i} {...getAnim(0.5 + i * 0.1)} className="flex items-start text-white/70 text-sm md:text-base">
                                        <span className="mr-3 text-blue-400">•</span>{bullet}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );

            case 'split_right':
                return (
                    <div className="w-full h-full flex flex-col-reverse md:flex-row">
                        <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center overflow-y-auto max-h-full custom-scrollbar">
                            <motion.h2 {...getAnim(0.3)} className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">{slide.content.title}</motion.h2>
                            <motion.p {...getAnim(0.4)} className="text-lg md:text-xl text-white/80 mb-6 md:mb-8 leading-relaxed">{slide.content.mainPoint}</motion.p>
                            <ul className="space-y-3 md:space-y-4">
                                {slide.content.bullets?.map((bullet: string, i: number) => (
                                    <motion.li key={i} {...getAnim(0.5 + i * 0.1)} className="flex items-start text-white/70 text-sm md:text-base">
                                        <span className="mr-3 text-purple-400">•</span>{bullet}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                        <motion.div {...getAnim(0.2)} className="w-full md:w-1/2 h-48 md:h-full relative overflow-hidden flex-shrink-0">
                            {slide.content.backgroundImage ? (
                                <EditableImage src={slide.content.backgroundImage} alt="Visual" className="w-full h-full" prompt={slide.content.imagePrompt} onEdit={onEditImage} />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-bl from-pink-600/20 to-orange-600/20 flex items-center justify-center">
                                    <span className="text-white/20 text-2xl md:text-4xl">Image Placeholder</span>
                                </div>
                            )}
                        </motion.div>
                    </div>
                );

            case 'image_focus':
                return (
                    <div className="w-full h-full relative">
                        {slide.content.backgroundImage && (
                            <div className="absolute inset-0">
                                <EditableImage src={slide.content.backgroundImage} alt="Background" className="w-full h-full" prompt={slide.content.imagePrompt} onEdit={onEditImage} />
                                <div className="absolute inset-0 bg-black/50" />
                            </div>
                        )}
                        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center p-6 md:p-8">
                            <motion.h2 {...getAnim(0.2)} className="text-4xl md:text-7xl font-bold text-white mb-6 md:mb-8 drop-shadow-lg">{slide.content.title}</motion.h2>
                            <motion.div {...getAnim(0.4)} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 max-w-2xl">
                                <p className="text-lg md:text-2xl text-white font-medium">{slide.content.mainPoint}</p>
                            </motion.div>
                        </div>
                    </div>
                );

            case 'bento-grid':
                return (
                    <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-full">
                            <motion.div {...getAnim(0.1)} className="col-span-1 md:col-span-2 row-span-1 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-center min-h-[150px]">
                                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">{slide.content.title}</h2>
                                <p className="text-lg md:text-xl text-white/80">{slide.content.subtitle}</p>
                            </motion.div>
                            <motion.div {...getAnim(0.2)} className="col-span-1 row-span-1 md:row-span-2 relative rounded-2xl overflow-hidden border border-white/10 min-h-[200px]">
                                {slide.content.backgroundImage ? (
                                    <EditableImage src={slide.content.backgroundImage} alt="Visual" className="w-full h-full" prompt={slide.content.imagePrompt} onEdit={onEditImage} />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                        <span className="text-4xl">🖼️</span>
                                    </div>
                                )}
                            </motion.div>
                            <motion.div {...getAnim(0.3)} className="col-span-1 row-span-1 bg-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 min-h-[150px]">
                                <h3 className="text-lg md:text-xl font-bold text-blue-200 mb-2">Key Point</h3>
                                <p className="text-white/90 text-sm md:text-base">{slide.content.mainPoint}</p>
                            </motion.div>
                            <motion.div {...getAnim(0.4)} className="col-span-1 row-span-1 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 overflow-y-auto custom-scrollbar min-h-[150px]">
                                <ul className="space-y-2">
                                    {slide.content.bullets?.map((b, i) => (
                                        <li key={i} className="text-sm text-white/70">• {b}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                );

            case 'timeline':
                return (
                    <div className="w-full h-full flex flex-col p-4 md:p-8">
                        <motion.h2 {...getAnim(0.1)} className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12 text-center">{slide.content.title}</motion.h2>
                        <div className="flex-1 flex flex-col md:flex-row items-center justify-between relative space-y-8 md:space-y-0 overflow-y-auto md:overflow-visible">
                            {/* Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20 -translate-y-1/2 hidden md:block" />
                            <div className="absolute left-1/2 top-0 w-1 h-full bg-white/20 -translate-x-1/2 block md:hidden" />

                            {slide.content.bullets?.map((point: string, i: number) => (
                                <motion.div key={i} {...getAnim(0.2 + i * 0.1)} className="relative z-10 flex flex-row md:flex-col items-center w-full md:w-auto">
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-4 border-primary-500 mb-0 md:mb-4 mr-4 md:mr-0 flex-shrink-0" />
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full md:w-48 text-left md:text-center">
                                        <p className="text-white text-sm">{point}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );

            case 'comparison':
                return (
                    <div className="w-full h-full flex flex-col p-4 md:p-8">
                        <motion.h2 {...getAnim(0.1)} className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8 text-center">{slide.content.title}</motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 flex-1 overflow-y-auto">
                            <motion.div {...getAnim(0.2)} className="bg-red-500/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-red-500/30 overflow-y-auto max-h-full custom-scrollbar">
                                <h3 className="text-xl md:text-2xl font-bold text-red-200 mb-4 sticky top-0 bg-inherit pb-2">Before / Problem</h3>
                                <ul className="space-y-3 md:space-y-4">
                                    {slide.content.bullets?.slice(0, Math.ceil((slide.content.bullets?.length || 0) / 2)).map((b: string, i: number) => (
                                        <li key={i} className="text-white/80 flex items-start text-sm md:text-base"><span className="mr-2 text-red-400">✕</span>{b}</li>
                                    ))}
                                </ul>
                            </motion.div>
                            <motion.div {...getAnim(0.3)} className="bg-green-500/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-green-500/30 overflow-y-auto max-h-full custom-scrollbar">
                                <h3 className="text-xl md:text-2xl font-bold text-green-200 mb-4 sticky top-0 bg-inherit pb-2">After / Solution</h3>
                                <ul className="space-y-3 md:space-y-4">
                                    {slide.content.bullets?.slice(Math.ceil((slide.content.bullets?.length || 0) / 2)).map((b: string, i: number) => (
                                        <li key={i} className="text-white/80 flex items-start text-sm md:text-base"><span className="mr-2 text-green-400">✓</span>{b}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                );

            case 'statistic-focus':
                return (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <div className="text-center">
                            <motion.h2 {...getAnim(0.1)} className="text-2xl md:text-3xl text-white/60 mb-4">{slide.content.title}</motion.h2>
                            <motion.div {...getAnim(0.2)} className="text-8xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 leading-none">
                                {slide.content.chartData?.[0]?.value || "85%"}
                            </motion.div>
                            <motion.p {...getAnim(0.3)} className="text-2xl md:text-4xl text-white font-medium mt-4">
                                {slide.content.mainPoint}
                            </motion.p>
                        </div>
                    </div>
                );

            case 'feature-grid-3':
                return (
                    <div className="w-full h-full flex flex-col p-4 md:p-8">
                        <motion.h2 {...getAnim(0.1)} className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12 text-center">{slide.content.title}</motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 flex-1 overflow-y-auto">
                            {slide.content.bullets?.slice(0, 3).map((feature: string, i: number) => (
                                <motion.div key={i} {...getAnim(0.2 + i * 0.1)} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 md:mb-6 text-xl md:text-2xl">✨</div>
                                    <p className="text-lg md:text-xl text-white font-medium">{feature}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );


            case 'team-grid':
                return (
                    <div className="w-full h-full flex flex-col p-4 md:p-8">
                        <motion.h2 {...getAnim(0.1)} className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12 text-center">{slide.content.title}</motion.h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 flex-1 overflow-y-auto">
                            {slide.content.bullets?.slice(0, 4).map((member: string, i: number) => (
                                <motion.div key={i} {...getAnim(0.2 + i * 0.1)} className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 mb-4 border-4 border-white/20" />
                                    <h3 className="text-lg md:text-xl font-bold text-white">{member.split(':')[0]}</h3>
                                    <p className="text-xs md:text-sm text-white/60">{member.split(':')[1] || 'Team Member'}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );

            case 'quote':
                return (
                    <div className="w-full h-full flex flex-col justify-center items-center text-center max-w-4xl p-4 md:p-8">
                        <motion.div {...getAnim(0.2)} className="text-4xl md:text-6xl text-primary-400 mb-4 md:mb-6">"</motion.div>
                        <motion.blockquote {...getAnim(0.3)} className="text-2xl md:text-5xl font-serif italic text-white leading-tight mb-6 md:mb-8">
                            {slide.content.mainPoint || slide.content.title}
                        </motion.blockquote>
                        <motion.cite {...getAnim(0.4)} className="text-lg md:text-xl text-white/60 not-italic">
                            — {slide.content.subtitle || 'Source'}
                        </motion.cite>
                    </div>
                );

            case 'call-to-action':
                return (
                    <div className="w-full h-full flex flex-col justify-center items-center text-center space-y-8 md:space-y-12 p-4">
                        <motion.h1 {...getAnim(0.2)} className="text-4xl md:text-7xl font-bold text-white">
                            {slide.content.title}
                        </motion.h1>
                        <motion.div {...getAnim(0.3)} className="bg-white text-gray-900 px-8 md:px-12 py-4 md:py-6 rounded-full text-xl md:text-2xl font-bold hover:scale-105 transition-transform cursor-pointer shadow-xl">
                            {slide.content.mainPoint || "Get Started"}
                        </motion.div>
                        <motion.p {...getAnim(0.4)} className="text-lg md:text-xl text-white/60 max-w-2xl">
                            {slide.content.subtitle}
                        </motion.p>
                    </div>
                );

            case 'data-chart':
                return (
                    <div className="w-full h-full flex flex-col p-4">
                        <div className="flex-none mb-4 text-center">
                            <motion.h2 {...getAnim(0.1)} className="text-2xl md:text-4xl font-bold text-white mb-2">
                                {slide.content.title}
                            </motion.h2>
                            {slide.content.subtitle && (
                                <motion.p {...getAnim(0.2)} className="text-base md:text-lg text-white/70">
                                    {slide.content.subtitle}
                                </motion.p>
                            )}
                        </div>

                        <div className="flex-1 min-h-0 bg-gray-900/50 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col relative overflow-hidden">
                            <motion.div {...getAnim(0.3)} className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    {slide.content.chartType === 'bar' ? (
                                        <BarChart data={slide.content.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#fff"
                                                tick={{ fill: '#fff', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                                            />
                                            <YAxis
                                                stroke="#fff"
                                                tick={{ fill: '#fff', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                itemStyle={{ color: '#fff' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                            <Bar
                                                dataKey="value"
                                                fill="url(#colorGradient)"
                                                radius={[4, 4, 0, 0]}
                                                isAnimationActive={!isExporting}
                                            >
                                                {slide.content.chartData?.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    ) : slide.content.chartType === 'line' ? (
                                        <LineChart data={slide.content.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                            <XAxis dataKey="name" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                                            <YAxis stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                            <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={3} dot={{ fill: CHART_COLORS[0], r: 4 }} activeDot={{ r: 6 }} isAnimationActive={!isExporting} />
                                        </LineChart>
                                    ) : (
                                        <PieChart>
                                            <Pie
                                                data={slide.content.chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                isAnimationActive={!isExporting}
                                            >
                                                {slide.content.chartData?.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                        </PieChart>
                                    )}
                                </ResponsiveContainer>
                            </motion.div>

                            {slide.content.mainPoint && (
                                <motion.div {...getAnim(0.4)} className="mt-4 text-center">
                                    <p className="text-sm md:text-lg text-white font-medium bg-white/10 inline-block px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                        💡 {slide.content.mainPoint}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                );

            // Default fallback for other layouts
            default:
                return (
                    <div className="max-w-5xl w-full space-y-4 md:space-y-8 p-4">
                        <motion.h1 {...getAnim(0.2)} className="text-3xl md:text-6xl font-bold text-white leading-tight">
                            {slide.content.title}
                        </motion.h1>
                        {slide.content.subtitle && (
                            <motion.p {...getAnim(0.3)} className="text-xl md:text-2xl text-white/80">
                                {slide.content.subtitle}
                            </motion.p>
                        )}
                        {slide.content.mainPoint && (
                            <motion.div {...getAnim(0.4)} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20">
                                <p className="text-lg md:text-xl text-white font-medium">{slide.content.mainPoint}</p>
                            </motion.div>
                        )}
                        {slide.content.bullets && (
                            <motion.ul {...getAnim(0.5)} className="space-y-3 md:space-y-4">
                                {slide.content.bullets.map((bullet, index) => (
                                    <motion.li key={index} {...getAnim(0.6 + index * 0.1)} className="flex items-start space-x-4">
                                        <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm md:text-base">{index + 1}</span>
                                        <span className="text-base md:text-lg text-white/90 flex-1">{bullet}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                        {slide.content.chartData && (
                            <motion.div {...getAnim(0.7)} className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-4 md:p-8 border border-white/10 h-64 md:h-96">
                                {renderChart()}
                            </motion.div>
                        )}
                        {slide.content.diagramCode && (
                            <motion.div {...getAnim(0.7)} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 md:p-8 border border-white/10 flex justify-center overflow-x-auto" ref={mermaidRef} dangerouslySetInnerHTML={{ __html: mermaidSvg }} />
                        )}
                    </div>
                );
        }
    };

    return (
        <motion.div
            initial={isExporting ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: isExporting ? 0 : 0.5, ease: 'easeOut' }}
            className="w-full h-full flex flex-col justify-center items-center p-8 md:p-16 relative overflow-hidden"
            style={{ background: getBackgroundStyle() }}
        >
            {/* Slide Number */}
            <div className="absolute top-8 right-8 text-white/60 text-sm font-mono z-20">
                {slideNumber} / {totalSlides}
            </div>

            {renderContent()}
        </motion.div>
    );
}

