'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { UploadSection } from '@/components/UploadSection';
import { useRouter } from 'next/navigation';
import { generateQuizAction } from './actions';
import { Quiz } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { saveQuizToHistory } from '@/lib/firestore';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleGenerate = async (type: 'text' | 'file', content: string | File) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      let contentString = '';
      if (typeof content === 'string') {
        contentString = content;
      } else if (content instanceof File) {
        // Try to read text content if it's a text file
        if (content.type.startsWith('text/') || content.name.endsWith('.txt') || content.name.endsWith('.md')) {
          contentString = await content.text();
        } else {
          // Fallback for other files (PDFs, etc. - requires more complex parsing)
          contentString = `File Name: ${content.name} (Content extraction not supported for this file type yet)`;
        }
      }

      const result = await generateQuizAction(type, contentString);

      if (result.success && result.quiz) {
        let quizId = 'quiz-' + Date.now();
        
        // Save to Firestore if logged in
        if (user) {
          const firestoreId = await saveQuizToHistory(user.uid, result.quiz);
          if (firestoreId) {
            quizId = firestoreId;
          }
        }
        
        // Also save to localStorage for immediate access/fallback
        localStorage.setItem(quizId, JSON.stringify(result.quiz));
        router.push(`/quiz/${quizId}`);
      } else {
        console.error("Quiz generation failed:", result.error);
        setError(result.error || "Failed to generate quiz");
        setIsGenerating(false);
        // Do not fallback to mock data on error to let user know something is wrong
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      setError(error.message || "An unexpected error occurred");
      setIsGenerating(false);
    }
  };

  const fallbackMockGenerate = async (type: 'text' | 'file', content: string | File) => {
    setTimeout(async () => {
      setIsGenerating(false);
      let quizId = 'quiz-' + Date.now();
      
      const mockQuiz: Quiz = {
        title: type === 'file' && content instanceof File ? content.name : 'Generated Quiz (Mock)',
        questions: [
          {
            id: 1,
            type: 'multiple-choice',
            question: 'What is the primary goal of this uploaded content?',
            options: ['To inform', 'To entertain', 'To persuade', 'To confuse'],
            answer: 'To inform',
            explanation: 'Most educational content aims to inform the reader.'
          },
          {
            id: 2,
            type: 'short-answer',
            question: 'Summarize the main point in one sentence.',
            answer: 'The content discusses...',
            explanation: 'A summary should capture the core message concisely.'
          }
        ]
      };

      if (user) {
        const firestoreId = await saveQuizToHistory(user.uid, mockQuiz);
        if (firestoreId) quizId = firestoreId;
      }

      localStorage.setItem(quizId, JSON.stringify(mockQuiz));
      router.push(`/quiz/${quizId}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center p-8 sm:p-20 font-sans">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Turn anything into a <span className="text-primary">Quiz</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your study notes, documents, or paste a link. 
            Quizrr uses AI to generate personalized quizzes instantly.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-8 max-w-2xl w-full text-center">
            {error}
          </div>
        )}

        <UploadSection onGenerate={handleGenerate} isGenerating={isGenerating} />
      </main>
    </div>
  );
}
