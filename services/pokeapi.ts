import type { PokeAPIPokemon, PokemonSpecies, EvolutionChain, PokemonListItem, FullPokemonDetails, FilterOptions } from '../types';
import { parseEvolutionChain, getGrassKnotPower } from '../utils/pokemonUtils';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Caching to avoid re-fetching
let pokemonListCache: PokemonListItem[] | null = null;
let filterOptionsCache: FilterOptions | null = null;


const fetchAndCache = async <T>(url: string, processor: (data: any) => T): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
    const data = await response.json();
    return processor(data);
};

export const getFilterOptions = async (): Promise<FilterOptions> => {
    if (filterOptionsCache) return filterOptionsCache;
    
    try {
        const [typesData, colorsData, eggGroupsData] = await Promise.all([
            fetchAndCache(`${BASE_URL}/type?limit=100`, data => data.results.map((item: { name: string }) => item.name).filter((name: string) => name !== 'unknown' && name !== 'shadow')),
            fetchAndCache(`${BASE_URL}/pokemon-color?limit=100`, data => data.results.map((item: { name: string }) => item.name)),
            fetchAndCache(`${BASE_URL}/egg-group?limit=100`, data => data.results.map((item: { name: string }) => item.name)),
        ]);

        filterOptionsCache = { types: typesData, colors: colorsData, eggGroups: eggGroupsData };
        return filterOptionsCache;
    } catch (error) {
        console.error("Error fetching filter options:", error);
        throw new Error('Could not load filter options.');
    }
};

export const getPokemonByFilter = async (filterType: 'type' | 'egg-group' | 'pokemon-color', value: string): Promise<{ id: number, name: string }[]> => {
    const endpoint = filterType === 'pokemon-color' ? 'pokemon-color' : filterType;
    try {
        const data = await fetchAndCache(`${BASE_URL}/${endpoint}/${value}`, data => data.pokemon_species || data.pokemon);
        
        return data.map((entry: any) => {
            const pokemon = entry.pokemon_species || entry;
            const url = pokemon.url;
            const id = parseInt(url.split('/').filter(Boolean).pop() ?? '0', 10);
            return { id, name: pokemon.name };
        });
    } catch (error) {
        console.error(`Error fetching Pokémon by ${filterType} ${value}:`, error);
        return [];
    }
};


export const getAllPokemon = async (): Promise<PokemonListItem[]> => {
    if (pokemonListCache) {
        return pokemonListCache;
    }

    try {
        const response = await fetch(`${BASE_URL}/pokemon?limit=1025`); // Gen 9 is 1025
        if (!response.ok) throw new Error('Failed to fetch Pokémon list');
        const data = await response.json();

        const baseList: PokemonListItem[] = data.results.map((p: { name: string; url: string }) => {
            const id = parseInt(p.url.split('/').filter(Boolean).pop() ?? '0');
            return {
                id,
                name: p.name,
                spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
            };
        });
        
        // Fetch all alternate forms
        const formIds = Array.from({ length: 10277 - 10001 + 1 }, (_, i) => 10001 + i);
        const formPromises = formIds.map(id => fetch(`${BASE_URL}/pokemon/${id}`).then(res => res.ok ? res.json() : Promise.reject(id)));
        
        const formResults = await Promise.allSettled(formPromises);
        
        const alternateForms: PokemonListItem[] = formResults
            .filter((result): result is PromiseFulfilledResult<PokeAPIPokemon> => result.status === 'fulfilled')
            .map(result => {
                const pokemonData = result.value;
                return {
                    id: pokemonData.id,
                    name: pokemonData.name,
                    spriteUrl: pokemonData.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`,
                };
            });

        // Combine lists, ensuring no duplicate names.
        const combinedMap = new Map<string, PokemonListItem>();
        baseList.forEach(p => combinedMap.set(p.name, p));
        alternateForms.forEach(p => {
            if (!combinedMap.has(p.name)) {
                combinedMap.set(p.name, p);
            }
        });

        const finalList = Array.from(combinedMap.values());
        
        pokemonListCache = finalList;
        return finalList;

    } catch (error) {
        console.error("Error fetching Pokémon list:", error);
        throw new Error('Could not fetch the list of Pokémon.');
    }
};

export const getPokemonDetails = async (idOrName: number | string): Promise<FullPokemonDetails> => {
    try {
        const pokemonRes = await fetch(`${BASE_URL}/pokemon/${idOrName}`);
        if (!pokemonRes.ok) throw new Error(`Pokémon "${idOrName}" not found.`);
        const pokemonData: PokeAPIPokemon = await pokemonRes.json();

        const speciesRes = await fetch(pokemonData.species.url);
        if (!speciesRes.ok) throw new Error(`Failed to fetch species data for ${pokemonData.name}.`);
        const speciesData: PokemonSpecies = await speciesRes.json();
        
        const evolutionRes = await fetch(speciesData.evolution_chain.url);
        if (!evolutionRes.ok) throw new Error(`Failed to fetch evolution data for ${pokemonData.name}.`);
        const evolutionData: EvolutionChain = await evolutionRes.json();

        const baseStats = {
            hp: pokemonData.stats.find(s => s.stat.name === 'hp')?.base_stat ?? 0,
            attack: pokemonData.stats.find(s => s.stat.name === 'attack')?.base_stat ?? 0,
            defense: pokemonData.stats.find(s => s.stat.name === 'defense')?.base_stat ?? 0,
            specialAttack: pokemonData.stats.find(s => s.stat.name === 'special-attack')?.base_stat ?? 0,
            specialDefense: pokemonData.stats.find(s => s.stat.name === 'special-defense')?.base_stat ?? 0,
            speed: pokemonData.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0,
        };

        const weightInKg = pokemonData.weight / 10;
        const total = Object.values(baseStats).reduce((sum, val) => sum + val, 0);
        const product = Object.values(baseStats).reduce((prod, val) => val > 0 ? prod * val : prod, 1);

        return {
            id: pokemonData.id,
            name: pokemonData.name,
            spriteUrl: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default,
            types: pokemonData.types.map(t => t.type.name),
            height: pokemonData.height / 10, // to meters
            weight: weightInKg,
            abilities: pokemonData.abilities.map(a => ({ name: a.ability.name, isHidden: a.is_hidden })),
            baseStats,
            genderRatio: speciesData.gender_rate,
            color: speciesData.color.name,
            eggGroups: speciesData.egg_groups.map(g => g.name),
            evolutionChain: parseEvolutionChain(evolutionData.chain),
            grassKnotPower: getGrassKnotPower(weightInKg),
            baseStatTotal: total,
            baseStatProduct: product,
            cryUrl: pokemonData.cries?.latest ?? null,
        };

    } catch (error: any) {
        console.error(`Error fetching details for ${idOrName}:`, error);
        throw new Error(error.message || `An unknown error occurred while fetching Pokémon details.`);
    }
};