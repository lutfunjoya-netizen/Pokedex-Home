
import React from 'react';

interface InfoPanelProps {
    title: string;
    children: React.ReactNode;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ title, children }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-yellow-400 border-b-2 border-gray-700 pb-2">{title}</h3>
            {children}
        </div>
    );
};
