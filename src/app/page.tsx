import Link from "next/link";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent py-20">
          <div className="container mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 leading-tight text-gradient">
                Turn anything into a <span className="text-gradient">Quiz</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-6">
                Upload documents, paste notes, or use links — Quizrr uses AI to craft personalized quizzes so you study efficiently and retain more.
              </p>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                <Link href="/app" className="bg-gradient text-white px-6 py-3 rounded-lg font-bold">Open App</Link>
                <Link href="/app/login" className="px-6 py-3 rounded-lg border border-border text-sm">Sign In</Link>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">9-12</div>
                  <div className="text-xs text-muted-foreground">Questions / Quiz</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">Instant</div>
                  <div className="text-xs text-muted-foreground">Generation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">AI</div>
                  <div className="text-xs text-muted-foreground">Powered</div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center">
              {/* Decorative illustration */}
              <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-lg">
                <div className="bg-gradient-to-tr from-primary/20 via-transparent to-transparent rounded-lg p-6">
                  <img
                    src="https://images.unsplash.com/photo-1555949963-aa79dcee981b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2e89e0ab3c6a4e1b8b4a7ffc1a7d4f8a"
                    alt="Study illustration"
                    className="w-full rounded-lg object-cover h-64"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-center">Why Quizrr?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="mb-4 text-3xl">⚡</div>
                <h3 className="font-semibold mb-2">Fast & Simple</h3>
                <p className="text-sm text-muted-foreground">Generate quizzes instantly from text or files with one click.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="mb-4 text-3xl">🧠</div>
                <h3 className="font-semibold mb-2">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">Leverages advanced language models to produce quality questions and explanations.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="mb-4 text-3xl">🔒</div>
                <h3 className="font-semibold mb-2">Secure</h3>
                <p className="text-sm text-muted-foreground">Optionally save results to your account with Firebase auth and secure storage.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials / Callouts */}
        <section className="py-12 bg-muted/5 border-t border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <h3 className="text-2xl font-bold mb-4 text-center">What users love</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">"Saved me hours of prep — quizzes were spot on and helped me pass my exam."</p>
                <div className="mt-3 text-xs text-muted-foreground">— Student, Biology</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">"Great for teachers creating quick assessments."</p>
                <div className="mt-3 text-xs text-muted-foreground">— High School Teacher</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">"Simple UI and fast generation — perfect for revision."</p>
                <div className="mt-3 text-xs text-muted-foreground">— Retiree, Self Learner</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
