'use client';

import React from 'react';
import { 
  Sparkles, 
  Wrench, 
  Zap, 
  Flame, 
  Scissors, 
  Paintbrush, 
  KeyRound, 
  Hammer, 
  Snowflake, 
  PlusCircle 
} from 'lucide-react';
import { Category } from '@/types';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Scissors: <Scissors className="w-4 h-4" />,
  Paintbrush: <Paintbrush className="w-4 h-4" />,
  KeyRound: <KeyRound className="w-4 h-4" />,
  Hammer: <Hammer className="w-4 h-4" />,
  Snowflake: <Snowflake className="w-4 h-4" />,
  PlusCircle: <PlusCircle className="w-4 h-4" />,
};

export default function CategorySelector({
  categories,
  selectedCategory,
  onSelectCategory
}: CategorySelectorProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all select-none ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15 scale-102 ring-2 ring-slate-900/10'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span className={isSelected ? 'text-orange-400' : 'text-slate-400'}>
                {iconMap[cat.icon] || <Wrench className="w-4 h-4" />}
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
