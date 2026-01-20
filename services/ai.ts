
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty } from "../types";

/**
 * SERVIÇO DE INTELIGÊNCIA FORENSE
 * Gera questões e processa documentos usando Gemini 3.
 */
export const aiService = {
  // Gera uma questão isolada por IA
  generateQuestion: async (board: string, discipline: string, difficulty: Difficulty, institution: string): Promise<Question> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Gere uma questão INÉDITA e técnica de concurso de POLÍCIA CIVIL.
    Banca: ${board} | Disciplina: ${discipline} | Nível: ${difficulty} | Órgão: ${institution}.
    Use terminologia jurídica e policial técnica. Responda APENAS em JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING }
                }
              }
            },
            correctOptionId: { type: Type.STRING },
            comment: { type: Type.STRING }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      id: `ai-${Date.now()}`,
      isAI: true,
      board, discipline, difficulty, institution,
      year: new Date().getFullYear().toString(),
      position: 'Operador de Inteligência',
      topic: 'Tópico Geral',
      contestClass: 'Especializada',
      createdAt: Date.now()
    };
  },

  // Processa PDFs de provas reais e extrai todas as questões
  processPDF: async (base64: string, board: string, institution: string, year: string): Promise<Question[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Você é um perito em extração de dados de concursos da área policial. 
    Analise este PDF da prova da ${institution} (${year}) realizada pela banca ${board}.
    
    INSTRUÇÕES TÁTICAS:
    1. Varra o documento e localize todas as questões numeradas.
    2. Extraia: Enunciado (text), 5 Alternativas (options: A a E), Gabarito Correto (correctOptionId).
    3. Identifique a Disciplina (Direito Penal, Informática, etc) e o Assunto específico.
    4. Categorize a Carreira (contestClass) entre: 'Operacional', 'Delta' (Delegado), 'Perícia' ou 'Administrativo' com base no cargo da prova.
    5. Defina a Dificuldade (difficulty) entre 'Fácil', 'Médio' ou 'Difícil'.
    
    IMPORTANTE: Ignore cabeçalhos, rodapés e textos motivadores longos que não fazem parte do enunciado direto.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "application/pdf", data: base64 } },
          { text: prompt }
        ]
      },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "a, b, c, d ou e" },
                    label: { type: Type.STRING, description: "A, B, C, D ou E" },
                    text: { type: Type.STRING }
                  }
                }
              },
              correctOptionId: { type: Type.STRING, description: "ID da correta: a, b, c, d ou e" },
              comment: { type: Type.STRING, description: "Breve comentário técnico sobre o gabarito" },
              discipline: { type: Type.STRING, description: "Matéria da questão" },
              topic: { type: Type.STRING, description: "Assunto específico" },
              difficulty: { type: Type.STRING, description: "Fácil, Médio ou Difícil" },
              position: { type: Type.STRING, description: "Cargo alvo (ex: Investigador)" },
              contestClass: { type: Type.STRING, description: "Operacional, Delta, Perícia ou Administrativo" }
            },
            required: ["text", "options", "correctOptionId", "discipline", "topic", "contestClass", "difficulty"]
          }
        }
      }
    });

    const raw = JSON.parse(response.text || "[]");
    return raw.map((q: any) => ({
      ...q,
      id: `pdf-${Math.random().toString(36).substr(2, 9)}`,
      board, 
      institution, 
      year,
      options: q.options.map((opt: any) => ({
        ...opt,
        label: opt.label || opt.id.toUpperCase()
      })),
      createdAt: Date.now()
    }));
  }
};
