import React from 'react';
import Draggable from 'react-draggable';

interface DraggableElementProps {
    children: React.ReactNode;
    isEditing: boolean;
    defaultPosition?: { x: number; y: number };
    className?: string;
}

export default function DraggableElement({ children, isEditing, defaultPosition = { x: 0, y: 0 }, className = '' }: DraggableElementProps) {
    if (!isEditing) {
        return <div className={className}>{children}</div>;
    }

    return (
        <Draggable defaultPosition={defaultPosition} bounds="parent">
            <div className={`inline-block cursor-move ${className} border-2 border-dashed border-blue-500/50 hover:border-blue-500 rounded-lg transition-colors relative z-50 bg-black/20 backdrop-blur-sm`}>
                {children}
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                </div>
            </div>
        </Draggable>
    );
}
