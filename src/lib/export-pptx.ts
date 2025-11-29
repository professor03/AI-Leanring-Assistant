import pptxgen from 'pptxgenjs';
import type { PresentationDeck, SlideLayout } from './presentation-schema';
import { LAYOUT_MAP } from './layout-mapper';

export async function exportToPPTX(deck: PresentationDeck): Promise<void> {
    const pptx = new pptxgen();

    // Set presentation metadata
    pptx.author = 'AI Student - Presentation Studio';
    pptx.company = 'AI Student';
    pptx.subject = deck.topic;
    pptx.title = deck.title;

    // Configure slide layout (16:9 widescreen)
    pptx.layout = 'LAYOUT_WIDE';

    // Theme colors mapping
    const themeColors = {
        modern: { background: '667eea', text: 'FFFFFF' },
        classic: { background: 'f5f7fa', text: '2d3748' },
        tech: { background: '0f2027', text: 'FFFFFF' },
        nature: { background: '56ab2f', text: 'FFFFFF' },
        minimal: { background: 'FFFFFF', text: '000000' },
        playful: { background: 'f093fb', text: 'FFFFFF' },
    };

    const theme = themeColors[deck.globalTheme] || themeColors.modern;

    // Generate slides
    for (let index = 0; index < deck.slides.length; index++) {
        const slideData = deck.slides[index];
        const slide = pptx.addSlide();

        // Add gradient background
        slide.background = { color: theme.background };

        // Get layout definition
        const layoutDef = LAYOUT_MAP[slideData.layout as SlideLayout] || LAYOUT_MAP['bullet-points'];

        // 1. Add Title
        if (layoutDef.title) {
            slide.addText(slideData.content.title, {
                x: layoutDef.title.x as any,
                y: layoutDef.title.y as any,
                w: layoutDef.title.w as any,
                h: layoutDef.title.h as any,
                fontSize: layoutDef.title.fontSize || 36,
                bold: true,
                color: theme.text,
                align: layoutDef.title.align || 'left',
                fontFace: 'Arial',
            });
        }

        // 2. Add Subtitle
        if (layoutDef.subtitle && slideData.content.subtitle) {
            slide.addText(slideData.content.subtitle, {
                x: layoutDef.subtitle.x as any,
                y: layoutDef.subtitle.y as any,
                w: layoutDef.subtitle.w as any,
                h: layoutDef.subtitle.h as any,
                fontSize: layoutDef.subtitle.fontSize || 24,
                color: theme.text,
                align: layoutDef.subtitle.align || 'left',
                fontFace: 'Arial',
            });
        }

        // 3. Add Body Text (Main Point or Bullets)
        if (layoutDef.body) {
            let bodyText = "";
            if (slideData.content.mainPoint) {
                bodyText += slideData.content.mainPoint + "\n\n";
            }
            if (slideData.content.bullets && slideData.content.bullets.length > 0) {
                bodyText += slideData.content.bullets.map(b => `• ${b}`).join("\n");
            }

            if (bodyText) {
                slide.addText(bodyText, {
                    x: layoutDef.body.x as any,
                    y: layoutDef.body.y as any,
                    w: layoutDef.body.w as any,
                    h: layoutDef.body.h as any,
                    fontSize: layoutDef.body.fontSize || 18,
                    color: theme.text,
                    align: layoutDef.body.align || 'left',
                    fontFace: 'Arial',
                    valign: 'top',
                });
            }
        }

        // 4. Add Image
        if (layoutDef.image && slideData.content.backgroundImage) {
            try {
                slide.addImage({
                    path: slideData.content.backgroundImage,
                    x: layoutDef.image.x as any,
                    y: layoutDef.image.y as any,
                    w: layoutDef.image.w as any,
                    h: layoutDef.image.h as any,
                });
            } catch (e) {
                console.warn("Failed to add image to PPTX:", e);
            }
        }

        // 5. Add Chart (Native PPTX Charts)
        if (layoutDef.chart && slideData.content.chartData && slideData.content.chartType) {
            const chartData = slideData.content.chartData;
            const chartType = slideData.content.chartType;

            // Map Recharts type to PptxGenJS type
            let pptxChartType = pptx.ChartType.bar;
            if (chartType === 'line') pptxChartType = pptx.ChartType.line;
            if (chartType === 'pie') pptxChartType = pptx.ChartType.pie;
            if (chartType === 'area') pptxChartType = pptx.ChartType.area;
            if (chartType === 'radar') pptxChartType = pptx.ChartType.radar;

            // Format data for PPTX
            // Recharts: [{name: 'A', value: 10}, {name: 'B', value: 20}]
            // PPTX: labels: ['A', 'B'], values: [10, 20]
            const labels = chartData.map(d => d.name);
            const values = chartData.map(d => d.value);

            const data = [
                {
                    name: slideData.content.chartConfig?.yLabel || "Data",
                    labels: labels,
                    values: values
                }
            ];

            slide.addChart(pptxChartType, data, {
                x: layoutDef.chart.x as any,
                y: layoutDef.chart.y as any,
                w: layoutDef.chart.w as any,
                h: layoutDef.chart.h as any,
                showLegend: true,
                showTitle: false,
                showValue: true,
            });
        }

        // 6. Add Slide Number
        slide.addText(`${index + 1} / ${deck.slides.length}`, {
            x: '90%',
            y: '95%',
            w: '10%',
            h: '5%',
            fontSize: 10,
            color: theme.text,
            align: 'right',
        });

        // 7. Add Speaker Notes
        if (slideData.speakerNotes) {
            slide.addNotes(slideData.speakerNotes);
        }
    }

    // Download the file
    const fileName = `${deck.title.replace(/[^a-z0-9]/gi, '_')}.pptx`;
    await pptx.writeFile({ fileName });
}
