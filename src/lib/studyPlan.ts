import { GoogleGenerativeAI } from '@google/generative-ai';
import type { StudyPlanItem } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const generateStudyPlan = async (
  _examDate: Date,
  notesSummary: string,
  subjects: string[],
  _mode: 'exam' | 'review'
): Promise<StudyPlanItem[]> => {
  // Strict schedule offsets: D+3, D+5, D+7, D+14
  const offsets = [3, 5, 7, 14];
  const today = new Date();

  const prompt = `
    You are an expert study planner.
    
    Task: Create 4 distinct review topics for EACH of the following subjects: ${subjects.join(', ')}.
    These topics will be scheduled for D+3, D+5, D+7, and D+14 reviews.
    
    Context from notes:
    ${notesSummary.slice(0, 10000)}
    
    IMPORTANT: Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    
    Return the response in valid JSON format as an array of objects.
    Structure:
    [
      {
        "course": "Subject Name",
        "topics": ["Topic for D+3", "Topic for D+5", "Topic for D+7", "Topic for D+14"]
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleanJson);

    const planItems: StudyPlanItem[] = [];

    data.forEach((subjectPlan: any) => {
      subjectPlan.topics.forEach((topic: string, index: number) => {
        if (index < offsets.length) {
          const offset = offsets[index];
          const dueDate = new Date(today);
          dueDate.setDate(today.getDate() + offset);

          planItems.push({
            id: crypto.randomUUID(),
            course: subjectPlan.course,
            topic: topic,
            dueDate: dueDate.toISOString().split('T')[0],
            dayOffset: offset,
          });
        }
      });
    });

    return planItems.sort((a, b) => a.dayOffset - b.dayOffset);
  } catch (error) {
    console.error('Study plan generation error:', error);
    throw new Error('Failed to generate study plan');
  }
};
