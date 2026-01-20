import { supabase } from '../lib/supabase'; // Ajuste o caminho se necessário
import { Question, Tags, Difficulty } from '../types';

// Essa função traduz o formato do Banco para o formato do seu Componente
function mapDatabaseToAppQuestion(dbQuestion: any): Question {
  // Converte o JSONB do banco em Array para o front
  const optionsArray = Object.entries(dbQuestion.options || {}).map(([key, value]) => ({
    id: key.toLowerCase(),   // 'A' vira 'a'
    label: key.toUpperCase(), // 'a' vira 'A'
    text: value as string
  }));

  return {
    id: dbQuestion.id,
    text: dbQuestion.text,
    options: optionsArray,
    correctOptionId: dbQuestion.correctOptionId?.toLowerCase(), // Garante 'b' minúsculo
    comment: dbQuestion.comment,
    discipline: dbQuestion.discipline,
    topic: dbQuestion.topic,
    difficulty: dbQuestion.difficulty as Difficulty,
    createdAt: Number(dbQuestion.createdAt),
    institution: dbQuestion.institution,
    position: dbQuestion.position,
    board: dbQuestion.board,
    year: dbQuestion.year?.toString(),
    contestClass: dbQuestion.contestClass
  };
}

// Busca as questões direto da tabela lead_questions
export async function getQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('lead_questions') // <--- Sua tabela
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Erro ao buscar questões:', error);
    return [];
  }

  return (data || []).map(mapDatabaseToAppQuestion);
}

// Gera os filtros (Tags) automaticamente lendo o que tem no banco
export async function getDynamicTags(): Promise<Tags> {
  const questions = await getQuestions();

  const extractUnique = (field: keyof Question) => 
    Array.from(new Set(questions.map(q => String(q[field] || '')))).filter(Boolean).sort();

  const topicsMap: Record<string, string[]> = {};
  questions.forEach(q => {
    if (q.discipline && q.topic) {
      if (!topicsMap[q.discipline]) topicsMap[q.discipline] = [];
      if (!topicsMap[q.discipline].includes(q.topic)) topicsMap[q.discipline].push(q.topic);
    }
  });

  return {
    boards: extractUnique('board'),
    institutions: extractUnique('institution'),
    contestClasses: extractUnique('contestClass'),
    positions: extractUnique('position'),
    disciplines: extractUnique('discipline'),
    years: extractUnique('year').reverse(),
    topics: topicsMap
  };
}