"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Quiz, Question } from "@/lib/types";
import { clsx } from "clsx";
import { CheckCircle2, Circle, ArrowRight, Check } from "lucide-react";

interface QuizClientProps {
  id: string;
}

export function QuizClient({ id }: QuizClientProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load quiz from localStorage
    const savedQuiz = localStorage.getItem(id);
    if (savedQuiz) {
      setQuiz(JSON.parse(savedQuiz));
    } else {
      // Handle not found
      console.error("Quiz not found");
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The quiz you are looking for does not exist or has expired.
          </p>
          <button
            onClick={() => router.push("/app")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score (simple exact match for now)
    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        score++;
      }
    });

    // Save results
    const result = {
      quizId: id,
      score,
      total: quiz.questions.length,
      answers,
    };
    localStorage.setItem(`${id}-result`, JSON.stringify(result));

    router.push(`/app/quiz/${id}/results`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}% completed</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg flex-1 flex flex-col">
          <h2 className="text-2xl font-bold mb-8">
            {currentQuestion.question}
          </h2>

          <div className="flex-1 space-y-4">
            {currentQuestion.type === "multiple-choice" &&
              currentQuestion.options?.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className={clsx(
                      "w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between group",
                      isSelected
                        ? "border-gradient bg-primary/10 text-primary-foreground"
                        : "border-border hover:border-gradient hover:bg-muted/50"
                    )}
                  >
                    <span
                      className={clsx(
                        "font-medium",
                        isSelected ? "text-gradient" : "text-foreground"
                      )}
                    >
                      {option}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-gradient" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground group-hover:text-gradient" />
                    )}
                  </button>
                );
              })}

            {currentQuestion.type === "short-answer" && (
              <textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-32 bg-background border border-border rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="bg-gradient text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLastQuestion ? "Submit Quiz" : "Next Question"}
              {!isLastQuestion && <ArrowRight className="w-4 h-4" />}
              {isLastQuestion && <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
