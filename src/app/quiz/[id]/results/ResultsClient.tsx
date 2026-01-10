"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Quiz, Question } from "@/lib/types";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Sparkles,
  Share2,
} from "lucide-react";

interface ResultData {
  quizId: string;
  score: number;
  total: number;
  answers: { [key: number]: string };
}

interface ResultsClientProps {
  id: string;
}

export function ResultsClient({ id }: ResultsClientProps) {
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState<{ [key: number]: string }>(
    {}
  );
  const [loadingExplanation, setLoadingExplanation] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    if (!id) return;

    // Load quiz
    const savedQuiz = localStorage.getItem(id);
    if (savedQuiz) {
      setQuiz(JSON.parse(savedQuiz));
    }

    // Load result
    const savedResult = localStorage.getItem(`${id}-result`);
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    }

    setLoading(false);
  }, [id]);

  const handleGetExplanation = async (question: Question) => {
    setLoadingExplanation((prev) => ({ ...prev, [question.id]: true }));

    try {
      const response = await fetch("/api/generate-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          userAnswer: result?.answers[question.id] || "",
          correctAnswer: question.answer,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setExplanations((prev) => ({
          ...prev,
          [question.id]: data.explanation,
        }));
      }
    } catch (error) {
      console.error("Failed to get explanation:", error);
    } finally {
      setLoadingExplanation((prev) => ({ ...prev, [question.id]: false }));
    }
  };

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

  if (!quiz || !result) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Results Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The results you are looking for do not exist or have expired.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const percentage = (result.score / result.total) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
        {/* Score Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg mb-8">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-6">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="351.86"
                  strokeDashoffset={351.86 - (351.86 * percentage) / 100}
                  className="text-gradient transition-all duration-1000 ease-out"
                  style={{
                    strokeLinecap: "round",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{result.score}</div>
                  <div className="text-sm text-muted-foreground">
                    / {result.total}
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">
              {percentage >= 80
                ? "Excellent!"
                : percentage >= 60
                ? "Good Job!"
                : percentage >= 40
                ? "Keep Practicing!"
                : "Don't Give Up!"}
            </h1>
            <p className="text-muted-foreground mb-6">
              You answered {result.score} out of {result.total} questions
              correctly.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push(`/quiz/${id}`)}
                className="bg-gradient text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
              <button
                onClick={() => router.push("/")}
                className="bg-gradient text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Question Review</h2>

          {quiz.questions.map((question, index) => {
            const userAnswer = result.answers[question.id];
            const isCorrect = userAnswer === question.answer;

            return (
              <div
                key={question.id}
                className={`p-4 rounded-lg border ${
                  isCorrect
                    ? "bg-primary/10 border-primary text-primary-foreground"
                    : "bg-red-500/10 border-red-500/50 text-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-gradient flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <p className="font-medium mb-2">
                      {index + 1}. {question.question}
                    </p>

                    {!isCorrect && (
                      <div className="mb-3">
                        <p className="text-sm opacity-80">
                          Your answer:{" "}
                          <span className="font-medium">
                            {userAnswer || "No answer"}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="p-3 rounded-lg border border-primary/50 bg-primary/5">
                      <p className="text-sm font-semibold mb-1 text-gradient">
                        Correct Answer:
                      </p>
                      <p>{question.answer}</p>
                    </div>

                    {/* AI Explanation */}
                    {explanations[question.id] ? (
                      <div className="mt-3 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-gradient">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            AI Explanation
                          </span>
                        </div>
                        <p className="text-sm">{explanations[question.id]}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGetExplanation(question)}
                        disabled={loadingExplanation[question.id]}
                        className="mt-3 text-xs flex items-center gap-1 text-gradient hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        {loadingExplanation[question.id]
                          ? "Generating..."
                          : "Get AI Explanation"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push(`/quiz/${id}`)}
            className="bg-gradient text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Create New Quiz
          </button>
        </div>
      </main>
    </div>
  );
}
