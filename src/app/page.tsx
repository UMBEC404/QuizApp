"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { UploadSection } from "@/components/UploadSection";
import { useRouter } from "next/navigation";
import { generateQuizAction } from "./actions";
import { Quiz } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { saveQuizToHistory } from "@/lib/firestore";
import mammoth from "mammoth";

let pdfjsLib: any;
const errmsg = "An Error Occured. Please try again later";

// Set PDF.js worker source (required for pdfjs-dist v5+)
if (typeof window !== "undefined") {
  // Dynamically load pdfjs-dist and set worker
  import("pdfjs-dist").then((pdfjs) => {
    pdfjsLib = pdfjs;
    // Use jsdelivr for worker matching the installed version
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs`;
  });
}

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // PDF parsing - dynamically load pdfjs only on client
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
      // DOCX parsing
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      // Fallback for unsupported files
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

      const result = await generateQuizAction(type, contentString);

      if (result.success && result.quiz) {
        let quizId = "quiz-" + Date.now();

        // Save to Firestore if logged in
        if (user) {
          const firestoreId = await saveQuizToHistory(user.uid, result.quiz);
          if (firestoreId) quizId = firestoreId;
        }

        // Save to localStorage as fallback
        localStorage.setItem(quizId, JSON.stringify(result.quiz));
        router.push(`/quiz/${quizId}`);
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
            Turn anything into a <span className="text-primary">Quiz</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your study notes, documents, or paste a link. Quizrr uses AI
            to generate personalized quizzes instantly.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-8 max-w-2xl w-full text-center">
            {error}
          </div>
        )}

        <UploadSection
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        {user && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push("/history")}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
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
