import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LectureNotes, QuizQuestion } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Missing VITE_GEMINI_API_KEY in .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const generateNotes = async (text: string, courseName: string): Promise<LectureNotes> => {
  const prompt = `
    You are an expert student tutor. Analyze the following text from the course "${courseName}" and create structured lecture notes.
    
    IMPORTANT: Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    
    CRITICAL FORMATTING RULES:
    - Use **bold** ONLY for the most important key terms and concepts (use sparingly, max 2-3 per paragraph)
    - Use plain text for normal content
    - Use line breaks to separate paragraphs (use \\n\\n for double line breaks)
    - For lists, use numbered format (1. 2. 3.) or bullet points (- item)
    - Keep formatting minimal and clean
    - DO NOT make titles or common words bold
    
    Return the response in valid JSON format with the following structure:
    {
      "summary": "A concise summary. Use **bold** ONLY for critical concepts. Use \\n\\n for paragraph breaks.",
      "sections": [
        {
          "id": "section-1",
          "title": "Main Topic 1",
          "content": "Detailed explanation. Use **bold** only for KEY TERMS that students must remember. Use \\n\\n to separate paragraphs."
        }
      ],
      "terms": [
        {
          "term": "Key Term 1",
          "definition": "Simple definition of the term."
        }
      ]
    }

    Text to analyze:
    ${text.slice(0, 30000)} // Limit text length for safety
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean up markdown code blocks if present
    const cleanJson = textResponse.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return {
      id: crypto.randomUUID(),
      materialId: 'generated',
      courseName: courseName,
      summary: data.summary,
      sections: data.sections,
      terms: data.terms,
    };
  } catch (error: any) {
    console.error('Error generating notes:', error);
    // Pass the actual error message to the UI
    const msg = error?.message || error?.toString() || 'Unknown AI error';
    throw new Error(`AI 生成失敗: ${msg}`);
  }
};

export const generateQuiz = async (
  text: string,
  options: { count: number; type: string; allowExternal: boolean } = { count: 3, type: 'mixed', allowExternal: false }
): Promise<QuizQuestion[]> => {
  const prompt = `
    You are an expert exam creator. Create ${options.count} quiz questions based on the provided text.
    
    Configuration:
    - Question Type: ${options.type} (multiple-choice, true-false, fill-in-the-blank, short-answer, or mixed)
    - Allow External Knowledge: ${options.allowExternal ? 'YES (You can use your broader knowledge to create relevant questions)' : 'NO (Strictly stick to the provided text)'}
    
    IMPORTANT: Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    
    Return the response in valid JSON format as an array of objects.
    
    For 'multiple-choice', structure as:
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct"
    }

    For 'true-false', structure as:
    {
      "id": "q2",
      "type": "true-false",
      "question": "Statement",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Why"
    }

    For 'short-answer' or 'fill-in-the-blank', structure as:
    {
      "id": "q3",
      "type": "short-answer",
      "question": "Question text",
      "correctAnswer": "The expected answer",
      "explanation": "Details"
    }

    Text to analyze:
    ${text.slice(0, 15000)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    const cleanJson = textResponse.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return data.map((q: any) => ({
      ...q,
      id: crypto.randomUUID(),
      userAnswer: undefined, // Reset user answer
      isCorrect: undefined, // Reset validation
    }));
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    const msg = error?.message || error?.toString() || 'Unknown AI error';
    throw new Error(`AI 出題失敗: ${msg}`);
  }
};
