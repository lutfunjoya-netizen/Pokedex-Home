import React, { useEffect, useRef } from 'react';
import type { FullPokemonDetails } from '../types';
import { LoadingSpinner } from './common/LoadingSpinner';
import { TypeBadge } from './common/TypeBadge';
import { InfoPanel } from './InfoPanel';
import { StatChart } from './StatChart';
import { InBattleStats } from './InBattleStats';
import { EvolutionChainDisplay } from './EvolutionChainDisplay';
import { SoundIcon } from './icons/SoundIcon';

interface PokemonDetailViewProps {
    pokemon: FullPokemonDetails | null;
    isLoading: boolean;
    error: string | null;
}

export const PokemonDetailView: React.FC<PokemonDetailViewProps> = ({ pokemon, isLoading, error }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // This effect creates and manages the audio instance.
    // It runs only when the selected Pokémon (and its cryUrl) changes.
    useEffect(() => {
        if (pokemon?.cryUrl) {
            audioRef.current = new Audio(pokemon.cryUrl);
        }

        // Cleanup function: This runs when the component unmounts or before the effect runs again for a new Pokémon.
        // It stops any currently playing audio from the previous Pokémon.
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [pokemon?.cryUrl]);


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
             <div className="flex flex-col justify-center items-center h-full text-center text-red-400">
                 <p className="text-xl">{error}</p>
             </div>
        );
    }
    
    if (!pokemon) {
        return (
            <div className="flex flex-col justify-center items-center h-full text-center text-gray-400">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="Pokeball" className="w-24 h-24 mb-4 opacity-50" />
                <p className="text-2xl">Select a Pokémon to see its details</p>
            </div>
        );
    }

    const formatName = (name: string) => {
        return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };
    
    const getGenderRatioString = (ratio: number) => {
        if (ratio === -1) return "Genderless";
        const femaleChance = (ratio / 8) * 100;
        const maleChance = 100 - femaleChance;
        return `♂ ${maleChance}% / ♀ ${femaleChance}%`;
    };

    const playCry = () => {
        // The playCry function now only interacts with the existing audio object.
        if (audioRef.current) {
            audioRef.current.currentTime = 0; // Rewind to start
            audioRef.current.play().catch(e => {
                // Ignore the specific "AbortError" which is expected if the user clicks very fast.
                if (e.name !== 'AbortError') {
                    console.error("Error playing audio:", e);
                }
            });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                    <div className={`absolute inset-0 rounded-full bg-${pokemon.color}-500 opacity-20 blur-2xl`}></div>
                    <img src={pokemon.spriteUrl} alt={pokemon.name} className="w-48 h-48 relative z-10" />
                </div>
                <div className="text-center md:text-left">
                    <p className="text-gray-400 text-2xl font-bold">#{String(pokemon.id).padStart(4, '0')}</p>
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                        <h2 className="text-5xl font-extrabold capitalize">{formatName(pokemon.name)}</h2>
                        {pokemon.cryUrl && (
                            <button
                                onClick={playCry}
                                className="p-2 rounded-full bg-gray-700 hover:bg-yellow-500 text-gray-300 hover:text-black transition-colors duration-200"
                                title="Play Cry"
                                aria-label="Play Pokémon cry"
                            >
                                <SoundIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                    <div className="flex justify-center md:justify-start gap-2 mt-2">
                        {pokemon.types.map(type => <TypeBadge key={type} type={type} />)}
                    </div>
                </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InfoPanel title="Pokédex Data">
                    <div className="grid grid-cols-2 gap-4 text-lg">
                        <p><strong className="font-semibold text-gray-400">Height:</strong> {pokemon.height} m</p>
                        <p><strong className="font-semibold text-gray-400">Weight:</strong> {pokemon.weight} kg</p>
                        <p><strong className="font-semibold text-gray-400">Color:</strong> <span className="capitalize">{pokemon.color}</span></p>
                        <p><strong className="font-semibold text-gray-400">Gender:</strong> {getGenderRatioString(pokemon.genderRatio)}</p>
                        <div className="col-span-2">
                           <strong className="font-semibold text-gray-400">Abilities:</strong>
                           <ul className="list-disc list-inside">
                               {pokemon.abilities.map(a => (
                                   <li key={a.name} className="capitalize">{formatName(a.name)}{a.isHidden && <span className="text-xs text-gray-400"> (Hidden)</span>}</li>
                               ))}
                           </ul>
                        </div>
                         <div className="col-span-2">
                            <strong className="font-semibold text-gray-400">Egg Groups:</strong>
                            <p className="capitalize">{pokemon.eggGroups.join(', ')}</p>
                        </div>
                        <p className="col-span-2"><strong className="font-semibold text-gray-400">Grass Knot Power:</strong> {pokemon.grassKnotPower}</p>
                    </div>
                </InfoPanel>

                <StatChart baseStats={pokemon.baseStats} />
            </div>

            <InBattleStats baseStats={pokemon.baseStats} />
            
            <EvolutionChainDisplay evolutionChain={pokemon.evolutionChain} />

        </div>
    );
};