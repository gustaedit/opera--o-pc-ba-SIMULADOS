
import React, { useState, useMemo } from 'react';
import { Tags, Question, QuestionPackage } from '../../types';
import { Package, Search, Plus, ListCheck, Save, Filter, ChevronRight, Check } from 'lucide-react';

interface PackageManagerProps {
  tags: Tags;
  questions: Question[];
  onSave: (pkg: QuestionPackage) => void;
}

export const PackageManager: React.FC<PackageManagerProps> = ({ tags, questions, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [disciplineFilter, setDisciplineFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (disciplineFilter && q.discipline !== disciplineFilter) return false;
      if (boardFilter && q.board !== boardFilter) return false;
      return true;
    });
  }, [questions, disciplineFilter, boardFilter]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = () => {
    if (!name || selectedIds.length === 0) {
      alert('Atenção: Nome do pacote e seleção de questões são obrigatórios!');
      return;
    }
    const pkg: QuestionPackage = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      questionIds: selectedIds,
      createdAt: Date.now()
    };
    onSave(pkg);
    setName('');
    setDescription('');
    setSelectedIds([]);
    alert('Pacote estratégico publicado com sucesso!');
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 py-6">
      {/* Configuration */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#F1F5F9] dark:bg-white/[0.03] p-8 md:p-10 rounded-[2.5rem] border border-gray-300 dark:border-white/10 shadow-xl space-y-8 sticky top-28">
          <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-4 text-gray-900 dark:text-white">
            <Package className="w-7 h-7 text-primary" /> Setup do Pacote
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white/30 ml-2">Título da Operação</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-gray-200 dark:bg-black/40 border-2 border-gray-300 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white font-bold outline-none focus:border-primary/50 shadow-inner"
                placeholder="Ex: Simulado PC-SP 2025"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white/30 ml-2">Breve Descrição</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-gray-200 dark:bg-black/40 border-2 border-gray-300 dark:border-white/10 rounded-2xl h-32 text-gray-900 dark:text-white font-bold outline-none focus:border-primary/50 shadow-inner resize-none"
                placeholder="Foco em Direito e Gramática..."
              />
            </div>
          </div>

          <div className="pt-8 border-t border-gray-300 dark:border-white/10">
             <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest mb-6 px-2">
                <span className="text-gray-500 dark:text-white/40">Alvos Selecionados:</span>
                <span className="bg-primary text-black px-4 py-1.5 rounded-full shadow-lg shadow-primary/20">{selectedIds.length}</span>
             </div>
             <button 
                onClick={handleSave}
                className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:brightness-110 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Save className="w-5 h-5" /> Publicar Alvos
              </button>
          </div>
        </div>
      </div>

      {/* Selector */}
      <div className="lg:col-span-2 space-y-10">
        <div className="bg-[#F1F5F9] dark:bg-white/[0.03] p-8 md:p-12 rounded-[2.5rem] border border-gray-300 dark:border-white/10 shadow-2xl dark:shadow-none">
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            <div className="flex-1 space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white/30 ml-4 flex items-center gap-2"><Filter className="w-3 h-3" /> Matéria</label>
               <select 
                value={disciplineFilter} 
                onChange={(e) => setDisciplineFilter(e.target.value)}
                className="w-full p-4 bg-gray-200 dark:bg-black/40 border-2 border-gray-300 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white outline-none focus:border-primary/50 appearance-none cursor-pointer"
               >
                 <option value="">Todas</option>
                 {tags.disciplines.map(d => <option key={d} value={d}>{d}</option>)}
               </select>
            </div>
            <div className="flex-1 space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white/30 ml-4 flex items-center gap-2"><Filter className="w-3 h-3" /> Banca</label>
               <select 
                value={boardFilter} 
                onChange={(e) => setBoardFilter(e.target.value)}
                className="w-full p-4 bg-gray-200 dark:bg-black/40 border-2 border-gray-300 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white outline-none focus:border-primary/50 appearance-none cursor-pointer"
               >
                 <option value="">Todas</option>
                 {tags.boards.map(d => <option key={d} value={d}>{d}</option>)}
               </select>
            </div>
          </div>

          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20 flex items-center gap-3 px-2">
               <ListCheck className="w-4 h-4" /> Unidades Disponíveis ({filteredQuestions.length})
             </h4>
             <div className="max-h-[600px] overflow-y-auto space-y-4 pr-4 custom-scrollbar">
                {filteredQuestions.map(q => {
                  const isSelected = selectedIds.includes(q.id);
                  return (
                    <div 
                      key={q.id}
                      onClick={() => toggleSelection(q.id)}
                      className={`p-6 bg-gray-200/50 dark:bg-black/20 border-2 rounded-3xl cursor-pointer transition-all flex gap-6 group ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                          : 'border-gray-300 dark:border-white/5 hover:border-primary/40'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? 'bg-primary border-primary shadow-lg shadow-primary/30' : 'bg-gray-300 dark:bg-white/5 border-gray-400 dark:border-white/10'
                      }`}>
                         {isSelected ? <Check className="w-6 h-6 text-black" /> : <Plus className="w-5 h-5 text-gray-500 dark:text-white/20 group-hover:text-primary transition-colors" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary">{q.board}</span>
                          <span className="text-gray-400 dark:text-white/10">|</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-white/40">{q.institution}</span>
                          <span className="text-gray-400 dark:text-white/10">|</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-white/40">{q.year}</span>
                        </div>
                        <p className={`text-sm font-bold line-clamp-2 transition-colors ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-white/60'}`}>{q.text}</p>
                        <div className="mt-4 flex gap-3">
                          <span className="text-[8px] font-black uppercase bg-gray-300 dark:bg-white/10 px-3 py-1 rounded-full text-gray-500 dark:text-white/40">{q.discipline}</span>
                          <span className="text-[8px] font-black uppercase bg-gray-300 dark:bg-white/10 px-3 py-1 rounded-full text-gray-500 dark:text-white/40">{q.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredQuestions.length === 0 && (
                  <div className="py-20 text-center text-gray-400 dark:text-white/10 font-bold uppercase tracking-[0.4em] italic text-xs">
                    Nenhuma unidade tática encontrada
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
