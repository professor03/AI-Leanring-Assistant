import { useState, useEffect } from 'react';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

interface SpeakerNotesPanelProps {
    notes: string;
    onChange: (notes: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
    </svg>
);

export default function SpeakerNotesPanel({
    notes,
    onChange,
    isOpen,
    onClose,
}: SpeakerNotesPanelProps) {
    const [localNotes, setLocalNotes] = useState(notes);
    const { speak, pause, resume, stop, isSpeaking, isPaused, voices, selectedVoice, selectVoice, supported } = useTextToSpeech();

    // Sync local state when prop changes (e.g., slide navigation)
    useEffect(() => {
        setLocalNotes(notes);
    }, [notes]);

    // Stop speech when panel closes or notes change significantly (optional, but good UX)
    useEffect(() => {
        if (!isOpen) {
            stop();
        }
    }, [isOpen, stop]);

    const handlePlayPause = () => {
        if (isSpeaking && !isPaused) {
            pause();
        } else if (isPaused) {
            resume();
        } else {
            speak(localNotes || "No notes to read.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="h-full bg-gray-900 border-l border-gray-800 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                <span className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Speaker Notes
                </span>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Audio Controls */}
            {supported && (
                <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700 flex items-center space-x-2">
                    <button
                        onClick={handlePlayPause}
                        className={`p-2 rounded-full transition-colors ${isSpeaking && !isPaused ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                        title={isSpeaking && !isPaused ? "Pause" : "Read Aloud"}
                    >
                        {isSpeaking && !isPaused ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button
                        onClick={stop}
                        className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Stop"
                        disabled={!isSpeaking && !isPaused}
                    >
                        <StopIcon />
                    </button>

                    <div className="flex-1 min-w-0 ml-2">
                        <select
                            value={selectedVoice?.name || ''}
                            onChange={(e) => selectVoice(e.target.value)}
                            className="w-full bg-gray-900 text-xs text-gray-400 border border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                        >
                            {voices.map((voice) => (
                                <option key={voice.name} value={voice.name}>
                                    {voice.name.replace('Microsoft', '').replace('Google', '').trim()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <textarea
                value={localNotes}
                onChange={(e) => {
                    setLocalNotes(e.target.value);
                    onChange(e.target.value);
                }}
                className="flex-1 w-full bg-gray-900 text-gray-300 p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                placeholder="Add speaker notes here..."
            />
        </div>
    );
}
