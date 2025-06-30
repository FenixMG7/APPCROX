import React, { useState, useEffect } from 'react';
import { Child } from '../types';
import { getAvatarComponent } from '../constants';
import { calculateWeeklyEarnings } from '../App';
import { TrophyIcon } from './icons';

const useCountUp = (end: number, start = 0, duration = 1500) => {
  const [count, setCount] = useState(start);
  const animationFrameId = React.useRef<number | undefined>(undefined);

  useEffect(() => {
    const startTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      
      if (elapsedTime < duration) {
        const progress = elapsedTime / duration;
        const easedProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
        setCount(start + (end - start) * easedProgress);
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [end, start, duration]);

  return count;
};

const ChildSummaryCard: React.FC<{ child: Child; animationDelay: number }> = ({ child, animationDelay }) => {
    const weeklyEarnings = calculateWeeklyEarnings(child.chores);
    const newTotal = child.totalEarnings + weeklyEarnings;
    const animatedTotal = useCountUp(newTotal, child.totalEarnings, 1500);
    const AvatarComponent = getAvatarComponent(child.avatarId);

    return (
        <div 
            className="bg-white rounded-2xl shadow-xl p-6 w-full animate-fade-in-up"
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <AvatarComponent />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 truncate">{child.name}</h3>
            </div>
            <div className="space-y-2 text-lg">
                <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">Gains de la semaine :</span>
                    <span className="font-bold text-green-500">+ {weeklyEarnings.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">Ancien total :</span>
                    <span className="font-semibold text-slate-600">{child.totalEarnings.toFixed(2)} €</span>
                </div>
            </div>
            <hr className="my-4 border-slate-200" />
            <div className="text-center">
                <p className="text-slate-500 font-semibold mb-1">Nouveau Total</p>
                <p className="text-5xl font-bold text-indigo-600">
                    {animatedTotal.toFixed(2)} €
                </p>
            </div>
        </div>
    );
};


export const WeeklySummaryModal: React.FC<{ children: Child[]; onComplete: () => void; }> = ({ children, onComplete }) => {
    
    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
            
            <div className="text-center mb-8 animate-fade-in-up">
                <h2 className="text-4xl sm:text-5xl font-bold text-white flex items-center gap-3">
                    <TrophyIcon />
                    <span>Résumé de la semaine</span>
                    <TrophyIcon />
                </h2>
                <p className="text-amber-300 text-lg mt-2">Félicitations pour votre travail !</p>
            </div>
            
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {children.map((child, index) => (
                    <ChildSummaryCard key={child.id} child={child} animationDelay={index * 200} />
                ))}
            </div>

            <button
                onClick={onComplete}
                className="px-8 py-3 bg-amber-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-amber-600 transition-transform transform hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${children.length * 200}ms` }}
            >
                Commencer la nouvelle semaine !
            </button>
        </div>
    );
};