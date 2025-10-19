
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PokemonList } from './components/PokemonList';
import { PokemonDetailView } from './components/PokemonDetailView';
import { FilterPanel } from './components/FilterPanel';
import { getAllPokemon, getPokemonDetails, getFilterOptions, getPokemonByFilter } from './services/pokeapi';
import type { PokemonListItem, FullPokemonDetails, FilterOptions, ActiveFilters, SortState } from './types';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const detailsCache = new Map<number, FullPokemonDetails>();

const initialNumericFilter = { min: null, max: null };
const initialFilters: ActiveFilters = {
    search: '',
    type: [],
    color: [],
    eggGroup: [],
    numeric: {
        hp: { ...initialNumericFilter },
        attack: { ...initialNumericFilter },
        defense: { ...initialNumericFilter },
        specialAttack: { ...initialNumericFilter },
        specialDefense: { ...initialNumericFilter },
        speed: { ...initialNumericFilter },
        total: { ...initialNumericFilter },
        product: { ...initialNumericFilter },
    }
};

function App() {
    const [masterPokemonList, setMasterPokemonList] = useState<PokemonListItem[]>([]);
    const [pokemonDatabase, setPokemonDatabase] = useState<Map<number, FullPokemonDetails>>(detailsCache);
    const [filteredPokemon, setFilteredPokemon] = useState<PokemonListItem[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<FullPokemonDetails | null>(null);
    const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isApplyingFilters, setIsApplyingFilters] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>(initialFilters);
    const [sortState, setSortState] = useState<SortState>({ by: 'id', direction: 'asc' });

    // Fetch initial master list and filter options
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoadingList(true);
                const [pokemonList, options] = await Promise.all([getAllPokemon(), getFilterOptions()]);
                setMasterPokemonList(pokemonList);
                setFilteredPokemon(pokemonList); // Initially show all
                setFilterOptions(options);
            } catch (err) {
                setError('Failed to load initial Pokémon data. Please try again later.');
            } finally {
                setIsLoadingList(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleDetailsRequired = useCallback(async (ids: number[]) => {
        setIsApplyingFilters(true);
        const newDetails = new Map(pokemonDatabase);
        const promises = ids
            .filter(id => !newDetails.has(id))
            .map(id => getPokemonDetails(id).then(details => ({ id, details })));

        try {
            const results = await Promise.all(promises);
            results.forEach(({ id, details }) => {
                newDetails.set(id, details);
            });
            setPokemonDatabase(newDetails);
        } catch (err) {
            console.error("Failed fetching details for filtering:", err);
            setError("Could not fetch some Pokémon details needed for filtering.");
        } finally {
            setIsApplyingFilters(false);
        }
    }, [pokemonDatabase]);

    const handleApplyFilters = useCallback(async (filters: ActiveFilters) => {
        setIsApplyingFilters(true);
        setActiveFilters(filters);

        let resultList: PokemonListItem[] = [...masterPokemonList];

        // 1. Categorical Filters (API-based for accuracy)
        // Fix: Added `as const` to the `type` property of each object to ensure
        // TypeScript infers a literal type (`'type' | 'pokemon-color' | 'egg-group'`)
        // instead of `string`, which is required by `getPokemonByFilter`.
        const categoricalFilters = [
            ...filters.type.map(value => ({ type: 'type' as const, value })),
            ...filters.color.map(value => ({ type: 'pokemon-color' as const, value })),
            ...filters.eggGroup.map(value => ({ type: 'egg-group' as const, value })),
        ];

        if (categoricalFilters.length > 0) {
            const filterResults = await Promise.all(
                categoricalFilters.map(f => getPokemonByFilter(f.type, f.value))
            );

            // Intersect results
            const idSets = filterResults.map(res => new Set(res.map(p => p.name)));
            const intersection = idSets.reduce((acc, currentSet) => {
                return new Set([...acc].filter(name => currentSet.has(name)));
            });
            
            const masterListMap = new Map(masterPokemonList.map(p => [p.name, p]));
            resultList = Array.from(intersection).map(name => masterListMap.get(name)).filter((p): p is PokemonListItem => !!p);
        }

        // 2. Search Filter
        const searchTerm = filters.search.toLowerCase().trim();
        if (searchTerm) {
            resultList = resultList.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                String(p.id) === searchTerm
            );
        }

        setFilteredPokemon(resultList);
        setIsApplyingFilters(false); // We can show the list now, numeric filters will happen after details are loaded
    }, [masterPokemonList]);

    const handleResetFilters = useCallback(() => {
        setActiveFilters(initialFilters);
        setSortState({ by: 'id', direction: 'asc' });
        setFilteredPokemon(masterPokemonList);
    }, [masterPokemonList]);

    const handlePokemonSelect = useCallback(async (id: number) => {
        if (isLoadingDetails) return;
        
        setIsLoadingDetails(true);
        setError(null);
        setSelectedPokemon(null);
        setSelectedPokemonId(id);

        try {
            const details = pokemonDatabase.has(id)
                ? pokemonDatabase.get(id)!
                : await getPokemonDetails(id);
            
            if (!pokemonDatabase.has(id)) {
                setPokemonDatabase(prev => new Map(prev).set(id, details));
            }
            setSelectedPokemon(details);
        } catch (err: any) {
            setError(err.message || 'Could not load Pokémon details.');
            setSelectedPokemon(null);
            setSelectedPokemonId(null);
        } finally {
            setIsLoadingDetails(false);
        }
    }, [isLoadingDetails, pokemonDatabase]);

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-700">
                 <div className="container mx-auto px-4 py-3 flex items-center gap-4">
                     <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="Pokeball logo" className="w-10 h-10"/>
                     <h1 className="text-3xl font-bold text-yellow-400 tracking-wider">Pokédex</h1>
                 </div>
            </header>
            <main className="container mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    
                    <div className="md:col-span-1 lg:col-span-1 h-[calc(100vh-120px)] flex flex-col">
                        {filterOptions ? (
                             <FilterPanel
                                options={filterOptions}
                                onApplyFilters={handleApplyFilters}
                                onResetFilters={handleResetFilters}
                                sortState={sortState}
                                onSortChange={setSortState}
                                isFiltering={isApplyingFilters}
                            />
                        ) : <div className="flex justify-center items-center h-24"><LoadingSpinner /></div>}
                        
                         {isLoadingList ? (
                            <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
                        ) : (
                            <PokemonList 
                                pokemonList={filteredPokemon} 
                                onPokemonSelect={handlePokemonSelect} 
                                selectedPokemonId={selectedPokemonId}
                                activeFilters={activeFilters}
                                sortState={sortState}
                                pokemonDatabase={pokemonDatabase}
                                onDetailsRequired={handleDetailsRequired}
                                isFiltering={isApplyingFilters}
                            />
                        )}
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 bg-gray-800/50 p-6 rounded-lg h-[calc(100vh-120px)] overflow-y-auto">
                        <PokemonDetailView 
                            pokemon={selectedPokemon}
                            isLoading={isLoadingDetails}
                            error={error}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;