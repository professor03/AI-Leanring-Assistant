import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateChatResponse } from '../../lib/presentation-generator';
import type { PresentationSlide } from '../../lib/presentation-schema';

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
}

interface PresentationChatProps {
    isOpen: boolean;
    onClose: () => void;
    currentSlide: PresentationSlide;
    deckTitle: string;
    deckTheme: string;
    currentSlideIndex: number;
}

export default function PresentationChat({
    isOpen,
    onClose,
    currentSlide,
    deckTitle,
    deckTheme,
    currentSlideIndex,
}: PresentationChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'model',
            content: 'Hi! I\'m your AI presentation coach. How can I help you improve this slide?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare history for API (excluding the welcome message if needed, or keeping it)
            const history = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, content: m.content }));

            const responseText = await generateChatResponse(
                history,
                {
                    slideContent: currentSlide.content,
                    deckTitle,
                    deckTheme,
                    currentSlideIndex,
                },
                text
            );

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: responseText,
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: 'Sorry, I encountered an error. Please try again.',
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedPrompts = [
        "Improve this slide",
        "Suggest a better title",
        "Make it punchier",
        "Add a joke"
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl">🤖</span>
                            <div>
                                <h3 className="font-bold text-white">AI Coach</h3>
                                <p className="text-xs text-gray-400">Context-aware assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                            ? 'bg-primary-600 text-white rounded-br-none'
                                            : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 rounded-2xl px-4 py-3 rounded-bl-none border border-gray-700">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Prompts */}
                    <div className="p-4 pt-0">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {suggestedPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => handleSend(prompt)}
                                    disabled={isLoading}
                                    className="whitespace-nowrap px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs text-gray-300 transition-colors disabled:opacity-50"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-700 bg-gray-800">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me anything..."
                                disabled={isLoading}
                                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isLoading || !input.trim()}
                                className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
