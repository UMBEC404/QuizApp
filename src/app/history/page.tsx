"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { getUserQuizzes, SavedQuiz } from "@/lib/firestore";
import { Clock, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      getUserQuizzes(user.uid).then((data) => {
        setQuizzes(data);
        setFetching(false);
      });
    }
  }, [user, loading, router]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Your Quiz History</h1>

        {quizzes.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No quizzes yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first quiz to see it here!
            </p>
            <Link
              href="/"
              className="bg-gradient text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all"
            >
              Create Quiz
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/quiz/${quiz.id}`}
                className="bg-card border border-border p-6 rounded-lg flex items-center justify-between hover:border-primary/50 transition-colors group"
              >
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-gradient transition-colors font-fira">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {quiz.questions.length} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {quiz.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-gradient transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
