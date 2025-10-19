
import React from 'react';
import type { EvolutionStage } from '../types';
import { InfoPanel } from './InfoPanel';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface EvolutionChainDisplayProps {
    evolutionChain: EvolutionStage[];
}

export const EvolutionChainDisplay: React.FC<EvolutionChainDisplayProps> = ({ evolutionChain }) => {
    if (evolutionChain.length <= 1) {
        return (
            <InfoPanel title="Evolution Chain">
                <p>This Pokémon does not evolve.</p>
            </InfoPanel>
        );
    }
    
    const formatName = (name: string) => {
        return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <InfoPanel title="Evolution Chain">
            <div className="flex flex-wrap items-center justify-center gap-4">
                {evolutionChain.map((stage, index) => (
                    <React.Fragment key={stage.name}>
                        {index > 0 && (
                            <div className="flex flex-col items-center mx-2 text-center w-24">
                                <ArrowRightIcon />
                                <span className="text-xs mt-1 text-gray-400 capitalize">{stage.triggers.join(', ')}</span>
                            </div>
                        )}
                        <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-700 transition-colors">
                            <img src={stage.spriteUrl} alt={stage.name} className="w-24 h-24" />
                            <p className="font-semibold capitalize mt-1">{formatName(stage.name)}</p>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </InfoPanel>
    );
};
