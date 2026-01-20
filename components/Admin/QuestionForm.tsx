
import React, { useState, useEffect } from 'react';
import { Tags, Question, Difficulty } from '../../types';
import { Save, ChevronRight, ChevronLeft, Command, CheckCircle2, X } from 'lucide-react';

interface QuestionFormProps {
  tags: Tags;
  onSave: (q: Question) => void;
  initialData?: Question | null;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ tags, onSave, initialData }) => {
  const [step, setStep] = useState(1);
  const [text, setText] = useState('');
  const [options, setOptions] = useState([
    { id: 'a', label: 'A', text: '' },
    { id: 'b', label: 'B', text: '' },
    { id: 'c', label: 'C', text: '' },
    { id: 'd', label: 'D', text: '' },
    { id: 'e', label: 'E', text: '' },
  ]);
  const [correctOptionId, setCorrectOptionId] = useState('a');
  const [comment, setComment] = useState('');
  
  const [selectedInstitution, setSelectedInstitution] = useState(tags.institutions[0]);
  // Fixed: positions now exists on Tags type. Default to empty string if not available.
  const [selectedPosition, setSelectedPosition] = useState(tags.positions?.[0] || '');
  const [selectedBoard, setSelectedBoard] = useState(tags.boards[0]);
  const [selectedYear, setSelectedYear] = useState(tags.years[0]);
  const [selectedDiscipline, setSelectedDiscipline] = useState(tags.disciplines[0]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Médio');
  const [selectedContestClass, setSelectedContestClass] = useState(tags.contestClasses[0]);

  useEffect(() => {
    if (initialData) {
      setText(initialData.text);
      setOptions(initialData.options);
      setCorrectOptionId(initialData.correctOptionId);
      setComment(initialData.comment);
      setSelectedInstitution(initialData.institution);
      setSelectedPosition(initialData.position);
      setSelectedBoard(initialData.board);
      setSelectedYear(initialData.year);
      setSelectedDiscipline(initialData.discipline);
      setSelectedTopic(initialData.topic);
      setSelectedDifficulty(initialData.difficulty);
      setSelectedContestClass(initialData.contestClass);
    }
  }, [initialData, tags]);

  const handleSubmit = () => {
    if (!text || options.some(o => !o.text)) {
      alert('Preencha o enunciado e todas as alternativas!');
      return;
    }

    const newQuestion: Question = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      text,
      options,
      correctOptionId,
      comment,
      institution: selectedInstitution,
      position: selectedPosition,
      board: selectedBoard,
      year: selectedYear,
      discipline: selectedDiscipline,
      topic: selectedTopic,
      difficulty: selectedDifficulty,
      contestClass: selectedContestClass,
      createdAt: initialData?.createdAt || Date.now()
    };

    onSave(newQuestion);
    if (!initialData) {
      setStep(1);
      setText('');
      setOptions(options.map(o => ({ ...o, text: '' })));
      setComment('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-10 px-6">
        <h3 className="text-2xl font-black uppercase tracking-widest flex items-center gap-4 italic text-gray-900 dark:text-white/90">
          <Command className="w-7 h-7 text-primary" /> {initialData ? 'Atualizar Alvo' : 'Registro de Alvos'}
        </h3>
        <div className="flex gap-4">
          {[1, 2].map(i => (
            <div key={i} className={`h-2.5 w-16 rounded-full ${step >= i ? 'bg-primary' : 'bg-gray-300 dark:bg-white/10'}`} />
          ))}
        </div>
      </div>

      <div className="bg-[#F8FAFC] dark:bg-white/[0.03] border border-gray-300 dark:border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
        {step === 1 ? (
          <div className="space-y-12 animate-in fade-in">
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Comando da Questão</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-6 bg-gray-300/50 dark:bg-black/40 border border-gray-400 dark:border-white/5 rounded-3xl text-lg font-bold outline-none h-60 text-gray-900 dark:text-white"
                placeholder="Insira o enunciado..."
              />
            </div>

            <div className="space-y-6">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Alternativas</label>
              <div className="grid grid-cols-1 gap-4">
                {options.map((opt) => (
                  <div key={opt.id} className={`flex items-center gap-5 p-4 border-2 rounded-2xl ${correctOptionId === opt.id ? 'border-primary bg-primary/5' : 'border-gray-400 dark:border-white/5'}`}>
                    <input 
                      type="radio" 
                      checked={correctOptionId === opt.id}
                      onChange={() => setCorrectOptionId(opt.id)}
                      className="w-6 h-6 accent-primary"
                    />
                    <span className="font-black italic text-gray-600 dark:text-white/30 text-xl">{opt.label}</span>
                    <input 
                      type="text" 
                      value={opt.text}
                      onChange={(e) => {
                        const next = [...options];
                        next[next.findIndex(o => o.id === opt.id)].text = e.target.value;
                        setOptions(next);
                      }}
                      className="flex-1 bg-transparent p-2 outline-none font-bold text-gray-900 dark:text-white"
                      placeholder={`Texto da ${opt.label}...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setStep(2)} className="w-full py-6 bg-primary text-black font-black uppercase tracking-[0.3em] rounded-2xl">
              Próxima Fase
            </button>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <AdminSelect label="Carreira" value={selectedContestClass} onChange={setSelectedContestClass} options={tags.contestClasses} />
               <AdminSelect label="Cargo" value={selectedPosition} onChange={setSelectedPosition} options={tags.positions || []} />
               <AdminSelect label="Órgão" value={selectedInstitution} onChange={setSelectedInstitution} options={tags.institutions} />
               <AdminSelect label="Matéria" value={selectedDiscipline} onChange={setSelectedDiscipline} options={tags.disciplines} />
               <AdminSelect label="Assunto" value={selectedTopic} onChange={setSelectedTopic} options={tags.topics[selectedDiscipline] || ['Geral']} />
               <AdminSelect label="Banca" value={selectedBoard} onChange={setSelectedBoard} options={tags.boards} />
               <AdminSelect label="Ano" value={selectedYear} onChange={setSelectedYear} options={tags.years} />
               <AdminSelect label="Dificuldade" value={selectedDifficulty} onChange={setSelectedDifficulty} options={['Fácil', 'Médio', 'Difícil']} />
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Comentário</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-8 bg-gray-300/50 dark:bg-black/40 border border-gray-400 dark:border-white/5 rounded-3xl outline-none h-40 italic font-bold text-gray-800 dark:text-white/70"
                placeholder="Explicação..."
              />
            </div>

            <div className="flex gap-6">
              <button onClick={() => setStep(1)} className="px-10 py-6 bg-gray-200 dark:bg-white/5 border rounded-2xl font-black uppercase text-[11px]">Voltar</button>
              <button onClick={handleSubmit} className="flex-1 py-6 bg-primary text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl">
                {initialData ? 'Atualizar' : 'Finalizar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminSelect = ({ label, value, onChange, options }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-white/30">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-300/50 dark:bg-black/40 border-2 border-gray-400 dark:border-white/10 p-5 outline-none text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white rounded-2xl"
    >
      {options.map((o: any) => <option key={o} value={o} className="bg-white dark:bg-[#111]">{o}</option>)}
    </select>
  </div>
);