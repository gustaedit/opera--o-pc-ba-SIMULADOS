
import React, { useState, useMemo } from 'react';
import { Shield, Target, ChevronRight, ChevronLeft, Zap, Layers, Award, SlidersHorizontal, Search, Play, Crosshair } from 'lucide-react';
import { Tags, Question } from '../../types';

interface TargetSelectorProps {
  tags: Tags;
  questions: Question[];
  onSelect: (filters: { contestClass?: string; institution?: string; isCustom?: boolean }) => void;
}

export const TargetSelector: React.FC<TargetSelectorProps> = ({ tags, questions, onSelect }) => {
  const [step, setStep] = useState<'class' | 'institution'>('class');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const availableInstitutions = useMemo(() => {
    if (!selectedClass) return [];
    // Filtra instituições que realmente possuem questões cadastradas na classe selecionada
    const insts = questions
      .filter(q => q.contestClass === selectedClass)
      .map(q => q.institution);
    return [...new Set(insts)];
  }, [selectedClass, questions]);

  const handleClassSelect = (cls: string) => {
    setSelectedClass(cls);
    setStep('institution');
  };

  const handleBack = () => {
    setStep('class');
    setSelectedClass(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-4 md:py-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Header com Progresso Operacional */}
      <div className="mb-16 text-center">
        <div className="flex justify-center items-center gap-6 mb-8">
          <div className={`w-4 h-4 rounded-full transition-all duration-500 border-2 ${step === 'class' ? 'bg-primary border-primary scale-125 shadow-[0_0_20px_#FACC15]' : 'bg-transparent border-gray-400 dark:border-white/20'}`} />
          <div className="w-16 h-0.5 bg-gray-300 dark:bg-white/10 rounded-full" />
          <div className={`w-4 h-4 rounded-full transition-all duration-500 border-2 ${step === 'institution' ? 'bg-primary border-primary scale-125 shadow-[0_0_20px_#FACC15]' : 'bg-transparent border-gray-400 dark:border-white/20'}`} />
        </div>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white leading-none">
          {step === 'class' ? 'Defina sua Carreira' : 'Selecione o Alvo'}
        </h2>
        <p className="text-gray-600 dark:text-white/40 font-bold uppercase tracking-[0.4em] text-[11px] mt-4">
          {step === 'class' ? 'ESCOLHA UMA CLASSE OPERACIONAL PARA INICIAR' : `ÓRGÃOS DISPONÍVEIS PARA: ${selectedClass}`}
        </p>
      </div>

      {step === 'class' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Card Principal: Treino Personalizado */}
          <div className="md:col-span-12">
            <button
              onClick={() => onSelect({ isCustom: true })}
              className="w-full group relative p-10 md:p-14 flex flex-col md:flex-row items-center justify-between bg-black dark:bg-white text-white dark:text-black rounded-[3rem] hover:scale-[1.01] transition-all shadow-2xl overflow-hidden border-4 border-primary/20"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transform rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-700">
                <Crosshair className="w-60 h-60" />
              </div>
              <div className="flex flex-col md:flex-row items-center gap-10 z-10 text-center md:text-left">
                <div className="p-6 bg-primary text-black rounded-[2rem] shadow-xl">
                  <SlidersHorizontal className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter">Missão Customizada</h3>
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] opacity-60 mt-2">Configuração manual de filtros e banca examinadora</p>
                </div>
              </div>
              <div className="mt-10 md:mt-0 px-12 py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] group-hover:px-14 transition-all flex items-center gap-4 shadow-xl">
                CONFIGURAR <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          </div>

          {/* Grid de Carreiras */}
          {tags.contestClasses.map((cls) => (
            <div key={cls} className="md:col-span-6 lg:col-span-4">
              <button
                onClick={() => handleClassSelect(cls)}
                className="w-full group p-10 bg-white dark:bg-white/[0.03] border-2 border-gray-300 dark:border-white/10 rounded-[3rem] hover:border-primary hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-all text-left flex flex-col h-full shadow-sm hover:shadow-2xl relative overflow-hidden"
              >
                <div className="mb-8 p-5 bg-gray-200/50 dark:bg-white/5 rounded-2xl text-primary w-fit transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white group-hover:text-primary transition-colors pr-10">{cls}</h3>
                <div className="mt-auto pt-10 flex items-center justify-between border-t border-gray-400/20 dark:border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white/20">Acessar Setor</span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-white/5 group-hover:bg-primary group-hover:text-black transition-all">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </button>
            </div>
          ))}

          {/* Treino Global */}
          <div className="md:col-span-6 lg:col-span-4">
            <button
              onClick={() => onSelect({})}
              className="w-full h-full p-10 border-4 border-dashed border-gray-400 dark:border-white/10 rounded-[3rem] text-left hover:border-primary/50 group transition-all flex flex-col justify-center"
            >
              <div className="mb-8 p-5 bg-gray-200/50 dark:bg-white/5 rounded-2xl text-gray-400 dark:text-white/10 w-fit group-hover:text-primary transition-colors">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-400 dark:text-white/20 group-hover:text-gray-900 dark:group-hover:text-white">Operação Total</h3>
              <p className="text-[10px] font-bold text-gray-400/60 uppercase mt-4 tracking-widest">Acesso irrestrito a todas as questões</p>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between px-6">
            <button 
              onClick={handleBack}
              className="flex items-center gap-4 px-8 py-4 bg-white dark:bg-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-white/40 hover:text-primary border-2 border-gray-300 dark:border-white/10 transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" /> Voltar ao Início
            </button>
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-8 py-4 rounded-2xl border-2 border-primary/20 shadow-lg shadow-primary/5">
              FASE 02: IDENTIFICAÇÃO DO ALVO
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableInstitutions.map((inst) => (
              <button
                key={inst}
                onClick={() => onSelect({ contestClass: selectedClass!, institution: inst })}
                className="group relative p-10 bg-white dark:bg-white/[0.03] border-2 border-gray-300 dark:border-white/10 rounded-[3rem] hover:border-primary hover:shadow-2xl transition-all text-left flex flex-col shadow-sm"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                    <Target className="w-8 h-8" />
                  </div>
                  <div className="p-3 rounded-full bg-primary/0 group-hover:bg-primary/20 transition-all">
                    <Play className="w-6 h-6 text-transparent group-hover:text-primary fill-current" />
                  </div>
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white mb-10 leading-none">
                  {inst}
                </h4>
                <div className="mt-auto flex items-center gap-4">
                  <div className="h-1.5 flex-1 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/30 w-full group-hover:bg-primary transition-all duration-700" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">Engajar</span>
                </div>
              </button>
            ))}

            {availableInstitutions.length === 0 && (
              <div className="col-span-full py-40 text-center bg-gray-100 dark:bg-white/[0.01] border-4 border-dashed border-gray-300 dark:border-white/10 rounded-[4rem] space-y-8">
                 <div className="w-24 h-24 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
                    <Award className="w-12 h-12 text-gray-400 dark:text-white/10" />
                 </div>
                 <div className="space-y-4">
                    <p className="text-gray-900 dark:text-white font-black uppercase tracking-[0.4em] text-2xl italic">Alvos Não Localizados</p>
                    <p className="text-gray-500 dark:text-white/20 font-bold uppercase tracking-widest text-[11px] max-w-sm mx-auto leading-relaxed">
                      Novos cenários táticos estão sendo processados. Tente selecionar outra classe operacional.
                    </p>
                 </div>
                 <button onClick={handleBack} className="px-12 py-5 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all">Explorar Outras Carreiras</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
