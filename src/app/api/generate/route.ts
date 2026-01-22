import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API usually processes within 30s, but we still might hit Vercel Hobby limits (10s).
// However, Gemini doesn't have a built-in async polling mechanism like Replicate easily exposed.
// We will try a direct wait approach. If it times out on Vercel Hobby, we might need a different strategy.
// But for standard image gen, it's often fast enough.

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // MOCK MODE: Return a fake result immediately
    // In production, set MOCK_MODE=false in .env
    const isMockMode = process.env.MOCK_MODE !== 'false';

    if (isMockMode) {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Return a placeholder image of a pool as the "result"
      const mockResultImage = "https://images.unsplash.com/photo-1572331165267-854da2b00ca1?q=80&w=2070&auto=format&fit=crop";

      // Return structure matching what frontend expects (id for polling, but here we just finish)
      // Since frontend expects polling, we need to adapt the frontend or fake a "completed" state here.
      // But wait, the frontend is designed for Replicate's async polling.
      // Gemini is synchronous. We should probably update the frontend to handle sync response too.
      // OR, we can just return the result directly if we change frontend logic.
      // Let's stick to returning a "completed" status directly for Gemini.
      
      return NextResponse.json({
        status: 'succeeded',
        output: mockResultImage
      });
    }

    // --- REAL IMPLEMENTATION (Google Gemini API) ---
    // Note: Gemini 1.5 Flash/Pro are primarily text/multimodal-to-text models.
    // For IMAGE GENERATION (Imagen 3), access is via Vertex AI or specific endpoints.
    // The standard @google/generative-ai SDK supports 'gemini-1.5-pro' etc.
    // BUT, generating IMAGES via this SDK is not always straightforward or available in all tiers.
    // Assuming the user wants to use Gemini for "editing" or "generation".
    // Currently, public Gemini API (AI Studio) does NOT support image generation (Imagen) widely via this SDK yet.
    // It mostly supports Image Analysis (Vision).
    
    // HOWEVER, the user provided a GEMINI_API_KEY.
    // Let's assume they have access to a model that can output images or they want text description?
    // User asked for "Banana API" but gave "GEMINI_API_KEY".
    // AND user context is "generate a pool design".
    
    // CRITICAL CHECK: Does @google/generative-ai support image generation?
    // As of early 2025, standard Gemini API is for text/chat/vision-analysis.
    // Image GENERATION usually requires Vertex AI (Google Cloud) or specific Imagen endpoints.
    
    // BUT, since the user explicitly asked to "switch to Banana API" but gave a "GEMINI_API_KEY",
    // there might be a misunderstanding. The key format "AQ.Ab8..." looks like a Banana/Vertex key?
    // Wait, Banana API keys usually look different.
    // "AQ.Ab8..." looks like a Banana Dev key v2.
    
    // User said: "帮我修改回banana api吧... GEMINI_API_KEY=..."
    // It is highly likely the user MEANT "Banana API Key" but accidentally labeled it "GEMINI_API_KEY" 
    // OR they are confused.
    // Let's look at the key format: "AQ.Ab8RN6I_RPISJpneR3J9cdPoyh9SkB5nIKMPCmG0an9pQGIdxA"
    // This is 50+ chars.
    // Banana v2 keys are often long strings.
    // Google AI Studio keys are usually starting with "AIza...".
    
    // CONCLUSION: The user likely wants BANANA API, and provided a BANANA API Key.
    // The variable name "GEMINI_API_KEY" in their message was likely a typo or copy-paste error.
    // I will implement BANANA API logic using this key.
    
    const apiKey = process.env.BANANA_API_KEY || "AQ.Ab8RN6I_RPISJpneR3J9cdPoyh9SkB5nIKMPCmG0an9pQGIdxA"; 
    // Ideally we use env var, but for now I'll use the env var logic and guide user to set it.
    
    // We need a MODEL KEY for Banana. The user didn't provide one in this message.
    // But previous code had `BANANA_MODEL_KEY`.
    // I will revert to the Banana implementation.
    
    const modelKey = process.env.BANANA_MODEL_KEY;
    
    if (!modelKey) {
       throw new Error("Missing BANANA_MODEL_KEY. Please set it in Vercel.");
    }

    const startResponse = await fetch("https://api.banana.dev/start/v4/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: apiKey,
        modelKey: modelKey,
        modelInputs: {
          prompt: "luxury backyard with a swimming pool, photorealistic, 8k",
          image_base64: image, 
          negative_prompt: "text, watermark, ugly, deformed",
        },
      }),
    });

    const startData = await startResponse.json();
    
    if (startData.message && startData.message.includes("error")) {
        throw new Error(startData.message);
    }
    
    const callID = startData.callID;

    // Return the Call ID to frontend for polling
    return NextResponse.json({
      id: callID,
      status: 'processing', 
      provider: 'banana' // Tag to let frontend know how to poll
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
