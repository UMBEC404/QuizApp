'use server';

import { hf, HF_MODEL } from '@/lib/huggingface';
import { Quiz } from '@/lib/types';

/**
 * Removes indexed / numbered list prefixes that confuse the model
 * Example:
 * 1. hello
 * 2) world
 * 3 - test
 */
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
- Include tricky distractors
- Prefer analytical thinking over memorization
`
      : `
Create a GENERAL quiz.
- Focus on basic understanding and recall
- Include definitions, facts, and straightforward questions
- Suitable for quick assessment and revision
`;

  // 🔒 STRICT RULESET
  const strictRules = `
STRICT RULES — MUST BE FOLLOWED EXACTLY:

GENERAL OUTPUT RULES:
- Output ONLY valid JSON
- No markdown
- No extra text
- Preserve formatting such as **bold**, _italic_, symbols, and spacing
- Do NOT escape formatting unless required by JSON

MATH & SIMPLIFICATION RULES (CRITICAL):
- Any simplification question MUST have a fully simplified answer
- Fully simplified means:
  - No common factors remain
  - Fractions are reduced
  - Like terms are combined
  - No unnecessary parentheses
  - Exponents are simplified
- NEVER leave answers like:
  - 2x + x
  - 6/9
  - (x)(x)
- ALWAYS return:
  - 3x
  - 2/3
  - x^2

ALGEBRA & NOTATION RULES:
- Use x^2, x^3 (NOT x² or x**2)
- Do not use unicode superscripts
- Use standard mathematical symbols
- If solving equations, return ONLY the final answer
- If multiple solutions exist, list them clearly

QUESTION DESIGN RULES:
- Questions must strictly match the provided content
- Do not invent unrelated topics
- Multiple-choice distractors must be realistic
- Short-answer questions must have exactly ONE correct answer

FORMATTING RULES:
- Keep math readable and clean
- Preserve emphasis (**bold**) from the source content
- Maintain consistent notation throughout
`;

  const prompt = `
You are a professional exam designer and strict rule-following AI.

${strictRules}

${modeInstruction}

TASK:
Create a quiz with 9–12 questions based ONLY on the content below.

QUIZ REQUIREMENTS:
- Mix multiple-choice and short-answer questions
- Answers must be precise and unambiguous
- Math answers MUST be fully simplified
- Use x^2 style notation
- Preserve formatting styles from the content

RETURN THIS EXACT JSON STRUCTURE:
{
  "title": "Quiz Title",
  "questions": [
    {
      "id": 1,
      "type": "multiple-choice" | "short-answer",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct Answer",
      "explanation": "Clear explanation"
    }
  ]
}

FINAL WARNINGS:
- Output ONLY raw JSON
- No markdown
- No comments
- No extra text

CONTENT:
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
      temperature: 0.6
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
      id: index + 1,
      answer: typeof q.answer === 'string' ? q.answer.trim() : q.answer
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
STRICT RULES:
- Use clean math notation (x^2)
- Fully simplified expressions only
- Preserve formatting such as **bold**
- Be concise and clear

Question: "${question}"
Student Answer: "${userAnswer}"
Correct Answer: "${correctAnswer}"

Explain why the student's answer is correct or incorrect in 2–3 sentences.
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
