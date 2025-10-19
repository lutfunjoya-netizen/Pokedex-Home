import React, { useState, useEffect, useRef } from 'react';
import { STAT_NAMES, STAT_DESCRIPTIONS } from '../constants';
import { InfoPanel } from './InfoPanel';
import { HelpTooltip } from './common/HelpTooltip';
import { PlayIcon } from './icons/PlayIcon';
import { HoverTooltip } from './common/HoverTooltip';

interface StatChartProps {
    baseStats: {
        hp: number;
        attack: number;
        defense: number;
        specialAttack: number;
        specialDefense: number;
        speed: number;
    };
}

const statMapping = {
    hp: 'hp',
    attack: 'attack',
    defense: 'defense',
    specialAttack: 'special-attack',
    specialDefense: 'special-defense',
    speed: 'speed',
};

const statOrder: (keyof StatChartProps['baseStats'])[] = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];

interface FlyingNumber {
    value: number;
    id: number;
    style: React.CSSProperties;
}

export const StatChart: React.FC<StatChartProps> = ({ baseStats }) => {
    const [animationState, setAnimationState] = useState<{
        isAnimating: 'bst' | 'bsp' | null;
        step: number;
        currentValue: number;
    }>({ isAnimating: null, step: 0, currentValue: 0 });

    const [flyingNumbers, setFlyingNumbers] = useState<FlyingNumber[]>([]);
    const [isFlashing, setIsFlashing] = useState<'bst' | 'bsp' | null>(null);
    
    const panelRef = useRef<HTMLDivElement>(null);
    const statValueRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const totalRef = useRef<HTMLDivElement>(null);
    const productRef = useRef<HTMLDivElement>(null);

    const total = Object.values(baseStats).reduce((sum, val) => sum + val, 0);
    const product = Object.values(baseStats).reduce((prod, val) => val > 0 ? prod * val : prod, 1);
    const maxStat = 255;

    useEffect(() => {
        // Reset animations if the pokemon changes
        setAnimationState({ isAnimating: null, step: 0, currentValue: 0 });
        setFlyingNumbers([]);
    }, [baseStats]);
    
    useEffect(() => {
        if (!animationState.isAnimating || animationState.step >= statOrder.length) {
            if(animationState.isAnimating) {
                 setTimeout(() => setAnimationState({ isAnimating: null, step: 0, currentValue: 0 }), 500);
            }
            return;
        }

        const statKey = statOrder[animationState.step];
        const statValue = baseStats[statKey];

        const startEl = statValueRefs.current[animationState.step];
        const targetEl = animationState.isAnimating === 'bst' ? totalRef.current : productRef.current;
        const panelEl = panelRef.current;

        if (!startEl || !targetEl || !panelEl) return;

        const panelRect = panelEl.getBoundingClientRect();
        const startRect = startEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        const id = Date.now();
        const initialStyle: React.CSSProperties = {
            position: 'absolute',
            top: `${startRect.top - panelRect.top}px`,
            left: `${startRect.left - panelRect.left}px`,
            opacity: 1,
            transition: 'all 0.5s ease-in-out',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            color: '#FBBF24', // yellow-400
            textShadow: '0 0 8px rgba(251, 191, 36, 0.7)',
            zIndex: 50,
        };
        
        const newFlyingNumber = { value: statValue, id, style: initialStyle };
        setFlyingNumbers(prev => [...prev, newFlyingNumber]);

        setTimeout(() => {
            setFlyingNumbers(prev => prev.map(n => 
                n.id === id ? { ...n, style: {
                    ...n.style,
                    top: `${targetRect.top - panelRect.top + targetRect.height / 2 - 10}px`,
                    left: `${targetRect.left - panelRect.left + targetRect.width / 2 - 10}px`,
                    opacity: 0,
                    transform: 'scale(0.5)',
                }} : n
            ));
        }, 50);

        setTimeout(() => {
            const type = animationState.isAnimating;
            if (type) {
                setIsFlashing(type);
                setTimeout(() => setIsFlashing(null), 300);
            }

            setAnimationState(prev => ({
                ...prev,
                currentValue: prev.isAnimating === 'bst' ? prev.currentValue + statValue : prev.currentValue * (statValue || 1),
            }));
            setFlyingNumbers(prev => prev.filter(n => n.id !== id));
             setTimeout(() => {
                 setAnimationState(prev => ({ ...prev, step: prev.step + 1 }));
            }, 100);
        }, 550);

    }, [animationState.step, animationState.isAnimating, baseStats]);

    const runAnimation = (type: 'bst' | 'bsp') => {
        if (animationState.isAnimating) return;
        setAnimationState({
            isAnimating: type,
            step: 0,
            currentValue: type === 'bst' ? 0 : 1
        });
    };

    const tooltipContent = (
      <div className="text-sm">
        <h4 className="font-bold mb-2">Base Stats Explained</h4>
        <p><strong className="text-yellow-400">Base Stat Total (BST):</strong> The sum of all six base stats. A general measure of a Pokémon's overall strength.</p>
        <p className="mt-2"><strong className="text-yellow-400">Base Stat Product (BSP):</strong> The product of all six base stats. This metric can highlight well-rounded Pokémon.</p>
      </div>
    );
    
    return (
        <div className="relative" ref={panelRef}>
             <InfoPanel title="Base Stats">
                <div className="absolute top-6 right-6 z-10">
                    <HelpTooltip content={tooltipContent} />
                </div>
                {flyingNumbers.map(n => <div key={n.id} style={n.style}>{n.value}</div>)}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Stat Bars */}
                    <div className="space-y-3">
                        {statOrder.map((key, index) => {
                            const statKey = statMapping[key];
                            const statInfo = STAT_NAMES[statKey];
                            const isHighlighted = animationState.isAnimating !== null && animationState.step > index;
                            return (
                                <HoverTooltip key={key} content={STAT_DESCRIPTIONS[statKey]}>
                                    <div className={`flex items-center transition-all duration-300 p-1 rounded-md ${isHighlighted ? 'bg-yellow-500/20' : ''}`}>
                                        <span className="w-28 font-semibold text-gray-400">{statInfo.long}</span>
                                        <span ref={el => { statValueRefs.current[index] = el; }} className="w-12 text-right font-bold transition-opacity duration-300">
                                            {baseStats[key]}
                                        </span>
                                        <div className="flex-grow bg-gray-700 rounded-full h-5 ml-4">
                                            <div
                                                className={`${statInfo.color} h-5 rounded-full`}
                                                style={{ width: `${(baseStats[key] / maxStat) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </HoverTooltip>
                            );
                        })}
                    </div>

                    {/* Calculation Area */}
                    <div className="flex flex-col justify-center items-center space-y-6 bg-gray-900/50 p-6 rounded-lg">
                        <div ref={totalRef} className={`text-center p-2 rounded-lg ${isFlashing === 'bst' ? 'flash-effect' : ''}`}>
                            <h4 className="text-lg font-bold text-gray-300">Base Stat Total</h4>
                            <p className="text-5xl font-extrabold text-yellow-400 my-2 min-h-[60px]">
                                {animationState.isAnimating === 'bst' ? animationState.currentValue : total}
                            </p>
                            <button onClick={() => runAnimation('bst')} disabled={!!animationState.isAnimating} className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">
                                <PlayIcon /> Animate
                            </button>
                        </div>
                         <div ref={productRef} className={`text-center p-2 rounded-lg ${isFlashing === 'bsp' ? 'flash-effect' : ''}`}>
                            <h4 className="text-lg font-semibold text-gray-300">Base Stat Product</h4>
                             <p className="text-3xl font-bold text-yellow-400 my-2 min-h-[40px]">
                                {(animationState.isAnimating === 'bsp' ? animationState.currentValue : product).toLocaleString()}
                            </p>
                            <button onClick={() => runAnimation('bsp')} disabled={!!animationState.isAnimating} className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">
                                <PlayIcon /> Animate
                            </button>
                        </div>
                    </div>
                </div>
            </InfoPanel>
        </div>
    );
};