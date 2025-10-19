import React, { useState } from 'react';

interface HoverTooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
}

export const HoverTooltip: React.FC<HoverTooltipProps> = ({ children, content }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div 
                    className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-xl text-sm text-white transition-opacity duration-200"
                    style={{ pointerEvents: 'none' }} // Prevents tooltip from flickering by not letting the mouse interact with it
                >
                    {content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                </div>
            )}
        </div>
    );
};