import { generatePresentation } from '../lib/presentation-generator';

async function run() {
    console.log("🧪 Starting Presentation Generation Test...");

    const params = {
        topic: "The Future of Quantum Computing",
        audience: "investors",
        vibe: "tech",
        theme: "blue", // Added missing theme property
        duration: 3 // Short duration for speed
    };

    try {
        console.log("📝 Params:", params);
        const deck = await generatePresentation(params);

        console.log("\n✅ Generation Successful!");
        console.log("-----------------------------------");
        console.log(`Title: ${deck.title}`);
        console.log(`Slides: ${deck.slides.length}`);
        console.log(`Theme: ${deck.globalTheme}`);
        console.log("-----------------------------------");

        deck.slides.forEach((slide, i) => {
            console.log(`\n[Slide ${i + 1}] ${slide.content.title} (${slide.layout})`);
            if (slide.content.subtitle === "Content generation failed") {
                console.error("❌ FAILED:", slide.content.bullets);
            } else {
                console.log(`   Main Point: ${slide.content.mainPoint || 'N/A'}`);
                console.log(`   Bullets: ${slide.content.bullets?.length || 0}`);
                if (slide.content.chartData) console.log(`   📊 Has Chart: ${slide.content.chartType}`);
                if (slide.content.diagramCode) console.log(`   🔄 Has Diagram`);
            }
        });

    } catch (error: any) {
        if (error.issues) {
            console.error("\n❌ Zod Validation Error:");
            // Log issues concisely
            error.issues.forEach((issue: any) => {
                console.error(`- Path: ${issue.path.join('.')}`);
                console.error(`  Error: ${issue.message}`);
                console.error(`  Expected: ${issue.expected}, Received: ${issue.received}`);
            });
        } else {
            console.error("\n❌ Test Failed:", error);
        }
    }
}

run();
