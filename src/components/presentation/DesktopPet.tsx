import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DesktopPetProps {
    mood: 'idle' | 'thinking' | 'happy' | 'confused' | 'listening';
    message?: string;
    onClick?: () => void;
}

export default function DesktopPet({ mood, message, onClick }: DesktopPetProps) {
    const [localMessage, setLocalMessage] = useState<string | null>(null);

    useEffect(() => {
        if (message) {
            setLocalMessage(message);
            const timer = setTimeout(() => setLocalMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handlePetClick = () => {
        if (onClick) {
            onClick();
        } else {
            // Default behavior: show a random tip if no onClick provided
            const tips = [
                "Keep your slides simple!",
                "Use high-quality images.",
                "Don't read from the slides.",
                "Practice makes perfect!",
                "Engage your audience.",
                "Less is more.",
                "Check your contrast.",
                "Tell a story."
            ];
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            setLocalMessage(randomTip);
            setTimeout(() => setLocalMessage(null), 4000);
        }
    };

    // Animation variants
    const containerVariants = {
        idle: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 3 } },
        thinking: { rotate: [0, 10, -10, 0], transition: { repeat: Infinity, duration: 1 } },
        happy: { scale: [1, 1.1, 1], transition: { duration: 0.5 } },
        confused: { x: [0, -5, 5, 0], transition: { duration: 0.5 } },
        listening: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 0.5 } },
    };

    const eyeVariants = {
        idle: { scaleY: [1, 0.1, 1], transition: { repeat: Infinity, delay: 2, duration: 0.2 } },
        thinking: { scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 0.5 } },
        happy: { scaleY: 0.5, transition: { duration: 0.2 } },
        confused: { scaleY: 1 },
        listening: { scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 0.2 } },
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {localMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className="mb-4 bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-br-none shadow-xl border border-gray-200 max-w-xs pointer-events-auto"
                    >
                        <p className="text-sm font-medium">{localMessage}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                variants={containerVariants}
                animate={mood}
                onClick={handlePetClick}
                className="w-24 h-24 cursor-pointer pointer-events-auto filter drop-shadow-lg hover:drop-shadow-2xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Body */}
                    <rect x="20" y="30" width="60" height="50" rx="10" fill="#4F46E5" />
                    <rect x="25" y="35" width="50" height="40" rx="5" fill="#E0E7FF" opacity="0.2" />

                    {/* Head */}
                    <rect x="30" y="10" width="40" height="25" rx="5" fill="#4338CA" />

                    {/* Antenna */}
                    <line x1="50" y1="10" x2="50" y2="0" stroke="#4338CA" strokeWidth="3" />
                    <circle cx="50" cy="0" r="3" fill="#EF4444">
                        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
                    </circle>

                    {/* Eyes */}
                    <motion.g variants={eyeVariants} animate={mood}>
                        <circle cx="40" cy="22" r="4" fill="#E0E7FF" />
                        <circle cx="60" cy="22" r="4" fill="#E0E7FF" />
                    </motion.g>

                    {/* Mouth */}
                    {mood === 'happy' ? (
                        <path d="M 40 40 Q 50 45 60 40" stroke="#E0E7FF" strokeWidth="2" strokeLinecap="round" />
                    ) : mood === 'thinking' ? (
                        <line x1="40" y1="40" x2="60" y2="40" stroke="#E0E7FF" strokeWidth="2" strokeLinecap="round" />
                    ) : mood === 'listening' ? (
                        <circle cx="50" cy="42" r="3" stroke="#E0E7FF" strokeWidth="2" />
                    ) : (
                        <path d="M 40 42 Q 50 45 60 42" stroke="#E0E7FF" strokeWidth="2" strokeLinecap="round" />
                    )}

                    {/* Arms */}
                    <path d="M 20 45 L 10 55" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 80 45 L 90 55" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" />
                </svg>
            </motion.div>
        </div>
    );
}
