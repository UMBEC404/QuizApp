"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { UploadSection } from "@/components/UploadSection";
import { useRouter } from "next/navigation";
import { generateQuizAction } from "../actions";
import { Quiz } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { saveQuizToHistory } from "@/lib/firestore";
import mammoth from "mammoth";

let pdfjsLib: any;
const errmsg = "An Error Occurred. Please try again later";

// Set PDF.js worker source (required for pdfjs-dist v5+)
if (typeof window !== "undefined") {
  import("pdfjs-dist").then((pdfjs) => {
    pdfjsLib = pdfjs;
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs`;
  });
}

export default function AppHome() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"general" | "deep">("general"); // <-- new state
  const router = useRouter();
  const { user } = useAuth();

  // Helper to extract text from uploaded files
  const readFileContent = async (file: File): Promise<string> => {
    if (
      file.type.startsWith("text/") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".md")
    ) {
      return await file.text();
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      if (!pdfjsLib) {
        const pdfjs = await import("pdfjs-dist");
        pdfjsLib = pdfjs;
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      return text;
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      return `File Name: ${file.name} (Content extraction not supported for this file type yet)`;
    }
  };

  const handleGenerate = async (
    type: "text" | "file",
    content: string | File
  ) => {
    setIsGenerating(true);
    setError(null);

    try {
      let contentString = "";
      if (typeof content === "string") {
        contentString = content;
      } else if (content instanceof File) {
        contentString = await readFileContent(content);
      }

      const result = await generateQuizAction(type, mode, contentString); // <-- pass mode

      if (result.success && result.quiz) {
        let quizId = "quiz-" + Date.now();

        if (user) {
          const firestoreId = await saveQuizToHistory(user.uid, result.quiz);
          if (firestoreId) quizId = firestoreId;
        }

        localStorage.setItem(quizId, JSON.stringify(result.quiz));
        router.push(`/app/quiz/${quizId}`);
      } else {
        console.error(errmsg);
        setError(result.error || "Failed to generate quiz");
        setIsGenerating(false);
      }
    } catch (error: any) {
      console.error(errmsg);
      setError(error.message || "An unexpected error occurred");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center p-8 sm:p-20 font-sans">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Turn anything into a <span className="text-gradient">Quiz</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your study notes, documents, or paste a link. Quizrr uses AI
            to generate personalized quizzes instantly.
          </p>
        </div>

        {/* Mode Slider */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <span className="font-medium">General</span>
          <label className="relative inline-block w-14 h-8">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={mode === "deep"}
              onChange={() =>
                setMode((prev) => (prev === "general" ? "deep" : "general"))
              }
            />
            <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-colors before:absolute before:content-[''] before:left-1 before:top-1 before:w-6 before:h-6 before:bg-white before:rounded-full before:transition-transform checked:bg-gradient-to-r checked:from-purple-500 checked:to-pink-500 before:checked:translate-x-6"></span>
          </label>
          <span className="font-medium">Deep Understanding</span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-8 max-w-2xl w-full text-center">
            {error}
          </div>
        )}

        {!user && (
          <div className="mb-6 max-w-2xl w-full px-4">
            <div className="bg-yellow-500/10 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-md text-sm text-center">
              You must{" "}
              <button
                onClick={() => router.push("/app/login")}
                className="underline font-medium"
              >
                sign in
              </button>{" "}
              to generate quizzes.
            </div>
          </div>
        )}

        <UploadSection
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          isAuthenticated={!!user}
        />

        {user && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push("/app/history")}
              className="flex items-center gap-2 text-muted-foreground hover:text-gradient transition-colors text-sm"
            >
              <span>View Quiz History</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
