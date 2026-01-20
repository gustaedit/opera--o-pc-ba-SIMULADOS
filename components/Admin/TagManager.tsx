
import React, { useState } from 'react';
import { Tags } from '../../types';
import { Plus, Trash2, Tag as TagIcon, Layers } from 'lucide-react';

interface TagManagerProps {
  tags: Tags;
  onUpdate: (tags: Tags) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ tags, onUpdate }) => {
  const [newVal, setNewVal] = useState('');
  const [activeCategory, setActiveCategory] = useState<keyof Tags>('boards');

  const addTag = () => {
    if (!newVal.trim()) return;
    const updated = { ...tags };
    if (activeCategory === 'topics') return;
    const list = updated[activeCategory] as string[];
    if (!list.includes(newVal)) {
      (updated[activeCategory] as string[]).push(newVal);
      onUpdate(updated);
    }
    setNewVal('');
  };

  const removeTag = (val: string) => {
    const updated = { ...tags };
    if (activeCategory === 'topics') return;
    (updated[activeCategory] as string[]) = (updated[activeCategory] as string[]).filter(v => v !== val);
    onUpdate(updated);
  };

  const categories: { key: keyof Tags; label: string }[] = [
    { key: 'boards', label: 'Bancas' },
    { key: 'institutions', label: 'Órgãos' },
    { key: 'contestClasses', label: 'Classes' },
    // Added positions to TagManager categories
    { key: 'positions', label: 'Cargos' },
    { key: 'disciplines', label: 'Disciplinas' },
    { key: 'years', label: 'Anos' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map(cat => (
          <button
            key={cat.key as string}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${
              activeCategory === cat.key 
                ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20 scale-105' 
                : 'bg-gray-200/50 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/40 hover:border-primary/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="bg-[#F1F5F9] dark:bg-white/[0.03] rounded-[2.5rem] border border-gray-300 dark:border-white/10 shadow-2xl dark:shadow-none overflow-hidden">
        <div className="p-8 md:p-12 border-b border-gray-300 dark:border-white/10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white/30 ml-4">Novo Registro em {categories.find(c => c.key === activeCategory)?.label}</label>
            <input 
              type="text" 
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              className="w-full p-5 bg-gray-200 dark:bg-black/40 border-2 border-gray-300 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-gray-900 dark:text-white font-bold placeholder:text-gray-400 dark:placeholder:text-white/10 shadow-inner"
              placeholder="Digite o nome da etiqueta..."
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
          </div>
          <button 
            onClick={addTag}
            className="w-full md:w-auto px-10 py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:brightness-110 shadow-lg shadow-primary/10 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Inserir
          </button>
        </div>

        <div className="p-8 md:p-12">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20 mb-8 flex items-center gap-3">
            <Layers className="w-4 h-4" /> Ativos no Banco
          </h4>
          <div className="flex flex-wrap gap-4">
            {(tags[activeCategory] as string[]).map(tag => (
              <div key={tag} className="flex items-center gap-4 px-6 py-3 bg-gray-200 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-300 dark:border-white/10 font-bold group hover:border-primary transition-all">
                <TagIcon className="w-4 h-4 text-primary" />
                <span className="text-sm tracking-tight">{tag}</span>
                <button 
                  onClick={() => removeTag(tag)}
                  className="p-1.5 text-gray-400 dark:text-white/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(tags[activeCategory] as string[]).length === 0 && (
              <p className="text-gray-400 dark:text-white/10 font-bold uppercase tracking-[0.2em] italic">Nenhuma etiqueta cadastrada nesta categoria</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};