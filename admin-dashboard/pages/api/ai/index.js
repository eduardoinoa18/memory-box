import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with API key from environment
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request) {
    try {
        const { prompt, type = 'general' } = await request.json();

        // If OpenAI is not configured, return helpful error
        if (!openai) {
            return NextResponse.json({ 
                success: false, 
                error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.',
                fallback: true
            }, { status: 503 });
        }

        // Create system prompt based on type
        const systemPrompt = getSystemPrompt(type);

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const response = completion.choices[0].message.content;

        return NextResponse.json({ 
            success: true, 
            response,
            timestamp: new Date().toISOString(),
            type,
            model: "gpt-4-turbo-preview"
        });

    } catch (error) {
        console.error('AI API Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Failed to generate AI response',
                fallback: true
            },
            { status: 500 }
        );
    }
}

function getSystemPrompt(type) {
    const basePrompt = "You are Rob, an AI assistant for the Memory Box admin dashboard. You analyze platform data and provide actionable insights for platform optimization. Be concise, data-driven, and provide specific recommendations.";

    switch (type) {
        case 'kpi_summary':
            return `${basePrompt} Focus on analyzing key performance indicators, user growth trends, and platform health metrics. Provide strategic recommendations for improvement.`;
        
        case 'content_analysis':
            return `${basePrompt} Analyze content moderation data, user-generated content quality, and policy compliance. Recommend content strategy improvements.`;
        
        case 'user_insights':
            return `${basePrompt} Analyze user behavior patterns, engagement metrics, and user journey data. Provide insights on user experience optimization.`;
        
        default:
            return basePrompt;
    }
}

// For future OpenAI integration:
/*
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const { prompt, type } = await request.json();

        const systemPrompt = `You are Rob, an AI assistant for MemoryBox admin dashboard. 
        Analyze the provided data and give actionable insights for platform optimization.
        Be concise, data-driven, and provide specific recommendations.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        return NextResponse.json({
            success: true,
            response: completion.choices[0].message.content,
            timestamp: new Date().toISOString(),
            type
        });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate AI response' },
            { status: 500 }
        );
    }
}
*/
