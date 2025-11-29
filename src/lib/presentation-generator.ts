import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    PresentationSlideSchema,
    type PresentationDeck,
    type PresentationSlide,
    type SlideTheme
} from './presentation-schema';
import { z } from 'zod';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

interface GenerationParams {
    topic: string;
    audience: string;
    vibe: string;
    theme: string;
    duration: number;
    researchContext?: { topic: string; results: any[] };
}

// --- Step 1: Generate Outline ---

const OutlineSchema = z.array(z.object({
    title: z.string(),
    layout: z.string(),
    purpose: z.string().describe("Brief description of what this slide should cover"),
}));

async function generateOutline(params: GenerationParams): Promise<z.infer<typeof OutlineSchema>> {
    const slideCount = Math.ceil(params.duration / 1.5);

    let researchContextStr = "";
    if (params.researchContext && params.researchContext.results.length > 0) {
        researchContextStr = `
        USE THE FOLLOWING RESEARCH DATA AS THE **ONLY** SOURCE OF INFORMATION:
        Research Topic: ${params.researchContext.topic}
        Data:
        ${params.researchContext.results.map((r, i) => `${i + 1}. ${r.title}: ${r.summary}`).join('\n')}
        
        STRICT GROUNDING RULE:
        - You must ONLY use facts present in the provided Data.
        - Do NOT hallucinate or invent statistics.
        - If the data is insufficient for a specific section, use general knowledge but mark it as [General Knowledge].
        `;
    }

    const prompt = `
Act as a world-class strategy consultant (McKinsey/BCG style).
Create a presentation outline for:
- Topic: "${params.topic}"
- Audience: ${params.audience}
- Vibe: ${params.vibe}
- Duration: ${params.duration} minutes (Target: ${slideCount} slides)

${researchContextStr}

FRAMEWORK: Use the SCQA (Situation, Complication, Question, Answer) narrative flow.
OUTPUT LANGUAGE: Traditional Chinese (Taiwan) / 繁體中文 (台灣).

Structure the deck as follows:
1. Title Slide (Hook)
2. Context/Situation (Why now?)
3. The Problem/Complication
4. The Core Question
5. The Solution/Answer (Split into 2-3 slides if needed, using MECE principle)
6. **Data Proof & Evidence** (MUST use a chart or statistic layout)
7. Conclusion & Call to Action

Output a JSON array of objects with:
- title: Slide headline
- layout: One of ['title', 'section-header', 'agenda', 'scqa', 'bento-grid', 'data-chart', 'process-diagram', 'split_left', 'split_right', 'image_focus', 'quote', 'bullet-points', 'conclusion', 'timeline', 'comparison', 'team-grid', 'statistic-focus', 'feature-grid-3', 'feature-grid-4', 'call-to-action']
- purpose: Instruction for the content writer

CRITICAL LAYOUT RULES (JENSEN HUANG STYLE):
1. **VISUAL FIRST**: Prioritize 'bento-grid', 'split_left', 'split_right', 'image_focus'.
2. **BIG DATA**: Use 'statistic-focus' or 'data-chart' for ANY quantitative point.
3. **MINIMAL TEXT**: Use 'bullet-points' layout for MAXIMUM 20% of slides. Prefer 'feature-grid-3' or 'timeline' for lists.
4. **DIVERSITY**: Do NOT use the same layout twice in a row.
5. **EVIDENCE**: The "Data Proof" section MUST use 'data-chart' or 'statistic-focus'.
  `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = text.replace(/```json\n?|\n?```/g, '').trim();

    return OutlineSchema.parse(JSON.parse(json));
}

// --- Step 2: Generate Single Slide ---

