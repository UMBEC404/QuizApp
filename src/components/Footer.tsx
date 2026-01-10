"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16 bg-background/50">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="w-full md:w-1/3">
          <h3 className="text-lg font-bold text-gradient">BrainTest AI</h3>
          <p className="text-sm text-muted-foreground mt-2">Turn notes into quizzes with AI — study smarter, faster.</p>
        </div>

        <div className="w-full md:w-1/3 flex justify-center gap-6">
          <Link href="/app" className="text-sm hover:text-gradient">App</Link>
          <Link href="/app/login" className="text-sm hover:text-gradient">Sign In</Link>
          <a href="https://github.com/UMBEC404" className="text-sm hover:text-gradient">GitHub</a>
        </div>

        <div className="w-full md:w-1/3 text-right text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} BrainTest AI</div>
          <div className="mt-1">Made with ❤️ — Built on Hugging Face & Firebase</div>
        </div>
      </div>
    </footer>
  );
}
