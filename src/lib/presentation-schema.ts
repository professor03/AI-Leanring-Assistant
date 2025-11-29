import { z } from 'zod';

// --- Enums & Primitives ---

export const SlideLayoutSchema = z.enum([
    'title',           // Cover slide
    'section-header',  // Chapter divider
    'agenda',          // Table of contents
    'scqa',            // Situation, Complication, Question, Answer
    'bento-grid',      // Modern grid layout
    'data-chart',      // Full screen chart
    'process-diagram', // Mermaid diagram
    'split_left',      // Image Left, Text Right
    'split_right',     // Image Right, Text Left
    'image_focus',     // Full image with overlay
    'quote',           // Big typography
    'bullet-points',   // Classic list
    'conclusion',      // Summary & CTA
    'timeline',        // Horizontal or vertical timeline
    'comparison',      // Two or three column comparison
    'team-grid',       // Team members
    'statistic-focus', // Big number
    'feature-grid-3',  // 3 column features
    'feature-grid-4',  // 4 column features
    'call-to-action',  // Final CTA
]);

export const SlideThemeSchema = z.enum([
    'modern',    // Clean, Sans-serif, Blue/White
    'classic',   // Serif, Cream/Black, Elegant
    'tech',      // Dark mode, Neon, Monospace headers
    'nature',    // Green/Earth tones, Organic shapes
    'minimal',   // Black/White, High contrast, Helvetica
    'playful',   // Colorful, Rounded, Comic Sans-ish
]);

export const ChartTypeSchema = z.enum(['bar', 'line', 'pie', 'area', 'composed', 'radar']);

// --- Sub-Schemas ---

export const ChartDataPointSchema = z.object({
    name: z.string().describe("Label for the data point (e.g., 'Q1 2024')"),
    value: z.number().describe("Numerical value"),
    category: z.string().optional().describe("Optional category for grouped charts"),
});

export const SlideContentSchema = z.object({
    title: z.string().describe("Main headline of the slide"),
    subtitle: z.string().optional().describe("Supporting text or sub-headline"),

    // Text Content
    mainPoint: z.string().optional().describe("The single most important takeaway"),
    bullets: z.array(z.string()).optional().describe("List of supporting points"),

    // Visual Content - Data
    chartData: z.array(ChartDataPointSchema).optional(),
    chartType: ChartTypeSchema.optional(),
    chartConfig: z.object({
        xLabel: z.string().optional(),
        yLabel: z.string().optional(),
        colors: z.array(z.string()).optional(),
    }).optional(),

    // Visual Content - Logic
    diagramCode: z.string().optional().describe("Mermaid.js diagram definition"),

    // Visual Content - Art
    backgroundImage: z.string().optional().describe("Description for generative background or image URL"),
    imagePrompt: z.string().optional().describe("Prompt for AI image generation"),
});

// --- Main Schemas ---

export const PresentationSlideSchema = z.object({
    id: z.string().uuid(),
    layout: SlideLayoutSchema,
    theme: SlideThemeSchema.optional(), // Can override deck theme
    content: SlideContentSchema,
    speakerNotes: z.string().describe("Script for the presenter to say"),
    duration: z.number().optional().describe("Estimated duration in seconds"),
});

export const PresentationDeckSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    topic: z.string(),

    // Calibration Data
    targetAudience: z.string(),
    vibe: z.string(),

    // Content
    slides: z.array(PresentationSlideSchema),
    globalTheme: SlideThemeSchema,

    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

// --- TypeScript Types (Inferred) ---

export type SlideLayout = z.infer<typeof SlideLayoutSchema>;
export type SlideTheme = z.infer<typeof SlideThemeSchema>;
export type ChartType = z.infer<typeof ChartTypeSchema>;
export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;
export type SlideContent = z.infer<typeof SlideContentSchema>;
export type PresentationSlide = z.infer<typeof PresentationSlideSchema>;
export type PresentationDeck = z.infer<typeof PresentationDeckSchema>;
