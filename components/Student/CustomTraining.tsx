
import React, { useState } from 'react';
import { Tags, Difficulty } from '../../types';
import { SlidersHorizontal, ChevronRight, Target, Calendar, Briefcase, BookOpen, Layers, BarChart, Zap, X } from 'lucide-react';

interface CustomTrainingProps {
  tags: Tags;
  onStart: (filters: any) => void;
  onCancel: () => void;
}

export const CustomTraining: React.FC<CustomTrainingProps> = ({ tags, onStart, onCancel }) => {
  const [board, setBoard] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [topic, setTopic] = useState('');
  const [year, setYear] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [institution, setInstitution] = useState('');

  const handleStart = () => {
    onStart({ board, discipline, topic, year, difficulty, institution });
  };

  const isConfigured = board || discipline || topic || year || difficulty || institution;

  return (
    <div className="max-w-5xl mx-auto py-6 animate-in slide-in-from-bottom-8 duration-500">
      {/* Container Principal */}
      <div className="bg-[#F1F5F9] dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative">
        
        {/* Top Header */}
        <div className="bg-cyan-500 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-black text-cyan-500 rounded-3xl shadow-xl">
              <SlidersHorizontal className="w-8 h-8" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic text-black leading-none">Construtor de Missão</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60 mt-2">Sintetizando treinamento personalizado</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-4 bg-black/10 hover:bg-black/20 rounded-2xl transition-all group"
          >
            <X className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8 md:p-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <VisualSelect icon={<Target />} label="Banca" value={board} onChange={setBoard} options={tags.boards} />
            <VisualSelect icon={<BookOpen />} label="Disciplina" value={discipline} onChange={setDiscipline} options={tags.disciplines} />
            <VisualSelect 
              icon={<Layers />} 
              label="Assunto" 
              value={topic} 
              onChange={setTopic} 
              options={discipline ? (tags.topics[discipline] || []) : []} 
              disabled={!discipline}
              placeholder={discipline ? "Selecione um Assunto" : "Escolha a Matéria Antes"}
            />
            <VisualSelect icon={<Calendar />} label="Ano" value={year} onChange={setYear} options={tags.years} />
            <VisualSelect icon={<Briefcase />} label="Órgão" value={institution} onChange={setInstitution} options={tags.institutions} />
            <VisualSelect icon={<BarChart />} label="Dificuldade" value={difficulty} onChange={setDifficulty} options={['Fácil', 'Médio', 'Difícil']} />
          </div>

          {/* Footer Action */}
          <div className="mt-16 pt-10 border-t border-gray-400/20 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-white/10'} transition-colors animate-pulse`} />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-white/40">
                {isConfigured ? 'Parâmetros Identificados' : 'Aguardando Configuração Mínima'}
              </p>
            </div>
            
            <button 
              onClick={handleStart}
              className="w-full md:w-auto px-16 py-6 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.3em] text-[12px] rounded-3xl hover:scale-[1.05] hover:bg-cyan-500 dark:hover:bg-cyan-500 hover:text-black transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95"
            >
              Iniciar Operação <Zap className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VisualSelect = ({ icon, label, value, onChange, options, disabled = false, placeholder = "Todos" }: any) => (
  <div className={`group space-y-3 transition-all ${disabled ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 ml-4 flex items-center gap-2 group-focus-within:text-cyan-500 transition-colors">
      {React.cloneElement(icon, { className: "w-3.5 h-3.5" })} {label}
    </label>
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-200/50 dark:bg-white/[0.04] border-2 border-gray-300 dark:border-white/10 p-5 outline-none text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-white rounded-[1.5rem] focus:border-cyan-500 focus:bg-white dark:focus:bg-white/10 transition-all appearance-none cursor-pointer"
      >
        <option value="" className="bg-white dark:bg-black">{placeholder}</option>
        {options.map((o: any) => <option key={o} value={o} className="bg-white dark:bg-black">{o}</option>)}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-cyan-500 transition-colors">
        <ChevronRight className="w-4 h-4 rotate-90" />
      </div>
    </div>
  </div>
);
