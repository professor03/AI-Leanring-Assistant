import React, { useState, useRef, useEffect } from 'react';

interface DraggableElementProps {
    children: React.ReactNode;
    isEditing: boolean;
    defaultPosition?: { x: number; y: number };
    className?: string;
}

export default function DraggableElement({
    children,
    isEditing,
    defaultPosition = { x: 0, y: 0 },
    className = ''
}: DraggableElementProps) {
    const [position, setPosition] = useState(defaultPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isEditing || !isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!elementRef.current) return;

            const parent = elementRef.current.parentElement;
            if (!parent) return;

            const parentRect = parent.getBoundingClientRect();
            const elementRect = elementRef.current.getBoundingClientRect();

            let newX = e.clientX - parentRect.left - dragOffset.x;
            let newY = e.clientY - parentRect.top - dragOffset.y;

            // Constrain to parent bounds
            newX = Math.max(0, Math.min(newX, parentRect.width - elementRect.width));
            newY = Math.max(0, Math.min(newY, parentRect.height - elementRect.height));

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, isEditing]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isEditing || !elementRef.current) return;

        e.preventDefault();
        const rect = elementRef.current.getBoundingClientRect();
        const parentRect = elementRef.current.parentElement?.getBoundingClientRect();

        if (!parentRect) return;

        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setIsDragging(true);
    };

    if (!isEditing) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            ref={elementRef}
            onMouseDown={handleMouseDown}
            className={`inline-block ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className} border-2 border-dashed border-blue-500/50 hover:border-blue-500 rounded-lg transition-colors relative z-50 bg-black/20 backdrop-blur-sm`}
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                userSelect: 'none'
            }}
        >
            {children}
            <div className="absolute -top-3 -right-3 bg-blue-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
            </div>
        </div>
    );
}
