import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Question } from './types';
import { 
  Shield, 
  ArrowRight, 
  Loader2, 
  Clock, 
  Award, 
  History,
  CheckCircle2,
  MousePointer2,
  Scissors,
  ChevronLeft
} from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<'landing' | 'simulation' | 'result'>('landing');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<{isCorrect: boolean, timeSpent: number}[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);
  
  // Estados para novas funcionalidades[cite: 1]
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<number, string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

  const [questions, setQuestions] = useState<Question[]>([]); 
  const [isFetching, setIsFetching] = useState(true);

  // --- CARREGAMENTO DAS QUESTÕES ---[cite: 1]
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('lead_questions')
          .select('*')
          .order('createdAt', { ascending: false }); 

        if (!error && data && data.length > 0) {
          const mapped = data.map(q => {
            let parsedOptions = q.options;
            if (typeof q.options === 'string') {
              try { parsedOptions = JSON.parse(q.options); } catch (e) { parsedOptions = {}; }
            }

            let optionsArray = [];
            if (Array.isArray(parsedOptions)) {
                optionsArray = parsedOptions;
            } else if (typeof parsedOptions === 'object') {
                optionsArray = Object.entries(parsedOptions).map(([key, value]) => ({
                    id: key.toLowerCase(), 
                    text: value as string,
                    label: key.toUpperCase()
                }));
            }

            return {
              ...q,
              options: optionsArray,
              correctOptionId: q.correctOptionId?.toLowerCase()
            };
          });

          const validQuestions = mapped.filter(q => q.options.length > 0);
          if (validQuestions.length > 0) setQuestions(validQuestions);
        }
      } catch (err) {
        console.warn("Erro ao acessar lead_questions:", err);
      } finally {
        setIsFetching(false);
      }
    };
    loadQuestions();
  }, []);

  // --- INÍCIO DO SIMULADO ---[cite: 1]
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes('@')) {
      setError('Insira um e-mail válido.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: prev } = await supabase
        .from('lead_answers')
        .select('is_correct, time_spent')
        .eq('lead_email', cleanEmail);

      if (prev && prev.length > 0) {
        const mapped = prev.map((a: any) => ({ 
          isCorrect: a.is_correct, 
          timeSpent: a.time_spent 
        }));
        setAnswers(mapped);
        setIsReturningUser(true);
        setStep('result');
        return;
      }

      await supabase.from('leads').upsert([{ email: cleanEmail }], { onConflict: 'email' });
      setStep('simulation');
      setStartTime(Date.now());
      setCurrentIdx(0);
      setAnswers([]);
      setSelectedOptions({});
      setEliminatedOptions({});
    } catch (err) {
      setStep('simulation');
      setStartTime(Date.now());
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DA TESOURA ---[cite: 1]
  const toggleEliminate = (optionId: string) => {
    setEliminatedOptions(prev => {
      const currentEliminated = prev[currentIdx] || [];
      const isEliminated = currentEliminated.includes(optionId);
      return {
        ...prev,
        [currentIdx]: isEliminated 
          ? currentEliminated.filter(id => id !== optionId)
          : [...currentEliminated, optionId]
      };
    });
    if (selectedOptions[currentIdx] === optionId) {
      setSelectedOptions(prev => ({ ...prev, [currentIdx]: '' }));
    }
  };

  // --- SELEÇÃO DE RESPOSTA ---[cite: 1]
  const handleSelect = (optionId: string) => {
    setSelectedOptions(prev => ({ ...prev, [currentIdx]: optionId }));
  };

  // --- NAVEGAÇÃO ---[cite: 1]
  const handleConfirmAndNext = async () => {
    const q = questions[currentIdx];
    const optionId = selectedOptions[currentIdx];
    if (!q || !optionId) return;

    const isCorrect = optionId.toLowerCase() === q.correctOptionId?.toLowerCase();
    const timeSpent = Date.now() - startTime;
    
    const newAnswers = [...answers];
    newAnswers[currentIdx] = { isCorrect, timeSpent };
    setAnswers(newAnswers);

    supabase.from('lead_answers').insert([{
        lead_email: email.toLowerCase().trim(),
        question_id: q.id,
        is_correct: isCorrect,
        time_spent: timeSpent
    }]);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setStartTime(Date.now());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStep('result');
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- RENDERS ---[cite: 1]
  if (step === 'landing') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700 relative overflow-hidden bg-black">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-black to-black -z-10" />
      <div className="w-24 h-24 bg-[#FACC15] flex items-center justify-center rounded-[2.5rem] shadow-2xl mb-10 border-4 border-black ring-4 ring-[#FACC15]/20">
        <Shield className="w-12 h-12 text-black stroke-[2.5px]" />
      </div>
      <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-4 leading-none">
        OPERACIONAL <span className="text-[#FACC15]">PM-BA</span>
      </h1>
      <div className="flex items-center gap-3 mb-12 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
        <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
          {isFetching ? 'BUSCANDO DADOS...' : `BASE: ${questions.length} ALVOS PRONTOS`}
        </p>
      </div>
      <form onSubmit={handleStart} className="w-full max-w-sm space-y-4">
        <input 
          type="email" placeholder="SEU MELHOR E-MAIL" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl outline-none focus:border-[#FACC15] focus:bg-white/10 transition-all font-bold text-white shadow-xl placeholder:text-white/20"
        />
        {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">{error}</p>}
        <button 
          disabled={loading || isFetching || questions.length === 0}
          className="w-full py-6 bg-[#FACC15] text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:bg-[#EAB308] hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>INICIAR SIMULADO <ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>
    </div>
  );

  if (step === 'simulation') {
    const q = questions[currentIdx];
    if (!q) return null;
    const progress = ((currentIdx + 1) / questions.length) * 100;
    const currentSelection = selectedOptions[currentIdx];
    const currentEliminated = eliminatedOptions[currentIdx] || [];

    return (
      <div className="min-h-screen bg-black p-4 md:p-10 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between mb-8">
           <div className="space-y-1">
             <span className="text-[#FACC15] text-[10px] font-black uppercase tracking-[0.3em]">PM-BA | Operação Investigador</span>
             <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Questão {currentIdx + 1} de {questions.length}</p>
           </div>
           <div className="flex items-center gap-4 px-6 py-2 bg-white/5 rounded-2xl border border-white/5">
             <Clock className="w-4 h-4 text-[#FACC15] animate-pulse" />
             <span className="text-white font-mono font-bold text-xs">EM PROGRESSO</span>
           </div>
        </header>

        <div className="max-w-4xl mx-auto w-full h-1.5 bg-white/5 rounded-full mb-12 overflow-hidden">
          <div className="h-full bg-[#FACC15] transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div className="bg-[#0D0D0D] border-t-4 border-[#FACC15] rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-8 relative flex-1">
            <div className="px-3 py-1 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-lg w-fit mb-8">
              <span className="text-[10px] font-black uppercase text-[#FACC15] tracking-widest">{q.discipline || 'CONHECIMENTOS GERAIS'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-12 tracking-tight">{q.text}</h2>
            
            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt, i) => {
                const isEliminated = currentEliminated.includes(opt.id);
                const isSelected = currentSelection === opt.id;
                return (
                  <div key={opt.id} className="flex gap-2 items-center group">
                    <button 
                      disabled={isEliminated}
                      onClick={() => handleSelect(opt.id)}
                      className={`flex-1 p-5 rounded-2xl text-left border transition-all font-medium flex items-start gap-5 
                        ${isEliminated ? 'opacity-20 grayscale cursor-not-allowed border-white/5' : 'hover:border-[#FACC15]/50 hover:bg-[#FACC15]/5'}
                        ${isSelected ? 'border-[#FACC15] bg-[#FACC15]/10 text-white' : 'border-white/5 bg-white/[0.02] text-white/70'}`}
                    >
                      <span className={`w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center text-xs font-black transition-all
                        ${isSelected ? 'bg-[#FACC15] text-black border-[#FACC15]' : 'border-white/10 bg-black/40'}`}>
                        {opt.label || String.fromCharCode(65 + i)}
                      </span>
                      <span className={`pt-1 text-sm md:text-base leading-snug ${isEliminated ? 'line-through' : ''}`}>{opt.text}</span>
                    </button>
                    <button 
                      onClick={() => toggleEliminate(opt.id)}
                      className={`p-4 rounded-xl border transition-all ${isEliminated ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-white/20 hover:text-white hover:border-white/30'}`}
                    >
                      <Scissors className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex gap-4 mb-10">
            <button 
              onClick={handleBack} disabled={currentIdx === 0}
              className="px-8 py-6 border border-white/10 text-white/40 font-black uppercase tracking-widest rounded-2xl hover:text-white hover:border-white/20 transition-all disabled:opacity-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleConfirmAndNext} disabled={!currentSelection}
              className="flex-1 py-6 bg-[#FACC15] text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:bg-[#EAB308] transition-all disabled:opacity-50"
            >
              {currentIdx === questions.length - 1 ? 'Finalizar Missão' : 'Confirmar & Próxima'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RESULTADO ---[cite: 1]
  const correctCount = answers.filter(a => a?.isCorrect).length;
  const scoreRate = Math.round((correctCount / (questions.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500">
      <div className="inline-flex p-8 bg-[#FACC15]/10 rounded-[3rem] border border-[#FACC15]/20 text-[#FACC15] mb-10 shadow-[0_0_40px_-10px_rgba(250,204,21,0.3)]">
        <Award className="w-16 h-16 stroke-[1.5px]" />
      </div>
      <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-2 leading-none">
        RESULTADO <span className="text-[#FACC15]">FINAL</span>
      </h2>
      <div className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-white/40 text-[10px] font-black uppercase tracking-widest mb-12">
        {isReturningUser ? <><History className="w-3 h-3" /> Histórico Recuperado</> : <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Operação Concluída</>}
      </div>
      <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-lg mb-12">
         <div className="p-8 bg-[#0A0A0A] border border-white/10 rounded-[2.5rem]">
            <span className="block text-[9px] font-black uppercase text-white/30 tracking-[0.3em] mb-4">Aproveitamento</span>
            <p className={`text-5xl font-black ${scoreRate >= 70 ? 'text-emerald-400' : 'text-white'}`}>{scoreRate}%</p>
         </div>
         <div className="p-8 bg-[#0A0A0A] border border-white/10 rounded-[2.5rem]">
            <span className="block text-[9px] font-black uppercase text-white/30 tracking-[0.3em] mb-4">Acertos</span>
            <p className="text-5xl font-black text-white">{correctCount}<span className="text-2xl text-white/20">/{questions.length}</span></p>
         </div>
      </div>
      <button 
        onClick={() => window.open('https://chat.whatsapp.com/B8ySbaIg1E2H8tc3i42HYl', '_blank')}
        className="w-full max-w-lg py-6 bg-[#FACC15] text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:bg-[#EAB308] transition-all"
      >
        ACESSAR MATERIAL COMPLETO
      </button>
      <button onClick={() => window.location.reload()} className="mt-6 text-white/20 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Reiniciar Simulado</button>
    </div>
  );
};

export default App;