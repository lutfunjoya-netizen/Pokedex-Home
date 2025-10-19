import React, { useState, useRef, useEffect } from 'react';

interface HelpTooltipProps {
    content: React.ReactNode;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ content }) => {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const toggleTooltip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block" ref={tooltipRef}>
            <button
                onClick={toggleTooltip}
                className="w-6 h-6 flex items-center justify-center bg-gray-600 text-gray-300 rounded-full hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="More info"
            >
                <span className="font-bold text-sm">?</span>
            </button>
            <div
                className={`
                    absolute z-20 bottom-full right-0 mb-2 w-72 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-xl
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none'}
                `}
            >
                {content}
                <div className="absolute top-full right-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
            </div>
        </div>
    );
};