'use server';

import { hf, HF_MODEL } from '@/lib/huggingface';
import { Quiz } from '@/lib/types';

function normalizeIndexedText(text: string): string {
  return text
    .replace(/^\s*\d+\s*[.)-]\s*/gm, '')
    .trim();
}

export async function generateQuizAction(
  type: 'text' | 'file',
  mode: 'general' | 'deep',
  content: string
): Promise<{ success: boolean; quiz?: Quiz; error?: string }> {

  if (
    !process.env.HUGGINGFACE_API_KEY ||
    process.env.HUGGINGFACE_API_KEY === 'hf_your_token_here'
  ) {
    return { success: false, error: 'Hugging Face API Key is not configured.' };
  }

  // Normalize input to avoid numbered-list issues
  let promptContent = normalizeIndexedText(content);

  if (type === 'file') {
    if (content.startsWith('File Name:')) {
      promptContent = `Generate a quiz based on the topic implied by this filename: ${content}`;
    } else {
      promptContent = normalizeIndexedText(
        `Generate a quiz based on the following file content:\n${content}`
      );
    }
  }

  // Mode-specific instructions
  const modeInstruction =
    mode === 'deep'
      ? `
Create a DEEP UNDERSTANDING quiz.
- Focus on "why" and "how" questions
- Test reasoning, cause-and-effect, and application of ideas
- Include tricky distractors for multiple-choice questions
- Prefer conceptual and analytical questions over memorization
`
      : `
Create a GENERAL quiz.
- Focus on basic understanding and recall
- Include definitions, facts, and straightforward questions
- Questions should be suitable for revision and quick assessment
`;

  const prompt = `
You are a helpful AI teacher.

${modeInstruction}

Create a quiz with 9-12 questions based on the following content.

Return ONLY a valid JSON object with this structure:
{
  "title": "Quiz Title",
  "questions": [
    {
      "id": 1,
      "type": "multiple-choice" | "short-answer",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct Answer",
      "explanation": "Why this is the correct answer"
    }
  ]
}

IMPORTANT:
- Return ONLY raw JSON
- No markdown
- No extra text

Content:
"""
${promptContent.substring(0, 3000)}
"""
`;

  try {
    const completion = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a strict JSON generator. Output only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No content received from Hugging Face');
    }

    let quizData;
    try {
      quizData = JSON.parse(responseContent.trim());
    } catch {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}$/);
      if (!jsonMatch) {
        console.error('Invalid JSON from AI:', responseContent);
        return { success: false, error: 'Quiz generation failed: invalid JSON.' };
      }
      quizData = JSON.parse(jsonMatch[0]);
    }

    if (!quizData.title || !Array.isArray(quizData.questions)) {
      console.error('Invalid quiz structure:', quizData);
      return {
        success: false,
        error: 'Quiz generation failed: incomplete quiz data.'
      };
    }

    const questions = quizData.questions.map((q: any, index: number) => ({
      ...q,
      id: index + 1
    }));

    return {
      success: true,
      quiz: {
        title: quizData.title || 'Generated Quiz',
        questions
      }
    };
  } catch (error: any) {
    console.error('Hugging Face Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate quiz.'
    };
  }
}

/**
 * Generate an explanation for a student's answer.
 */
export async function generateExplanationAction(
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<{ success: boolean; explanation?: string; error?: string }> {

  if (
    !process.env.HUGGINGFACE_API_KEY ||
    process.env.HUGGINGFACE_API_KEY === 'hf_your_token_here'
  ) {
    return { success: false, error: 'Hugging Face API Key is not configured.' };
  }

  const prompt = `
Question: "${question}"
Student Answer: "${userAnswer}"
Correct Answer: "${correctAnswer}"

Explain why the student's answer is correct or incorrect in 2-3 sentences.
`;

  try {
    const completion = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful tutor.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300
    });

    return {
      success: true,
      explanation:
        completion.choices[0].message.content || 'No explanation generated.'
    };
  } catch (error) {
    console.error('Hugging Face Explanation Error:', error);
    return { success: false, error: 'Failed to generate explanation.' };
  }
}
