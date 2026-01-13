"use client";

import Link from "next/link";
import { BrainCircuit, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { clsx } from "clsx";
import { useState } from "react";

export function Header() {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/app"
          className="flex items-center gap-2 text-2xl font-bold text-gradient"
        >
          <BrainCircuit className="w-8 h-8" />
          <span>Quizzrd</span>
        </Link>
        <nav className="flex items-center gap-6">
          <p>V1.1.2</p>
          <a href="https://github.com/UMBEC404/QuizApp">Github Repo</a>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full border border-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                )}
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-20 py-1">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/app/history"
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      History
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/app/login"
              className="bg-gradient text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
