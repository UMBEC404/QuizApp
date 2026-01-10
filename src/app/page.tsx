import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-8">
      <main className="max-w-3xl text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-gradient">Quizrr — Turn anything into a Quiz</h1>
        <p className="text-muted-foreground mb-8">
          Upload your notes or paste content and get instant AI-generated quizzes to study smarter.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/app" className="bg-gradient text-white px-6 py-3 rounded-lg font-bold">Open App</Link>
          <Link href="/app/login" className="px-6 py-3 rounded-lg border border-border text-sm">Sign In</Link>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">Built with Hugging Face and Firebase. Learn more on the repository.</p>
      </main>
    </div>
  );
}
