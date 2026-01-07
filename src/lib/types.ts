export type QuestionType = 'multiple-choice' | 'short-answer';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[]; // Only for multiple-choice
  answer: string; // Correct answer
  explanation?: string;
}

export interface Quiz {
  id?: string;
  title: string;
  questions: Question[];
}

export interface QuizResult {
  quizId: string;
  score: number;
  total: number;
  answers: { [questionId: number]: string };
}
