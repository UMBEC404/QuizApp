'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Quiz, QuizResult } from '@/lib/types';
import { CheckCircle2, XCircle, RefreshCw, Home, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { generateExplanationAction } from '@/app/actions';

interface ResultsClientProps {
  id: string;
}

export function ResultsClient({ id }: ResultsClientProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [aiExplanations, setAiExplanations] = useState<{ [key: number]: string }>({});
  const [loadingExplanation, setLoadingExplanation] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const savedQuiz = localStorage.getItem(id);
    const savedResult = localStorage.getItem(`${id}-result`);

    if (savedQuiz && savedResult) {
      setQuiz(JSON.parse(savedQuiz));
      setResult(JSON.parse(savedResult));
    }
  }, [id]);

  const handleAskAI = async (questionId: number, question: string, userAnswer: string, correctAnswer: string) => {
    setLoadingExplanation(prev => ({ ...prev, [questionId]: true }));
    try {
      const response = await generateExplanationAction(question, userAnswer, correctAnswer);
      if (response.success && response.explanation) {
        setAiExplanations(prev => ({ ...prev, [questionId]: response.explanation! }));
      }
    } catch (error) {
      console.error("Failed to get AI explanation", error);
    } finally {
      setLoadingExplanation(prev => ({ ...prev, [questionId]: false }));
    }
  };

  if (!quiz || !result) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.total) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
          <p className="text-muted-foreground">{quiz.title}</p>
          
          <div className="mt-8 flex justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-4 border-muted">
              {/* Better Circle Implementation using SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * percentage) / 100}
                  className="text-primary transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold">{percentage}%</span>
                <span className="text-sm text-muted-foreground">{result.score}/{result.total} Correct</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Review</h2>
          
          {quiz.questions.map((question, idx) => {
            const userAnswer = result.answers[question.id];
            const isCorrect = userAnswer === question.answer;

            return (
              <div key={question.id} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-lg mb-4">
                      <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                      {question.question}
                    </p>

                    <div className="space-y-2">
                      <div className={clsx(
                        "p-3 rounded-lg border",
                        isCorrect ? "bg-primary/10 border-primary text-primary-foreground" : "bg-red-500/10 border-red-500/50 text-red-200"
                      )}>
                        <p className="text-sm font-semibold mb-1">Your Answer:</p>
                        <p>{userAnswer || 'No answer'}</p>
                      </div>

                      {!isCorrect && (
                        <div className="p-3 rounded-lg border border-primary/50 bg-primary/5">
                          <p className="text-sm font-semibold mb-1 text-primary">Correct Answer:</p>
                          <p>{question.answer}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Basic Explanation */}
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                      <p className="font-semibold mb-1">Explanation:</p>
                      <p>{question.explanation || "No standard explanation provided."}</p>
                    </div>

                    {/* Ask AI Section */}
                    <div className="mt-4">
                      {aiExplanations[question.id] ? (
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2 text-primary">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-semibold text-sm">AI Explanation</span>
                          </div>
                          <p className="text-sm text-foreground">{aiExplanations[question.id]}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAskAI(question.id, question.question, userAnswer, question.answer)}
                          disabled={loadingExplanation[question.id]}
                          className="text-xs flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          {loadingExplanation[question.id] ? "Generating..." : "Ask AI for detailed explanation"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
          <button
            onClick={() => router.push(`/quiz/${id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-colors font-bold"
          >
            <RefreshCw className="w-5 h-5" />
            Retake Quiz
          </button>
        </div>
      </main>
    </div>
  );
}
