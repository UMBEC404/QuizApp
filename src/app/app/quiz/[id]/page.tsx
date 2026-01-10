import { QuizClient } from '@/app/quiz/[id]/QuizClient';

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizClient id={id} />;
}
