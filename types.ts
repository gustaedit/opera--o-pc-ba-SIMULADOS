
// Fix: Added Difficulty type to be used in Question and components
export type Difficulty = 'Fácil' | 'Médio' | 'Difícil';

// Fix: Added 'label' property to Option as it's required for UI rendering (e.g., A, B, C...)
export interface Option {
  id: string;
  label: string;
  text: string;
}

// Fix: Expanded Question interface to include all metadata properties used in the application
export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  discipline: string;
  createdAt: number;
  comment: string;
  topic: string;
  difficulty: Difficulty;
  institution: string;
  position: string;
  board: string;
  year: string;
  contestClass: string;
  isAI?: boolean;
}

// Fix: Added Tags interface to support global filtering configuration
export interface Tags {
  boards: string[];
  institutions: string[];
  contestClasses: string[];
  positions: string[];
  disciplines: string[];
  years: string[];
  topics: Record<string, string[]>;
}

// Fix: Added QuestionPackage interface for simulation bundles
export interface QuestionPackage {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
  createdAt: number;
}

// Fix: Added UserAttempt interface to track student performance data
export interface UserAttempt {
  id: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timestamp: number;
  timeSpent?: number;
  discipline: string;
  topic: string;
  isAI?: boolean;
}

// Fix: Added QuestionComment interface for the community "Bizu" feature
export interface QuestionComment {
  id: string;
  questionId: string;
  userId: string;
  userEmail: string;
  text: string;
  createdAt: number;
}

// Fix: Added AppState interface to define the global store structure
export interface AppState {
  questions: Question[];
  packages: QuestionPackage[];
  tags: Tags;
  attempts: UserAttempt[];
}

export interface LeadAnswer {
  lead_email: string;
  question_id: string;
  is_correct: boolean;
  time_spent: number;
}
