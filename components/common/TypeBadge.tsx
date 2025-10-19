
import React from 'react';
import { TYPE_COLORS } from '../../constants';

interface TypeBadgeProps {
    type: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
    const colorClass = TYPE_COLORS[type.toLowerCase()] || 'bg-gray-500 text-white';
    return (
        <span className={`px-4 py-1 text-lg font-bold uppercase rounded-full shadow-md ${colorClass}`}>
            {type}
        </span>
    );
};
