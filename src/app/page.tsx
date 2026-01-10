"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent py-20">
          <div className="container mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-12">
            <motion.div
              className="w-full lg:w-1/2 text-center lg:text-left"
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6 }}
              variants={fadeUp}
            >
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 leading-tight">
                Turn anything into a{" "}
                <span className="text-gradient">Quiz</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl mb-6">
                Quizrr transforms your notes, documents, and learning materials
                into smart, AI-generated quizzes. Designed to help students,
                teachers, and professionals study faster, test smarter, and
                retain more information.
              </p>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                <Link
                  href="/app"
                  className="bg-gradient text-white px-6 py-3 rounded-lg font-bold"
                >
                  Open App
                </Link>
                <Link
                  href="/app/login"
                  className="px-6 py-3 rounded-lg border border-border text-sm"
                >
                  Sign In
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">9–12</div>
                  <div className="text-xs text-muted-foreground">
                    Questions per quiz
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">Instant</div>
                  <div className="text-xs text-muted-foreground">
                    AI generation
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">PDF • DOCX</div>
                  <div className="text-xs text-muted-foreground">
                    File support
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="w-full lg:w-1/2 flex justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-lg">
                <div className="bg-gradient-to-tr from-primary/20 via-transparent to-transparent rounded-lg p-6">
                  <div className="flex-1 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-8 hover:bg-muted/10 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-upload w-12 h-12 text-muted-foreground mb-4" aria-hidden="true">
                    <path d="M12 3v12"></path><path d="m17 8-5-5-5 5"></path>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    </svg>
                    <p className="text-muted-foreground mb-2">Drag and drop your file here</p>
                    <p className="text-xs text-muted-foreground mb-4">PDF, DOCX, TXT (Max 10MB)</p>
                    <link className="hidden" href="/app"><label htmlFor="file-upload" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md cursor-pointer border border-border" >Browse Files</label></link>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold mb-6 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              Why Quizrr?
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: "⚡",
                  title: "Fast & Simple",
                  desc: "Upload files or paste text and receive a fully structured quiz in seconds — no setup, no complexity.",
                },
                {
                  icon: "🧠",
                  title: "AI-Powered Intelligence",
                  desc: "Quizrr analyzes context, key concepts, and difficulty to generate meaningful questions, not filler.",
                },
                {
                  icon: "🔒",
                  title: "Secure & Private",
                  desc: "Your content stays protected with Firebase authentication and optional quiz history storage.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="bg-card border border-border rounded-xl p-6 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <div className="mb-4 text-3xl">{item.icon}</div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 bg-muted/5 border-t border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.h3
              className="text-2xl font-bold mb-4 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              Trusted by students and educators
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  text:
                    "Quizrr genuinely saved me hours of exam prep. The quizzes were accurate, well-structured, and closely matched what I was tested on.",
                  name: "Jason Miller",
                },
                {
                  text:
                    "As a teacher, Quizrr lets me create assessments in minutes instead of hours. My students love it, and I rely on it weekly.",
                  name: "Emily Carter, High School Teacher",
                },
                {
                  text:
                    "As a college professor, I value clarity and efficiency. Quizrr consistently produces high-quality review material for my students.",
                  name: "Brandon Thompson, Physics Professor",
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  className="bg-card border border-border rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <p className="text-sm text-muted-foreground">"{t.text}"</p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    — {t.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
