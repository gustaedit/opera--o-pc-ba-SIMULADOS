import React, { useState, useEffect, useRef } from 'react';
import { Question, UserAttempt, QuestionComment } from '../../types';
import { supabase } from '../../lib/supabase';
import { useStorage } from '../../store';
import { 
  ChevronRight, ChevronLeft, Check, X, Cpu, MessageSquare, Star, BookOpen, Target, 
  ArrowRight, Clock, Users, Send, User, Calendar, ShieldCheck, AlertCircle, 
  Loader2, Zap, Flame, Info, Scissors 
} from 'lucide-react';

interface QuestionViewerProps {
  questions: Question[];
  onAnswer: (attempt: UserAttempt) => void;
  title?: string;
  onRefreshAI?: () => void;
  isGenerating?: boolean;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({ questions, onAnswer, title, onRefreshAI, isGenerating }) => {
  const { fetchComments, addComment } = useStorage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  
  // Novo estado para a função de "Tesoura"
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<'official' | 'community'>('official');
  const [comments, setComments] = useState<QuestionComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  const [seconds, setSeconds] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    setSeconds(0);
    startTimeRef.current = Date.now();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentIndex]);

  useEffect(() => {
    if (hasAnswered) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      loadComments();
    }
  }, [hasAnswered, currentQuestion?.id]);

  const loadComments = async () => {
    if (currentQuestion?.id) {
      const data = await fetchComments(currentQuestion.id);
      setComments(data);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || isSendingComment) return;
    setIsSendingComment(true);
    setCommentFeedback(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setCommentFeedback({ type: 'error', msg: 'Acesso negado. Logue para enviar bizus.' });
        setIsSendingComment(false);
        return;
      }

      const comment: QuestionComment = {
        id: `c-${Date.now()}`,
        questionId: currentQuestion.id,
        userId: session.user.id,
        userEmail: session.user.email || 'Anônimo',
        text: newComment,
        createdAt: Date.now()
      };
      
      const success = await addComment(comment);
      if (success) {
        setComments([comment, ...comments]);
        setNewComment('');
        setCommentFeedback({ type: 'success', msg: 'Dica indexada!' });
        setTimeout(() => setCommentFeedback(null), 2000);
      }
    } catch (err: any) {
      setCommentFeedback({ type: 'error', msg: 'Falha na conexão SQL.' });
    } finally {
      setIsSendingComment(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Lógica para alternar a eliminação de uma opção
  const toggleEliminate = (e: React.MouseEvent, optionId: string) => {
    e.stopPropagation();
    if (hasAnswered) return;
    setEliminatedOptions(prev => 
      prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
    );
    // Se a opção eliminada estava selecionada, desmarca ela
    if (selectedOptionId === optionId) setSelectedOptionId(null);
  };

  const handleConfirm = () => {
    if (!selectedOptionId || hasAnswered) return;
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    const timeTaken = Date.now() - startTimeRef.current;
    setHasAnswered(true);
    setShowSolution(true);
    onAnswer({
      id: Math.random().toString(36).substr(2, 9),
      questionId: currentQuestion.id,
      selectedOptionId,
      isCorrect,
      timestamp: Date.now(),
      timeSpent: timeTaken,
      discipline: currentQuestion.discipline,
      topic: currentQuestion.topic,
      isAI: currentQuestion.isAI
    });
  };

  const resetStateForNavigation = () => {
    setSelectedOptionId(null);
    setHasAnswered(false);
    setShowSolution(false);
    setActiveTab('official');
    setComments([]);
    setEliminatedOptions([]); // Limpa as tesouras ao mudar de questão
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetStateForNavigation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentQuestion.isAI && onRefreshAI) {
      onRefreshAI();
      resetStateForNavigation();
    }
  };

  // Função para voltar à área de questões anteriores
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      resetStateForNavigation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
        <h3 className="text-xl font-black uppercase tracking-[0.3em] text-primary">Sintetizando Missão...</h3>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const themeColor = currentQuestion.isAI ? 'text-cyan-500' : 'text-primary';

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8 animate-in fade-in duration-700">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-8 bg-[#F1F5F9] dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-[2.5rem] shadow-xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="px-5 py-2 bg-black/5 dark:bg-white/5 border border-primary/20 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{currentQuestion.board}</span>
          </div>
          <span className="text-sm font-black text-gray-900 dark:text-white/70 uppercase tracking-tighter">
            {currentQuestion.institution} • {currentQuestion.year}
          </span>
        </div>
        
        <div className="flex items-center gap-10">
           <div className="flex items-center gap-3 px-6 py-2.5 bg-black/5 dark:bg-white/5 border border-white/5 rounded-2xl">
              <Clock className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-base font-black font-mono">{formatTime(seconds)}</span>
           </div>
           <div className="text-center">
              <span className="block text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1">Questão</span>
              <span className="text-base font-black text-gray-900 dark:text-white">{currentIndex + 1} de {questions.length}</span>
           </div>
           <div className="flex gap-4">
              <button className="p-3 text-gray-400 hover:text-primary transition-all"><Star className="w-5 h-5" /></button>
              <button className="p-3 text-gray-400 hover:text-red-500 transition-all"><AlertCircle className="w-5 h-5" /></button>
           </div>
        </div>
      </div>

      {/* Questão Principal */}
      <div className="relative group">
        <div className={`p-10 md:p-16 bg-white dark:bg-[#0D0D0D] border-t-8 ${currentQuestion.isAI ? 'border-cyan-500' : 'border-primary'} border-x border-b border-gray-300 dark:border-white/5 rounded-[3.5rem] shadow-2xl transition-all`}>
          
          <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/20 mb-10 flex items-center gap-3">
            <Target className={`w-4 h-4 ${themeColor}`} /> Comando de Operação
          </h4>

          <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white/90 leading-tight mb-16 tracking-tight">
            {currentQuestion.text}
          </p>

          <div className="grid grid-cols-1 gap-5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              const isCorrect = opt.id === currentQuestion.correctOptionId;
              const isEliminated = eliminatedOptions.includes(opt.id); //[cite: 4]
              
              let style = "bg-gray-100 dark:bg-white/[0.03] border-gray-300 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/[0.06] text-gray-900 dark:text-white/60";
              
              if (hasAnswered) {
                if (isCorrect) style = "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] scale-[1.02] z-10";
                else if (isSelected) style = "bg-red-500 text-black border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]";
                else style = "bg-transparent border-white/5 opacity-20 pointer-events-none";
              } else if (isEliminated) {
                style = "bg-transparent border-dashed border-gray-500 opacity-30 scale-95 pointer-events-none"; // Estilo da tesoura[cite: 4]
              } else if (isSelected) {
                style = "bg-primary text-black border-transparent shadow-[0_0_30px_rgba(250,204,21,0.3)] scale-[1.02] z-10";
              }

              return (
                <div key={opt.id} className="relative group/option">
                  <button 
                    disabled={hasAnswered || isEliminated}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`w-full flex items-start gap-8 p-8 border-2 rounded-[2rem] text-left transition-all duration-300 font-black text-lg ${style}`}
                  >
                    <span className={`flex-none w-10 h-10 flex items-center justify-center text-sm font-black rounded-2xl border-2 ${
                      isSelected || (hasAnswered && isCorrect) ? 'bg-black/20 border-transparent' : 'border-gray-400 dark:border-white/10'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className={`flex-1 pt-1.5 ${isEliminated ? 'line-through' : ''}`}>{opt.text}</span>
                    {hasAnswered && isCorrect && <Check className="w-6 h-6 mt-1" />}
                    {hasAnswered && isSelected && !isCorrect && <X className="w-6 h-6 mt-1" />}
                  </button>

                  {/* Botão de Tesoura[cite: 4] */}
                  {!hasAnswered && (
                    <button
                      onClick={(e) => toggleEliminate(e, opt.id)}
                      className={`absolute -right-2 -top-2 p-3 rounded-full shadow-lg transition-all z-20 ${
                        isEliminated ? 'bg-gray-600 text-white' : 'bg-red-500 text-white opacity-0 group-hover/option:opacity-100 hover:scale-110'
                      }`}
                    >
                      <Scissors className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-6">
        {!hasAnswered ? (
          <div className="w-full flex flex-col sm:flex-row gap-4">
             {/* Botão para voltar à questão anterior[cite: 4] */}
             <button 
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="flex-1 py-8 bg-white/5 border-2 border-white/10 text-white font-black uppercase tracking-widest text-[11px] rounded-[2.5rem] hover:bg-white/10 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
            >
              <ChevronLeft className="w-5 h-5" /> Anterior
            </button>
            <button 
              onClick={handleConfirm}
              disabled={!selectedOptionId}
              className={`flex-[2] py-8 ${currentQuestion.isAI ? 'bg-cyan-500' : 'bg-primary'} text-black font-black uppercase tracking-[0.4em] text-sm rounded-[2.5rem] shadow-2xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-4`}
            >
              CONFIRMAR DISPARO <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col sm:flex-row gap-5">
            <button 
              onClick={() => setShowSolution(!showSolution)}
              className="flex-1 px-10 py-6 border-2 border-gray-900 dark:border-white/10 font-black uppercase tracking-widest text-[11px] rounded-[2rem] bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-gray-900 dark:text-white"
            >
              <BookOpen className="w-5 h-5" /> {showSolution ? 'Fechar Bizus' : 'Ver Bizus e Resolução'}
            </button>
            <button 
              onClick={nextQuestion}
              className={`flex-[1.5] py-6 ${currentQuestion.isAI ? 'bg-cyan-500' : 'bg-primary'} text-black font-black uppercase tracking-[0.3em] text-[11px] rounded-[2rem] hover:brightness-110 transition-all shadow-xl flex items-center justify-center gap-3`}
            >
              {currentIndex === questions.length - 1 && currentQuestion.isAI ? 'Nova Questão IA' : 'Próxima Missão'} <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Fundamentação e Dicas (Omitido para brevidade, permanece igual ao seu código original) */}
    </div>
  );
};