async function generateSlide(
    outlineItem: { title: string; layout: string; purpose: string },
    params: GenerationParams,
    index: number
): Promise<PresentationSlide> {

    let researchContextStr = "";
    if (params.researchContext && params.researchContext.results.length > 0) {
        researchContextStr = `
        STRICTLY Refer to this research data. Do NOT deviate from these facts:
        ${params.researchContext.results.map((r, i) => `${i + 1}. ${r.title}: ${r.summary}`).join('\n')}
        
        STRICT GROUNDING RULE:
        - If the research data contains specific numbers/stats, you MUST use them.
        - If the research data contradicts your general knowledge, TRUST THE RESEARCH DATA.
        `;
    }

    const prompt = `
You are a professional presentation designer. Generate content for ONE slide.

Context:
- Topic: ${params.topic}
- Audience: ${params.audience}
- Vibe: ${params.vibe}

${researchContextStr}

Slide Details:
- Title: "${outlineItem.title}"
- Layout: "${outlineItem.layout}"
- Purpose: ${outlineItem.purpose}

OUTPUT LANGUAGE: Traditional Chinese (Taiwan) / 繁體中文 (台灣).

CRITICAL RULES (JENSEN HUANG STYLE):
1. **EXTREME BREVITY**: 
   - Bullet points must be **UNDER 6 WORDS**.
   - NO full sentences. NO periods.
   - Example: "Accelerate growth." NOT "We aim to accelerate growth."
2. **VISUAL DOMINANCE**: 
   - Every slide needs a strong visual component.
   - For 'image_focus', 'split_left', 'split_right', 'title', provide a 'backgroundImage' URL using Pollinations AI: "https://image.pollinations.ai/prompt/{description}?width=1080&height=720&nologo=true".
   - Description must be cinematic, high-contrast, and suitable for a dark mode presentation (e.g., "neon_cyberpunk_city_data_stream").
3. **BIG NUMBERS**:
   - If the layout is 'statistic-focus', the "mainPoint" MUST be a number (e.g., "10x", "85%", "$1B").
   - The subtitle should explain the number in < 10 words.
4. **DATA & CHARTS**:
   - For 'data-chart', provide "chartData" and "chartType".
   - **PLAUSIBLE ESTIMATION**: If exact data is missing, generate **plausible estimation data** based on the topic context. Label it as "Estimated".

Output ONLY valid JSON in this EXACT format:
{
  "content": {
    "title": "Slide Title Here",
    "subtitle": "Optional subtitle",
    "mainPoint": "The key takeaway (One punchy sentence)",
    "bullets": ["Point 1", "Point 2", "Point 3"],
    "backgroundImage": "https://image.pollinations.ai/prompt/..."
  },
  "speakerNotes": "What the presenter should say (100 words)"
}

LAYOUT SPECIFIC RULES:
- If layout is 'data-chart', add "chartData": [{"name": "Label", "value": 100}, ...] inside content and "chartType": "bar" | "line" | "pie" | "area".
- If layout is 'process-diagram', add "diagramCode": "graph TD\\nA[Step 1]-->B[Step 2]" inside content.
- If layout is 'statistic-focus', ensure "mainPoint" is a big number (e.g., "85%") and "subtitle" explains it.
- Always include "content" object with at least "title".
- Always include "speakerNotes".
- Output ONLY the JSON, no markdown code blocks.
  `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const json = text.replace(/```json\n?|\n?```/g, '').trim();

        const rawData = JSON.parse(json);

        let slideData = {
            ...rawData,
            id: crypto.randomUUID(),
            layout: outlineItem.layout,
        };

        // --- STRATEGY 4: SELF-CORRECTION MECHANISM ---
        // If layout requires data but it's missing, trigger a repair
        if ((slideData.layout === 'data-chart' || slideData.layout === 'statistic-focus') &&
            (!slideData.content.chartData && !slideData.content.statistic)) {

            console.log(`[Self-Correction] 🔧 Detecting missing data for slide: "${slideData.content.title}". Attempting repair...`);
            try {
                const repairedData = await repairSlideData(slideData, params);
                if (repairedData) {
                    slideData.content = { ...slideData.content, ...repairedData };
                    console.log(`[Self-Correction] ✅ Repair successful!`);
                }
            } catch (err) {
                console.warn(`[Self-Correction] ⚠️ Repair failed. Applying Safety Net.`);
                // --- STRATEGY 5: PROGRAMMATIC SAFETY NET ---
                // If repair fails, DO NOT revert to text. Force a placeholder chart so the user can edit it.
                if (slideData.layout === 'data-chart') {
                    slideData.content.chartType = 'bar';
                    slideData.content.chartData = [
                        { name: "Category A", value: 65 },
                        { name: "Category B", value: 40 },
                        { name: "Category C", value: 85 },
                    ];
                    slideData.content.subtitle = "Data unavailable - Please edit chart data";
                } else if (slideData.layout === 'statistic-focus') {
                    slideData.content.statistic = "XX%";
                    slideData.content.statisticLabel = "Data needs update";
                }
            }
        }

        return PresentationSlideSchema.parse(slideData);
    } catch (error: any) {
        console.error(`[ERROR] Failed to generate slide ${index}:`, error.message);
        return {
            id: crypto.randomUUID(),
            layout: 'bullet-points',
            content: {
                title: outlineItem.title,
                subtitle: "Content generation failed",
                bullets: [`Error: ${error.message || 'Unknown error'}`],
            },
            speakerNotes: "Sorry, I couldn't generate this slide.",
        } as PresentationSlide;
    }
}

