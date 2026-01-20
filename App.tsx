import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
// import { FREE_SIMULATOR_QUESTIONS } from './constants'; // <-- Remova se não for usar mais
import { Question } from './types';
import { 
  Shield, 
  ArrowRight, 
  Loader2, 
  Clock, 
  Award, 
  History,
  CheckCircle2,
  MousePointer2
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
  
  // Inicia vazio, pois vai carregar do banco
  const [questions, setQuestions] = useState<Question[]>([]); 
  const [isFetching, setIsFetching] = useState(true);

  // --- CARREGAMENTO DAS QUESTÕES ---
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('lead_questions')
          .select('*')
          // Ordena aleatoriamente para cada usuário (opcional) ou por criação
          .order('createdAt', { ascending: false }); 

        if (!error && data && data.length > 0) {
          const mapped = data.map(q => {
            let parsedOptions = q.options;
            
            // Se vier como string (JSON stringificado), faz o parse
            if (typeof q.options === 'string') {
              try { 
                parsedOptions = JSON.parse(q.options); 
              } catch (e) { 
                parsedOptions = {}; 
              }
            }

            // --- AJUSTE CRÍTICO AQUI ---
            // O banco retorna objeto {"A": "Texto"}, mas o app precisa de Array
            // Se já for array, mantém. Se for objeto, converte.
            let optionsArray = [];
            if (Array.isArray(parsedOptions)) {
                optionsArray = parsedOptions;
            } else if (typeof parsedOptions === 'object') {
                optionsArray = Object.entries(parsedOptions).map(([key, value]) => ({
                    id: key.toLowerCase(), 
                    text: value as string,
                    label: key.toUpperCase() // Garante que a label seja A, B, C
                }));
            }

            return {
              ...q,
              options: optionsArray,
              // Garante que o ID da resposta correta esteja normalizado (minúsculo)
              correctOptionId: q.correctOptionId?.toLowerCase()
            };
          });

          const validQuestions = mapped.filter(q => q.options.length > 0);
          
          if (validQuestions.length > 0) {
            setQuestions(validQuestions);
          }
        }
      } catch (err) {
        console.warn("Erro ao acessar lead_questions:", err);
      } finally {
        setIsFetching(false);
      }
    };
    loadQuestions();
  }, []);

  // --- INÍCIO DO SIMULADO ---
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
      // 1. Verifica se usuário já fez o simulado antes
      const { data: prev } = await supabase
        .from('lead_answers')
        .select('is_correct, time_spent')
        .eq('lead_email', cleanEmail);

      // Se já fez e tem respostas salvas, mostra o resultado direto
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

      // 2. Se é novo, salva o Lead
      await supabase.from('leads').upsert([{ email: cleanEmail }], { onConflict: 'email' });
      
      setStep('simulation');
      setStartTime(Date.now());
      setCurrentIdx(0); // Garante que comece do zero
      setAnswers([]);   // Reseta respostas anteriores da sessão local

    } catch (err) {
      console.error("Erro no start:", err);
      // Fallback: deixa o usuário fazer mesmo sem salvar no banco
      setStep('simulation');
      setStartTime(Date.now());
    } finally {
      setLoading(false);
    }
  };

  // --- SELEÇÃO DE RESPOSTA ---
  const handleSelectOption = async (optionId: string) => {
    const q = questions[currentIdx];
    if (!q) return;

    // Normaliza para comparar (banco pode ter 'B' e clique ser 'b')
    const isCorrect = optionId.toLowerCase() === q.correctOptionId?.toLowerCase();
    
    const now = Date.now();
    const timeSpent = now - startTime;
    
    const newAnswers = [...answers, { isCorrect, timeSpent }];
    setAnswers(newAnswers);

    // Salva resposta no banco em background (Fire & Forget)
    supabase.from('lead_answers').insert([{
        lead_email: email.toLowerCase().trim(),
        question_id: q.id,
        is_correct: isCorrect,
        time_spent: timeSpent
    }]).then(({ error }) => {
        if (error) console.warn("Erro ao salvar resposta:", error);
    });

    // Avança ou Finaliza
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setStartTime(now);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStep('result');
    }
  };

  // --- TELA 1: LANDING ---
  if (step === 'landing') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700 relative overflow-hidden bg-black">
      {/* Fundo com gradiente sutil */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-black to-black -z-10" />
      
      <div className="w-24 h-24 bg-[#FACC15] flex items-center justify-center rounded-[2.5rem] shadow-2xl mb-10 border-4 border-black ring-4 ring-[#FACC15]/20">
        <Shield className="w-12 h-12 text-black stroke-[2.5px]" />
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-4 leading-none">
        OPERACIONAL <span className="text-[#FACC15]">PC-BA</span>
      </h1>
      
      {/* Badge de status */}
      <div className="flex items-center gap-3 mb-12 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
        <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
          {isFetching ? 'BUSCANDO DADOS...' : `BASE: ${questions.length} ALVOS PRONTOS`}
        </p>
      </div>

      <form onSubmit={handleStart} className="w-full max-w-sm space-y-4">
        <input 
          type="email" 
          placeholder="SEU MELHOR E-MAIL" 
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl outline-none focus:border-[#FACC15] focus:bg-white/10 transition-all font-bold text-white shadow-xl placeholder:text-white/20"
        />
        {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">{error}</p>}
        
        <button 
          disabled={loading || isFetching || questions.length === 0}
          className="w-full py-6 bg-[#FACC15] text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:bg-[#EAB308] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>INICIAR SIMULADO <ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>
    </div>
  );

  // --- TELA 2: SIMULAÇÃO ---
  if (step === 'simulation') {
    const q = questions[currentIdx];
    
    // Proteção contra estado inválido
    if (!q || !q.options || q.options.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin text-[#FACC15] mb-4" />
                <p className="text-xs uppercase tracking-widest text-white/50">Carregando Questão...</p>
            </div>
        );
    }
    
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-black p-4 md:p-10 flex flex-col animate-in slide-in-from-bottom-4 duration-500">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between mb-8">
           <div className="space-y-1">
             <span className="text-[#FACC15] text-[10px] font-black uppercase tracking-[0.3em]">PC-BA | Operação Investigador</span>
             <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Questão {currentIdx + 1} de {questions.length}</p>
           </div>
           <div className="flex items-center gap-4 px-6 py-2 bg-white/5 rounded-2xl border border-white/5">
             <Clock className="w-4 h-4 text-[#FACC15] animate-pulse" />
             {/* Timer visual simples apenas para feedback */}
             <span className="text-white font-mono font-bold text-xs">EM PROGRESSO</span>
           </div>
        </header>

        {/* Barra de Progresso */}
        <div className="max-w-4xl mx-auto w-full h-1.5 bg-white/5 rounded-full mb-12 overflow-hidden">
          <div className="h-full bg-[#FACC15] transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div className="bg-[#0D0D0D] border-t-4 border-[#FACC15] rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-8 relative flex-1">
            
            {/* Tag da Disciplina */}
            <div className="px-3 py-1 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-lg w-fit mb-8">
              <span className="text-[10px] font-black uppercase text-[#FACC15] tracking-widest">
                {q.discipline || 'CONHECIMENTOS GERAIS'}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-12 tracking-tight">
                {q.text}
            </h2>
            
            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt, i) => (
                <button 
                  key={opt.id || i}
                  onClick={() => handleSelectOption(opt.id)}
                  className="p-5 rounded-2xl text-left border border-white/5 bg-white/[0.02] text-white/70 hover:border-[#FACC15]/50 hover:bg-[#FACC15]/5 hover:text-white transition-all font-medium flex items-start gap-5 group"
                >
                  <span className="w-8 h-8 shrink-0 rounded-lg border border-white/10 flex items-center justify-center text-xs font-black group-hover:bg-[#FACC15] group-hover:text-black group-hover:border-[#FACC15] transition-all bg-black/40">
                    {opt.label || String.fromCharCode(65 + i)}
                  </span>
                  <span className="pt-1 text-sm md:text-base leading-snug">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-center py-4 opacity-30 flex items-center justify-center gap-3">
             <MousePointer2 className="w-3 h-3 text-[#FACC15]" />
             <p className="text-white text-[9px] font-black uppercase tracking-[0.3em]">Selecione uma alternativa</p>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA 3: RESULTADO ---
  const correctCount = answers.filter(a => a.isCorrect).length;
  const scoreRate = Math.round((correctCount / (answers.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500">
      
      <div className="inline-flex p-8 bg-[#FACC15]/10 rounded-[3rem] border border-[#FACC15]/20 text-[#FACC15] mb-10 shadow-[0_0_40px_-10px_rgba(250,204,21,0.3)]">
        <Award className="w-16 h-16 stroke-[1.5px]" />
      </div>
      
      <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-2 leading-none">
        RESULTADO <span className="text-[#FACC15]">FINAL</span>
      </h2>
      
      <div className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-white/40 text-[10px] font-black uppercase tracking-widest mb-12">
        {isReturningUser ? 
            <><History className="w-3 h-3" /> Histórico Recuperado</> : 
            <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Respostas Enviadas</>
        }
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-lg mb-12">
         <div className="p-8 bg-[#0A0A0A] border border-white/10 rounded-[2.5rem]">
            <span className="block text-[9px] font-black uppercase text-white/30 tracking-[0.3em] mb-4">Aproveitamento</span>
            <p className={`text-5xl font-black ${scoreRate >= 70 ? 'text-emerald-400' : 'text-white'}`}>{scoreRate}%</p>
         </div>
         <div className="p-8 bg-[#0A0A0A] border border-white/10 rounded-[2.5rem]">
            <span className="block text-[9px] font-black uppercase text-white/30 tracking-[0.3em] mb-4">Acertos</span>
            <p className="text-5xl font-black text-white">{correctCount}<span className="text-2xl text-white/20">/{answers.length}</span></p>
         </div>
      </div>
      
      <button 
        onClick={() => window.open('https://chat.whatsapp.com/B8ySbaIg1E2H8tc3i42HYl', '_blank')}
        className="w-full max-w-lg py-6 bg-[#FACC15] text-black font-black uppercase tracking-[0.3em] text-xs md:text-sm rounded-2xl shadow-xl shadow-[#FACC15]/20 hover:scale-[1.02] hover:bg-[#EAB308] transition-all"
      >
        ACESSAR MATERIAL COMPLETO
      </button>

      <button 
        onClick={() => window.location.reload()}
        className="mt-6 text-white/20 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
      >
        Reiniciar Simulado
      </button>
    </div>
  );
};

export default App;