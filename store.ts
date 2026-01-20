
import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { Question, QuestionPackage, Tags, UserAttempt, AppState, QuestionComment } from './types';
import { INITIAL_TAGS, INITIAL_QUESTIONS, INITIAL_PACKAGES } from './constants';

export function useStorage() {
  const [db, setDb] = useState<AppState>({
    questions: [],
    packages: [],
    tags: INITIAL_TAGS,
    attempts: []
  });
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'error'>('offline');

  const syncWithBackend = useCallback(async () => {
    setLoading(true);
    try {
      const { data: tData } = await supabase
        .from('tags')
        .select('*')
        .eq('id', 'global_config')
        .maybeSingle();

      const [qRes, pRes, aRes] = await Promise.all([
        supabase.from('lead_questions').select('*').order('createdAt', { ascending: false }),
        supabase.from('packages').select('*'),
        supabase.from('attempts').select('*').order('timestamp', { ascending: false })
      ]);

      setConnectionStatus('online');

      setDb({
        questions: (qRes.data && qRes.data.length > 0) ? qRes.data : INITIAL_QUESTIONS,
        packages: (pRes.data && pRes.data.length > 0) ? pRes.data : INITIAL_PACKAGES,
        attempts: aRes.data || [],
        tags: tData || INITIAL_TAGS
      });

    } catch (error) {
      console.error("Falha na sincronização:", error);
      setConnectionStatus('error');
      setDb(prev => ({
        ...prev,
        questions: INITIAL_QUESTIONS,
        packages: INITIAL_PACKAGES,
        tags: INITIAL_TAGS
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  const addQuestion = async (q: Question) => {
    const { error } = await supabase.from('lead_questions').insert([q]);
    if (error) return false;
    setDb(prev => ({ ...prev, questions: [q, ...prev.questions] }));
    return true;
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from('lead_questions').delete().eq('id', id);
    if (!error) {
      setDb(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
      return true;
    }
    return false;
  };

  const addAttempt = async (a: UserAttempt) => {
    const { id, ...attemptData } = a;
    await supabase.from('attempts').insert([attemptData]);
    setDb(prev => ({ ...prev, attempts: [...prev.attempts, a] }));
  };

  // Fix: Added fetchComments to retrieve question-specific community feedback from the 'comments' table
  const fetchComments = async (questionId: string) => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('questionId', questionId)
      .order('createdAt', { ascending: false });
    return (data as QuestionComment[]) || [];
  };

  // Fix: Added addComment to persist community "Bizus" into the 'comments' table
  const addComment = async (comment: QuestionComment) => {
    const { error } = await supabase.from('comments').insert([comment]);
    return !error;
  };

  return { 
    db, 
    loading, 
    connectionStatus,
    addQuestion, 
    deleteQuestion, 
    addAttempt,
    // Fix: Exposed fetchComments and addComment to satisfy the contract expected by QuestionViewer
    fetchComments,
    addComment,
    refresh: syncWithBackend 
  };
}
