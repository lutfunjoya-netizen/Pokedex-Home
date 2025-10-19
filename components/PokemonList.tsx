import React, { useMemo, useEffect, useState } from 'react';
import type { PokemonListItem, SortState, ActiveFilters, FullPokemonDetails } from '../types';
import { LoadingSpinner } from './common/LoadingSpinner';

interface PokemonListProps {
    pokemonList: PokemonListItem[];
    onPokemonSelect: (id: number) => void;
    selectedPokemonId: number | null;
    activeFilters: ActiveFilters;
    sortState: SortState;
    pokemonDatabase: Map<number, FullPokemonDetails>;
    onDetailsRequired: (ids: number[]) => void;
    isFiltering: boolean;
}

export const PokemonList: React.FC<PokemonListProps> = ({ 
    pokemonList, 
    onPokemonSelect, 
    selectedPokemonId,
    activeFilters,
    sortState,
    pokemonDatabase,
    onDetailsRequired,
    isFiltering
 }) => {
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    const isNumericFilterActive = useMemo(() => {
        return Object.values(activeFilters.numeric).some(f => f.min !== null || f.max !== null);
    }, [activeFilters.numeric]);

    // This effect identifies which pokemon need details for filtering/sorting and requests them.
    useEffect(() => {
        const needsDetailsForFiltering = isNumericFilterActive;
        const needsDetailsForSorting = sortState.by !== 'id' && sortState.by !== 'name';

        if (pokemonList.length > 0 && (needsDetailsForFiltering || needsDetailsForSorting)) {
            const missingIds = pokemonList.map(p => p.id).filter(id => !pokemonDatabase.has(id));
            if (missingIds.length > 0) {
                setIsFetchingDetails(true);
                onDetailsRequired(missingIds);
            } else {
                setIsFetchingDetails(false);
            }
        } else {
            setIsFetchingDetails(false);
        }
    }, [pokemonList, pokemonDatabase, onDetailsRequired, isNumericFilterActive, sortState.by]);
    
    const processedList = useMemo(() => {
        let list = [...pokemonList];

        // Apply numeric filters if active
        if (isNumericFilterActive) {
            list = list.filter(p => {
                const details = pokemonDatabase.get(p.id);
                if (!details) return false; // Hide if details not yet loaded for filtering

                for (const key in activeFilters.numeric) {
                    const filter = activeFilters.numeric[key as keyof typeof activeFilters.numeric];
                    if (filter.min === null && filter.max === null) continue;

                    const value = key === 'total' ? details.baseStatTotal : key === 'product' ? details.baseStatProduct : details.baseStats[key as keyof typeof details.baseStats];
                    if (filter.min !== null && value < filter.min) return false;
                    if (filter.max !== null && value > filter.max) return false;
                }
                return true;
            });
        }
        
        // Apply sorting
        list.sort((a, b) => {
            if (sortState.by === 'id') {
                return sortState.direction === 'asc' ? a.id - b.id : b.id - a.id;
            }
            if (sortState.by === 'name') {
                return sortState.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            }

            const detailsA = pokemonDatabase.get(a.id);
            const detailsB = pokemonDatabase.get(b.id);
            
            // Push pokemon without details to the bottom
            if (!detailsA) return 1;
            if (!detailsB) return -1;
            
            const valueA = sortState.by === 'total' ? detailsA.baseStatTotal : sortState.by === 'product' ? detailsA.baseStatProduct : detailsA.baseStats[sortState.by];
            const valueB = sortState.by === 'total' ? detailsB.baseStatTotal : sortState.by === 'product' ? detailsB.baseStatProduct : detailsB.baseStats[sortState.by];

            return sortState.direction === 'asc' ? valueA - valueB : valueB - valueA;
        });

        return list;

    }, [pokemonList, sortState, pokemonDatabase, activeFilters, isNumericFilterActive]);

    const formatName = (name: string) => {
        return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };
    
    const showLoadingOverlay = isFiltering || isFetchingDetails;

    return (
        <div className="relative overflow-y-auto h-full pr-2">
            {showLoadingOverlay && (
                <div className="absolute inset-0 bg-gray-900/70 z-10 flex flex-col justify-center items-center">
                    <LoadingSpinner />
                    <p className="mt-2 text-sm text-gray-300">
                      {isFiltering ? "Applying filters..." : "Fetching details for sorting..."}
                    </p>
                </div>
            )}
             <ul className="space-y-2">
                {processedList.map(pokemon => (
                    <li key={pokemon.id}>
                        <button
                            onClick={() => onPokemonSelect(pokemon.id)}
                            className={`w-full flex items-center p-2 rounded-lg transition-colors duration-200 text-white
                                ${selectedPokemonId === pokemon.id 
                                    ? 'bg-yellow-500 !text-black' 
                                    : 'bg-gray-800 hover:bg-gray-700'
                                }`}
                        >
                            <img 
                                src={pokemon.spriteUrl} 
                                alt={pokemon.name} 
                                className="w-12 h-12 mr-4 bg-gray-700/50 rounded-full"
                                loading="lazy"
                             />
                            <div className="text-left">
                                <p className={`text-sm ${selectedPokemonId === pokemon.id ? 'text-gray-800' : 'text-gray-400'}`}>#{String(pokemon.id).padStart(4, '0')}</p>
                                <p className="font-bold text-lg capitalize">{formatName(pokemon.name)}</p>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};