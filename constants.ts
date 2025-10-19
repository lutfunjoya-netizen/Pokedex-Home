export const TYPE_COLORS: Record<string, string> = {
    normal: 'bg-gray-400 text-black',
    fire: 'bg-red-500 text-white',
    water: 'bg-blue-500 text-white',
    electric: 'bg-yellow-400 text-black',
    grass: 'bg-green-500 text-white',
    ice: 'bg-cyan-300 text-black',
    fighting: 'bg-orange-700 text-white',
    poison: 'bg-purple-600 text-white',
    ground: 'bg-yellow-600 text-white',
    flying: 'bg-indigo-400 text-white',
    psychic: 'bg-pink-500 text-white',
    bug: 'bg-lime-500 text-black',
    rock: 'bg-stone-500 text-white',
    ghost: 'bg-indigo-800 text-white',
    dragon: 'bg-violet-600 text-white',
    dark: 'bg-gray-800 text-white',
    steel: 'bg-slate-400 text-black',
    fairy: 'bg-pink-300 text-black',
};

export const STAT_NAMES: Record<string, { short: string; long: string; color: string }> = {
    hp: { short: 'HP', long: 'HP', color: 'bg-red-500' },
    attack: { short: 'Atk', long: 'Attack', color: 'bg-orange-500' },
    defense: { short: 'Def', long: 'Defense', color: 'bg-yellow-500' },
    'special-attack': { short: 'SpA', long: 'Sp. Atk', color: 'bg-blue-500' },
    'special-defense': { short: 'SpD', long: 'Sp. Def', color: 'bg-green-500' },
    speed: { short: 'Spe', long: 'Speed', color: 'bg-pink-500' },
};

export const STAT_DESCRIPTIONS: Record<string, string> = {
    hp: 'Determines how much damage a Pokémon can take before fainting.',
    attack: 'Affects the damage dealt when using physical moves.',
    defense: 'Reduces the damage received from physical moves.',
    'special-attack': 'Affects the damage dealt when using special moves.',
    'special-defense': 'Reduces the damage received from special moves.',
    speed: 'Determines which Pokémon attacks first in battle.',
};