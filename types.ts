// From PokeAPI
export interface PokeAPIPokemon {
    id: number;
    name: string;
    height: number; // in decimetres
    weight: number; // in hectograms
    sprites: {
        front_default: string | null;
        other: {
            'official-artwork': {
                front_default: string | null;
            };
        };
    };
    cries: {
        latest: string | null;
        legacy: string | null;
    };
    stats: {
        base_stat: number;
        stat: {
            name: string;
            url: string;
        };
    }[];
    types: {
        slot: number;
        type: {
            name: string;
            url: string;
        };
    }[];
    abilities: {
        ability: {
            name: string;
            url: string;
        };
        is_hidden: boolean;
    }[];
    species: {
        url: string;
    };
}

export interface PokemonSpecies {
    id: number;
    name: string;
    gender_rate: number; // chance of being female in 1/8ths. -1 for genderless
    color: {
        name: string;
    };
    egg_groups: {
        name: string;
        url: string;
    }[];
    evolution_chain: {
        url: string;
    };
    flavor_text_entries: {
        flavor_text: string;
        language: { name: string };
        version: { name: string };
    }[];
}

export interface EvolutionChain {
    id: number;
    chain: ChainLink;
}

export interface ChainLink {
    species: {
        name: string;
        url: string;
    };
    evolves_to: ChainLink[];
    evolution_details: EvolutionDetail[];
}

export interface EvolutionDetail {
    item: { name: string } | null;
    trigger: { name: string };
    gender: number | null;
    held_item: { name: string } | null;
    known_move: { name: string } | null;
    known_move_type: { name: string } | null;
    location: { name: string } | null;
    min_level: number | null;
    min_happiness: number | null;
    min_beauty: number | null;
    min_affection: number | null;
    needs_overworld_rain: boolean;
    party_species: { name: string } | null;
    party_type: { name: string } | null;
    relative_physical_stats: number | null;
    time_of_day: string;
    trade_species: { name: string } | null;
    turn_upside_down: boolean;
}


// Processed types for the app
export interface PokemonListItem {
    id: number;
    name: string;
    spriteUrl: string;
}

export interface EvolutionStage {
    name: string;
    spriteUrl: string;
    triggers: string[];
}

export interface StatSet {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
}

export interface CalculatedStats {
    scenario1: StatSet; // Min
    scenario2: StatSet; // Base
    scenario3: StatSet; // Max
    scenario4: StatSet; // Max+
}

export interface FullPokemonDetails {
    id: number;
    name: string;
    spriteUrl: string;
    types: string[];
    height: number; // in meters
    weight: number; // in kg
    abilities: { name: string; isHidden: boolean }[];
    baseStats: StatSet;
    genderRatio: number;
    color: string;
    eggGroups: string[];
    evolutionChain: EvolutionStage[];
    grassKnotPower: number;
    baseStatTotal: number;
    baseStatProduct: number;
    cryUrl: string | null;
}

// Filtering and Sorting Types
export interface FilterOptions {
    types: string[];
    colors: string[];
    eggGroups: string[];
}

export type CategoricalFilter = keyof Omit<ActiveFilters, 'search' | 'numeric'>;
export type NumericFilterStat = keyof NumericFilters;

export interface ActiveFilters {
    search: string;
    type: string[];
    color: string[];
    eggGroup: string[];
    numeric: NumericFilters;
}

export interface NumericFilterValues {
    min: number | null;
    max: number | null;
}

export type NumericFilters = {
    [key in keyof StatSet | 'total' | 'product']: NumericFilterValues;
};

export interface SortState {
    by: 'id' | 'name' | keyof StatSet | 'total' | 'product';
    direction: 'asc' | 'desc';
}