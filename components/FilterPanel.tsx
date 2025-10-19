import React, { useState, useMemo } from 'react';
import type { FilterOptions, ActiveFilters, SortState, CategoricalFilter, NumericFilterStat } from '../types';

interface FilterPanelProps {
    options: FilterOptions;
    onApplyFilters: (filters: ActiveFilters) => void;
    onResetFilters: () => void;
    sortState: SortState;
    onSortChange: (sortState: SortState) => void;
    isFiltering: boolean;
}

const initialNumericFilter = { min: null, max: null };
const initialStagedFilters: ActiveFilters = {
    search: '',
    type: [],
    color: [],
    eggGroup: [],
    numeric: {
        hp: { ...initialNumericFilter }, attack: { ...initialNumericFilter }, defense: { ...initialNumericFilter },
        specialAttack: { ...initialNumericFilter }, specialDefense: { ...initialNumericFilter }, speed: { ...initialNumericFilter },
        total: { ...initialNumericFilter }, product: { ...initialNumericFilter },
    }
};

const sortOptions: { label: string, value: SortState['by'] }[] = [
    { label: 'ID', value: 'id' }, { label: 'Name', value: 'name' }, { label: 'HP', value: 'hp' },
    { label: 'Atk', value: 'attack' }, { label: 'Def', value: 'defense' }, { label: 'SpA', value: 'specialAttack' },
    { label: 'SpD', value: 'specialDefense' }, { label: 'Spe', value: 'speed' }, { label: 'Total', value: 'total' },
    { label: 'Product', value: 'product' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ options, onApplyFilters, onResetFilters, sortState, onSortChange, isFiltering }) => {
    const [stagedFilters, setStagedFilters] = useState<ActiveFilters>(initialStagedFilters);
    const [openSection, setOpenSection] = useState<string | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStagedFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const handleCategoricalChange = (filterType: CategoricalFilter, value: string) => {
        setStagedFilters(prev => {
            const currentValues = prev[filterType];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [filterType]: newValues };
        });
    };

    const handleSelectAll = (filterType: CategoricalFilter) => {
        const allValues = { type: options.types, color: options.colors, eggGroup: options.eggGroups }[filterType];
        const currentValues = stagedFilters[filterType];
        const newValues = currentValues.length === allValues.length ? [] : allValues;
        setStagedFilters(prev => ({ ...prev, [filterType]: newValues }));
    };
    
    const handleNumericChange = (stat: NumericFilterStat, bound: 'min' | 'max', value: string) => {
        const numValue = value === '' ? null : parseInt(value, 10);
        setStagedFilters(prev => ({
            ...prev,
            numeric: {
                ...prev.numeric,
                [stat]: { ...prev.numeric[stat], [bound]: numValue }
            }
        }));
    };
    
    const handleSortClick = (by: SortState['by']) => {
        if (sortState.by === by) {
            onSortChange({ by, direction: sortState.direction === 'asc' ? 'desc' : 'asc' });
        } else {
            onSortChange({ by, direction: 'asc' });
        }
    };
    
    const handleReset = () => {
        setStagedFilters(initialStagedFilters);
        onResetFilters();
    };

    const toggleSection = (section: string) => {
        setOpenSection(prev => (prev === section ? null : section));
    };

    const renderCheckboxes = (title: string, filterKey: CategoricalFilter, items: string[]) => (
        <div>
            <button onClick={() => toggleSection(filterKey)} className="w-full text-left font-bold py-2 text-lg text-yellow-400">
                {title} ({stagedFilters[filterKey].length})
            </button>
            {openSection === filterKey && (
                 <div className="pl-2 border-l-2 border-gray-700 max-h-48 overflow-y-auto space-y-1 pr-1">
                     <div className="flex gap-2">
                        <button onClick={() => handleSelectAll(filterKey)} className="text-xs text-yellow-400 hover:underline">
                            {stagedFilters[filterKey].length === items.length ? 'Deselect All' : 'Select All'}
                        </button>
                     </div>
                     {items.map(item => (
                         <label key={item} className="flex items-center capitalize text-sm cursor-pointer">
                             <input type="checkbox" checked={stagedFilters[filterKey].includes(item)} onChange={() => handleCategoricalChange(filterKey, item)}
                                 className="form-checkbox h-4 w-4 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-500" />
                             <span className="ml-2">{item.replace(/-/g, ' ')}</span>
                         </label>
                     ))}
                 </div>
            )}
        </div>
    );
    
     const renderNumericFilters = () => (
        <div>
            <button onClick={() => toggleSection('numeric')} className="w-full text-left font-bold py-2 text-lg text-yellow-400">Filter By Base Stats</button>
            {openSection === 'numeric' && (
                 <div className="pl-2 border-l-2 border-gray-700 space-y-2 pr-1">
                    {Object.keys(stagedFilters.numeric).map(stat => (
                        <div key={stat} className="grid grid-cols-10 items-center gap-1">
                            <label className="col-span-3 text-sm capitalize">{stat}</label>
                            <input type="number" placeholder="Min" value={stagedFilters.numeric[stat as NumericFilterStat].min ?? ''} onChange={e => handleNumericChange(stat as NumericFilterStat, 'min', e.target.value)} 
                                   className="col-span-3 w-full bg-gray-700 text-xs p-1 rounded border-gray-600" />
                             <span className="text-center">-</span>
                            <input type="number" placeholder="Max" value={stagedFilters.numeric[stat as NumericFilterStat].max ?? ''} onChange={e => handleNumericChange(stat as NumericFilterStat, 'max', e.target.value)} 
                                   className="col-span-3 w-full bg-gray-700 text-xs p-1 rounded border-gray-600" />
                        </div>
                    ))}
                 </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-gray-800/50 rounded-lg p-3">
             <input
                type="text"
                placeholder="Search by name or ID..."
                value={stagedFilters.search}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 mb-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
            />
             <div className="flex gap-2 mb-2">
                 <button onClick={() => onApplyFilters(stagedFilters)} disabled={isFiltering} className="flex-1 bg-yellow-500 text-black font-bold py-2 rounded disabled:opacity-50 disabled:cursor-wait">
                     {isFiltering ? 'Applying...' : 'Apply Filters'}
                 </button>
                 <button onClick={handleReset} className="flex-1 bg-gray-600 text-white font-bold py-2 rounded">Reset All</button>
            </div>
            
            <div className="overflow-y-auto space-y-2 pr-1">
                <div>
                     <button onClick={() => toggleSection('sort')} className="w-full text-left font-bold py-2 text-lg text-yellow-400">Sort By</button>
                     {openSection === 'sort' && (
                        <div className="grid grid-cols-3 gap-1.5 pl-2 border-l-2 border-gray-700">
                             {sortOptions.map(opt => (
                                <button key={opt.value} onClick={() => handleSortClick(opt.value)}
                                    className={`text-xs py-1 rounded transition-colors ${sortState.by === opt.value ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    {opt.label} {sortState.by === opt.value && (sortState.direction === 'asc' ? '▲' : '▼')}
                                </button>
                             ))}
                        </div>
                     )}
                </div>
                {renderCheckboxes("Type", "type", options.types)}
                {renderCheckboxes("Color", "color", options.colors)}
                {renderCheckboxes("Egg Group", "eggGroup", options.eggGroups)}
                {renderNumericFilters()}
            </div>
        </div>
    );
};