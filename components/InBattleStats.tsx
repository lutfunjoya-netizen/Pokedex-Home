import React, { useState, useEffect } from 'react';
import type { CalculatedStats, StatSet, FullPokemonDetails } from '../types';
import { InfoPanel } from './InfoPanel';
import { STAT_NAMES } from '../constants';
import { calculateStats } from '../utils/pokemonUtils';
import { HelpTooltip } from './common/HelpTooltip';

interface InBattleStatsProps {
    baseStats: FullPokemonDetails['baseStats'];
}

const StatRow: React.FC<{ label: string; stats: StatSet }> = ({ label, stats }) => (
    <tr>
        <td className="py-2 px-3 font-semibold text-gray-300">{label}</td>
        <td className="py-2 px-3 text-center">{stats.hp}</td>
        <td className="py-2 px-3 text-center">{stats.attack}</td>
        <td className="py-2 px-3 text-center">{stats.defense}</td>
        <td className="py-2 px-3 text-center">{stats.specialAttack}</td>
        <td className="py-2 px-3 text-center">{stats.specialDefense}</td>
        <td className="py-2 px-3 text-center">{stats.speed}</td>
    </tr>
);


export const InBattleStats: React.FC<InBattleStatsProps> = ({ baseStats }) => {
    const [level, setLevel] = useState(100);
    const [calculatedStats, setCalculatedStats] = useState<CalculatedStats | null>(null);
    
    useEffect(() => {
        setCalculatedStats(calculateStats(baseStats, level));
    }, [baseStats, level]);

    const tooltipContent = (
      <div className="text-sm p-2 space-y-4">
        <h4 className="font-bold text-base mb-2">How In-Battle Stats are Calculated</h4>
        <div>
          <p className="font-semibold text-yellow-400">HP Formula:</p>
          <code>⌊(2 * Base + IV + ⌊EV/4⌋) * Level/100⌋ + Level + 10</code>
          <p className="text-xs text-gray-400 mt-1">* Pokémon with a base HP of 1 (Shedinja) will always have 1 HP.</p>
        </div>
        <div>
          <p className="font-semibold text-yellow-400">Other Stats Formula:</p>
          <code>⌊(⌊(2 * Base + IV + ⌊EV/4⌋) * Level/100⌋ + 5) * Nature⌋</code>
        </div>
        <div className="text-xs">
          <p><strong className="text-gray-300">IVs:</strong> Individual Values (0-31)</p>
          <p><strong className="text-gray-300">EVs:</strong> Effort Values (0-252)</p>
          <p><strong className="text-gray-300">Nature:</strong> Can be hindering (0.9x), neutral (1.0x), or positive (1.1x).</p>
        </div>
      </div>
    );

    if (!calculatedStats) {
        return <InfoPanel title="In-Battle Stats">Loading stats...</InfoPanel>;
    }
    
    return (
         <div className="relative">
            <InfoPanel title={`In-Battle Stats (Lvl ${level})`}>
                <div className="absolute top-6 right-6">
                    <HelpTooltip content={tooltipContent} />
                </div>
                <div className="mb-4 flex items-center gap-4">
                    <label htmlFor="level-slider" className="font-semibold">Level:</label>
                    <input 
                        id="level-slider"
                        type="range"
                        min="1"
                        max="100"
                        value={level}
                        onChange={e => setLevel(Number(e.target.value))}
                        className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                     <input
                        type="number"
                        min="1"
                        max="100"
                        value={level}
                        onChange={(e) => setLevel(Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white text-center"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="py-2 px-3 text-left font-bold text-yellow-400">Scenario</th>
                                <th className="py-2 px-3 font-bold text-yellow-400">{STAT_NAMES['hp'].short}</th>
                                <th className="py-2 px-3 font-bold text-yellow-400">{STAT_NAMES['attack'].short}</th>
                                <th className="py-2 px-3 font-bold text-yellow-400">{STAT_NAMES['defense'].short}</th>
                                <th className="py-2 px-3 font-bold text-yellow-400">{STAT_NAMES['special-attack'].short}</th>
                                <th className="py-2 px-3 font-bold text-yellow-400">{STAT_NAMES['special-defense'].short}</th>
                                <th className="py-2 px-3 font-bold text-yellow-400">{STAT_NAMES['speed'].short}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            <StatRow label="Min (0 IV/EV, Hindering)" stats={calculatedStats.scenario1} />
                            <StatRow label="Base (31 IV/0 EV, Neutral)" stats={calculatedStats.scenario2} />
                            <StatRow label="Max (31 IV/252 EV, Neutral)" stats={calculatedStats.scenario3} />
                            <StatRow label="Max+ (31 IV/252 EV, Positive)" stats={calculatedStats.scenario4} />
                        </tbody>
                    </table>
                </div>
            </InfoPanel>
        </div>
    );
};