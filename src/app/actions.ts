'use server';

import { hf, HF_MODEL } from '@/lib/huggingface';
import { Quiz } from '@/lib/types';

export async function generateQuizAction(
  type: 'text' | 'file',
  content: string
): Promise<{ success: boolean; quiz?: Quiz; error?: string }> {

  if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY === 'hf_your_token_here') {
    return { success: false, error: "Hugging Face API Key is not configured." };
  }

  // In a real app, we would parse the file here.
  // For this prototype, we assume 'content' is the text to process.

  let promptContent = content;
  if (type === 'file') {
    // If the content starts with "File Name:", it means we couldn't extract text.
    // Otherwise, it's the actual text content.
    if (content.startsWith('File Name:')) {
      promptContent = `Generate a general quiz based on the topic implied by this filename: ${content}`;
    } else {
      promptContent = `Generate a quiz based on the following file content: ${content}`;
    }
  }

  const prompt = `
    You are a helpful AI teacher. Create a quiz with 9-12 questions based on the following content.
    Return ONLY a valid JSON object with the following structure:
    {
      "title": "Quiz Title",
      "questions": [
        {
          "id": 1,
          "type": "multiple-choice" | "short-answer",
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"], // Only for multiple-choice
          "answer": "Correct Answer",
          "explanation": "Why this is the correct answer"
        }
      ]
    }
    
    IMPORTANT: Return ONLY the raw JSON string. Do not use markdown code blocks or any other text.

    Content:
    ${promptContent.substring(0, 3000)}
  `;

  try {
    const completion = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        { role: "system", content: "You are a quiz generator that outputs only JSON." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No content received from Hugging Face");
    }

    // Clean up potential markdown code blocks if the model adds them
    let cleanContent = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();

    let quizData;
    try {
      quizData = JSON.parse(cleanContent);
    } catch (err) {
      // Try to extract JSON from the response using regex
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          cleanContent = jsonMatch[0];
          quizData = JSON.parse(cleanContent);
        } catch (e) {
          console.error("Invalid JSON from AI:", cleanContent);
          return { success: false, error: "Quiz generation failed: AI returned invalid JSON." };
        }
      } else {
        console.error("Invalid JSON from AI:", cleanContent);
        return { success: false, error: "Quiz generation failed: AI returned invalid JSON." };
      }
    }

    // Validate required structure
    if (!quizData.title || !Array.isArray(quizData.questions)) {
      console.error("Invalid quiz structure from AI:", quizData);
      return { success: false, error: "Quiz generation failed: AI returned incomplete quiz data." };
    }


    // Add IDs if missing or ensure structure
    const questions = quizData.questions.map((q: any, index: number) => ({
      ...q,
      id: index + 1
    }));

    return {
      success: true,
      quiz: {
        title: quizData.title || "Generated Quiz",
        questions
      }
    };

  } catch (error: any) {
    console.error("Hugging Face Error:", error);
    return { success: false, error: error.message || "Failed to generate quiz. Please try again." };
  }
}

export async function generateExplanationAction(
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<{ success: boolean; explanation?: string; error?: string }> {
  if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY === 'hf_your_token_here') {
    return { success: false, error: "Hugging Face API Key is not configured." };
  }

  const prompt = `
    The student answered a quiz question.
    Question: "${question}"
    Student Answer: "${userAnswer}"
    Correct Answer: "${correctAnswer}"

    Explain why the student's answer is correct or incorrect, and provide a clear explanation of the concept. 
    Keep it concise (2-3 sentences).
  `;

  try {
    const completion = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        { role: "system", content: "You are a helpful tutor." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
    });

    return {
      success: true,
      explanation: completion.choices[0].message.content || "No explanation generated."
    };
  } catch (error) {
    console.error("Hugging Face Explanation Error:", error);
    return { success: false, error: "Failed to generate explanation." };
  }
}