// --- Strategy 4 Helper: Repair Agent ---
async function repairSlideData(slideData: any, params: GenerationParams): Promise<any> {
    const repairPrompt = `
    SYSTEM ALERT: You are a Data Repair Agent.
    The user generated a slide with layout "${slideData.layout}" but FORGOT to include the required data fields.
    
    Context:
    - Topic: ${params.topic}
    - Slide Title: ${slideData.content.title}
    - Main Point: ${slideData.content.mainPoint}

    TASK: Generate the missing JSON data fields for this layout.
    
    RULES:
    1. If layout is 'data-chart', generate "chartData" (array of name/value) and "chartType" (bar/line/pie).
    2. If layout is 'statistic-focus', generate "statistic" (e.g. "85%") and "statisticLabel" (short description).
    3. Data must be PLAUSIBLE ESTIMATIONS based on the context.
    4. Output ONLY the JSON object with the missing fields.

    Example Output for data-chart:
    { "chartData": [{"name": "2023", "value": 45}, {"name": "2024", "value": 78}], "chartType": "bar" }
    `;

    const result = await model.generateContent(repairPrompt);
    const text = result.response.text();
    const json = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(json);
}

// --- Main Function ---

export async function generatePresentation(params: GenerationParams): Promise<PresentationDeck> {
    console.log("Generating Outline...");
    const outline = await generateOutline(params);

    console.log(`Generating ${outline.length} slides...`);
    // Generate slides in parallel
    const slidePromises = outline.map((item, index) => generateSlide(item, params, index));
    const slides = await Promise.all(slidePromises);

    const deck: PresentationDeck = {
        id: crypto.randomUUID(),
        title: params.topic,
        topic: params.topic,
        targetAudience: params.audience,
        vibe: params.vibe,
        slides: slides,
        globalTheme: params.theme as SlideTheme,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return deck;
}

/**
 * Generate a chat response based on the presentation context
 */
export async function generateChatResponse(
    history: { role: 'user' | 'model'; content: string }[],
    context: {
        slideContent?: any;
        deckTitle?: string;
        deckTheme?: string;
        currentSlideIndex?: number;
    },
    userMessage: string
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const contextPrompt = `
You are an expert presentation coach and design assistant.
You are helping a user refine their presentation titled "${context.deckTitle || 'Untitled'}".
The current theme is "${context.deckTheme || 'default'}".

${context.slideContent ? `
CURRENT SLIDE CONTEXT (Slide ${context.currentSlideIndex ? context.currentSlideIndex + 1 : 'Unknown'}):
${JSON.stringify(context.slideContent, null, 2)}
` : 'No specific slide is currently selected.'}

Your goal is to provide helpful, specific, and actionable advice.
- If the user asks to improve the slide, suggest specific text changes or visual tweaks.
- If the user asks for a joke, make it relevant to the slide topic.
- Keep responses concise and encouraging.
- Do not output JSON unless explicitly asked. Use natural language.
`;

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: contextPrompt }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am ready to help you with your presentation. What would you like to do?" }],
            },
            ...history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }],
            })),
        ],
    });

    try {
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Chat generation failed:", error);
        return "I'm having trouble connecting to my brain right now. Please try again.";
    }
}
