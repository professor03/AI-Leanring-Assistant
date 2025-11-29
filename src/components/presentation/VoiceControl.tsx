import { useEffect, useState } from 'react';

interface VoiceControlProps {
    isListening: boolean;
    onCommand: (command: string) => void;
    onError: (error: string) => void;
}

export default function VoiceControl({ isListening, onCommand, onError }: VoiceControlProps) {
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recog = new SpeechRecognition();
            recog.continuous = true;
            recog.interimResults = false;
            recog.lang = 'en-US'; // Default to English, could be configurable

            recog.onresult = (event: any) => {
                const last = event.results.length - 1;
                const command = event.results[last][0].transcript.trim().toLowerCase();
                console.log('Voice command received:', command);
                onCommand(command);
            };

            recog.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                onError(event.error);
            };

            setRecognition(recog);
        } else {
            onError('Speech recognition not supported in this browser.');
        }
    }, []);

    useEffect(() => {
        if (!recognition) return;

        if (isListening) {
            try {
                recognition.start();
            } catch (e) {
                // Already started
            }
        } else {
            try {
                recognition.stop();
            } catch (e) {
                // Already stopped
            }
        }
    }, [isListening, recognition]);

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            {isListening && (
                <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-4 border border-white/10 animate-fade-in-up">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-medium">正在聆聽...</span>
                    <div className="h-4 w-px bg-white/20" />
                    <div className="text-sm text-white/70 flex space-x-3">
                        <span>"下一頁"</span>
                        <span>"上一頁"</span>
                        <span>"打開筆記"</span>
                        <span>"打開聊天"</span>
                    </div>
                </div>
            )}
        </div>
    );
}
