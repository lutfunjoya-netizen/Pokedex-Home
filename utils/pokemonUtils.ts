import type { ChainLink, EvolutionStage, CalculatedStats, StatSet, EvolutionDetail } from '../types';

// Stat Calculation Logic
const calculateHP = (base: number, level: number, iv: number, ev: number): number => {
    if (base === 1) return 1; // Shedinja clause
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
};

const calculateOtherStat = (base: number, level: number, iv: number, ev: number, nature: number): number => {
    const baseCalc = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
    return Math.floor(baseCalc * nature);
};

export const calculateStats = (baseStats: StatSet, level: number): CalculatedStats => {
    return {
        scenario1: { // 0 IVs, 0 EVs, Hindering
            hp: calculateHP(baseStats.hp, level, 0, 0),
            attack: calculateOtherStat(baseStats.attack, level, 0, 0, 0.9),
            defense: calculateOtherStat(baseStats.defense, level, 0, 0, 0.9),
            specialAttack: calculateOtherStat(baseStats.specialAttack, level, 0, 0, 0.9),
            specialDefense: calculateOtherStat(baseStats.specialDefense, level, 0, 0, 0.9),
            speed: calculateOtherStat(baseStats.speed, level, 0, 0, 0.9),
        },
        scenario2: { // 31 IVs, 0 EVs, Neutral
            hp: calculateHP(baseStats.hp, level, 31, 0),
            attack: calculateOtherStat(baseStats.attack, level, 31, 0, 1.0),
            defense: calculateOtherStat(baseStats.defense, level, 31, 0, 1.0),
            specialAttack: calculateOtherStat(baseStats.specialAttack, level, 31, 0, 1.0),
            specialDefense: calculateOtherStat(baseStats.specialDefense, level, 31, 0, 1.0),
            speed: calculateOtherStat(baseStats.speed, level, 31, 0, 1.0),
        },
        scenario3: { // 31 IVs, 252 EVs, Neutral
            hp: calculateHP(baseStats.hp, level, 31, 252),
            attack: calculateOtherStat(baseStats.attack, level, 31, 252, 1.0),
            defense: calculateOtherStat(baseStats.defense, level, 31, 252, 1.0),
            specialAttack: calculateOtherStat(baseStats.specialAttack, level, 31, 252, 1.0),
            specialDefense: calculateOtherStat(baseStats.specialDefense, level, 31, 252, 1.0),
            speed: calculateOtherStat(baseStats.speed, level, 31, 252, 1.0),
        },
        scenario4: { // 31 IVs, 252 EVs, Benefiting
            hp: calculateHP(baseStats.hp, level, 31, 252),
            attack: calculateOtherStat(baseStats.attack, level, 31, 252, 1.1),
            defense: calculateOtherStat(baseStats.defense, level, 31, 252, 1.1),
            specialAttack: calculateOtherStat(baseStats.specialAttack, level, 31, 252, 1.1),
            specialDefense: calculateOtherStat(baseStats.specialDefense, level, 31, 252, 1.1),
            speed: calculateOtherStat(baseStats.speed, level, 31, 252, 1.1),
        },
    };
};

// Grass Knot Power
export const getGrassKnotPower = (weightInKg: number): number => {
    if (weightInKg < 10) return 20;
    if (weightInKg < 25) return 40;
    if (weightInKg < 50) return 60;
    if (weightInKg < 100) return 80;
    if (weightInKg < 200) return 100;
    return 120;
};

// Evolution Chain Parsing
const buildTriggerText = (details: EvolutionDetail): string | null => {
    if (!details || !details.trigger) {
        return 'Special';
    }

    let triggerText = details.trigger.name.replace(/-/g, ' ');
    if (details.min_level) triggerText += ` at level ${details.min_level}`;
    if (details.item) triggerText += ` using ${details.item.name.replace(/-/g, ' ')}`;
    if (details.held_item) triggerText += ` while holding ${details.held_item.name.replace(/-/g, ' ')}`;
    if (details.min_happiness) triggerText += ` with high happiness`;
    if (details.min_beauty) triggerText += ` with high beauty`;
    if (details.min_affection) triggerText += ` with high affection`;
    if (details.time_of_day) triggerText += ` during the ${details.time_of_day}`;
    if (details.location) triggerText += ` at ${details.location.name.replace(/-/g, ' ')}`;
    if (details.gender === 1) triggerText += ` (female)`;
    if (details.gender === 2) triggerText += ` (male)`;
    if (details.known_move) triggerText += ` while knowing ${details.known_move.name.replace(/-/g, ' ')}`;
    if (details.needs_overworld_rain) triggerText += ` in the rain`;
    if (details.turn_upside_down) triggerText += ` by turning console upside down`;
    if (details.trade_species) triggerText += ` by trading for a ${details.trade_species.name.replace(/-/g, ' ')}`;
    if (details.party_species) triggerText += ` with ${details.party_species.name.replace(/-/g, ' ')} in party`;
    if (details.relative_physical_stats === 1) triggerText += ` (Attack > Defense)`;
    if (details.relative_physical_stats === -1) triggerText += ` (Attack < Defense)`;
    if (details.relative_physical_stats === 0) triggerText += ` (Attack = Defense)`;
    
    return triggerText;
}

export const parseEvolutionChain = (chain: ChainLink): EvolutionStage[] => {
    const stages: EvolutionStage[] = [];
    let currentLink: ChainLink | undefined = chain;

    while (currentLink) {
        const speciesName = currentLink.species.name;
        const id = currentLink.species.url.split('/').filter(Boolean).pop();
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

        let triggers: string[] = [];
        // The details on a link describe how that species is reached.
        if (currentLink.evolution_details && currentLink.evolution_details.length > 0) {
            const trigger = buildTriggerText(currentLink.evolution_details[0]);
            if (trigger) {
                triggers.push(trigger);
            }
        }

        stages.push({
            name: speciesName,
            spriteUrl: spriteUrl,
            triggers: triggers,
        });

        // Handle branching evolutions
        if (currentLink.evolves_to.length > 1) {
            for (const nextLink of currentLink.evolves_to) {
                const nextSpeciesName = nextLink.species.name;
                const nextId = nextLink.species.url.split('/').filter(Boolean).pop();
                const nextSpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${nextId}.png`;
                
                let branchTriggers: string[] = [];
                if (nextLink.evolution_details && nextLink.evolution_details.length > 0) {
                     const trigger = buildTriggerText(nextLink.evolution_details[0]);
                     if (trigger) {
                        branchTriggers.push(trigger);
                     }
                }

                stages.push({
                    name: nextSpeciesName,
                    spriteUrl: nextSpriteUrl,
                    triggers: branchTriggers,
                });
            }
            currentLink = undefined; // Stop the loop after handling the branches.
        } else {
            // Continue down the linear chain
            currentLink = currentLink.evolves_to[0];
        }
    }

    return stages;
};
