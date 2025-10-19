
import React from 'react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <div
                className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-yellow-400 border-t-transparent"
                role="status"
                aria-label="loading"
            ></div>
            <span className="text-lg text-gray-300">Loading...</span>
        </div>
    );
};
