
import React, { useMemo, useState } from 'react';
import { Question } from '../../types';
import { Database, Search, ChevronRight, BookOpen, Trash2, Edit, Target, Calendar } from 'lucide-react';

interface QuestionManagerProps {
  questions: Question[];
  onDelete: (id: string) => void;
  onEdit: (q: Question) => void;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({ questions, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDiscipline, setExpandedDiscipline] = useState<string | null>(null);

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, Question[]> = {};
    const filtered = questions.filter(q => 
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach(q => {
      if (!groups[q.discipline]) groups[q.discipline] = [];
      groups[q.discipline].push(q);
    });
    return groups;
  }, [questions, searchTerm]);

  const disciplines = Object.keys(groupedQuestions).sort();

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/40 dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 p-8 rounded-[2.5rem]">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-primary text-black rounded-3xl shadow-xl shadow-primary/20">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white leading-none">Arquivo de Inteligência</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-white/30 mt-2">Gestão de alvos táticos indexados</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="PESQUISAR ENUNCIADO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-gray-200 dark:bg-black/40 border-2 border-gray-300 dark:border-white/10 rounded-2xl outline-none text-[10px] font-black uppercase text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        {disciplines.length > 0 ? (
          disciplines.map((disc) => (
            <div key={disc} className="bg-white/40 dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
              <button 
                onClick={() => setExpandedDiscipline(expandedDiscipline === disc ? null : disc)}
                className="w-full flex items-center justify-between p-8 hover:bg-gray-200/50 dark:hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-6">
                  <div className={`p-3 rounded-2xl ${expandedDiscipline === disc ? 'bg-primary text-black' : 'bg-gray-300/50 dark:bg-white/5 text-gray-500'}`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-black uppercase italic text-gray-900 dark:text-white">{disc}</h3>
                    <p className="text-[9px] font-black text-gray-500 uppercase mt-1">{groupedQuestions[disc].length} ALVOS</p>
                  </div>
                </div>
                {expandedDiscipline === disc ? <ChevronDownIcon className="w-6 h-6 text-primary" /> : <ChevronRight className="w-6 h-6 text-gray-400" />}
              </button>

              {expandedDiscipline === disc && (
                <div className="px-8 pb-8 pt-2 grid grid-cols-1 gap-4 animate-in slide-in-from-top-2">
                  {groupedQuestions[disc].map((q) => (
                    <div key={q.id} className="group p-6 bg-gray-200/30 dark:bg-black/20 border border-gray-300 dark:border-white/5 rounded-3xl hover:border-primary/40 transition-all">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-full border border-primary/20">{q.board}</span>
                            <span className="text-[9px] font-black uppercase text-gray-500 flex items-center gap-2"><Target className="w-3 h-3" /> {q.institution}</span>
                            <span className="text-[9px] font-black uppercase text-gray-500 flex items-center gap-2"><Calendar className="w-3 h-3" /> {q.year}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white/80 italic line-clamp-2">"{q.text}"</p>
                        </div>

                        <div className="flex md:flex-col items-center justify-center gap-3 md:border-l border-gray-300 dark:border-white/10 md:pl-6">
                           <button onClick={() => onEdit(q)} className="p-3 bg-gray-300 dark:bg-white/5 rounded-2xl text-gray-600 hover:text-primary transition-all">
                              <Edit className="w-4 h-4" />
                           </button>
                           <button 
                            onClick={() => confirm('Remover questão do banco?') && onDelete(q.id)}
                            className="p-3 bg-red-500/10 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-40 text-center space-y-6 bg-white/40 dark:bg-white/[0.02] border border-dashed border-gray-300 rounded-[3rem]">
             <Database className="w-16 h-16 text-gray-300 mx-auto" />
             <p className="text-gray-900 dark:text-white font-black uppercase text-lg">Nenhum registro localizado</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ChevronDownIcon = ({ className }: { className: string }) => <ChevronRight className={`${className} rotate-90`} />;
