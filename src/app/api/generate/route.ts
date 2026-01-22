import { NextResponse } from 'next/server';

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
      // Using a reliable Unsplash source for "luxury pool"
      const mockResultImage = "https://images.unsplash.com/photo-1572331165267-854da2b00ca1?q=80&w=2070&auto=format&fit=crop";

      return NextResponse.json({
        result: mockResultImage,
        status: 'completed'
      });
    }

    // --- REAL IMPLEMENTATION (Banana API) ---
    // 1. Call Banana to start the task
    const apiKey = process.env.BANANA_API_KEY;
    const modelKey = process.env.BANANA_MODEL_KEY;

    if (!apiKey || !modelKey) {
      throw new Error("Missing Banana API configuration");
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
          image_base64: image, // Assuming model expects this
          negative_prompt: "text, watermark, ugly, deformed",
        },
      }),
    });

    const startData = await startResponse.json();
    const callID = startData.callID;

    // 2. Poll for results (Simple polling implementation)
    // In a real app, you might want to return the callID to the client and let the client poll
    // to avoid serverless timeout limits. But for simplicity here, we poll.
    
    let attempts = 0;
    while (attempts < 30) { // Max 30 attempts (approx 30-60s)
      const checkResponse = await fetch("https://api.banana.dev/check/v4/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey,
          callID: callID,
        }),
      });
      
      const checkData = await checkResponse.json();
      
      if (checkData.status === "Success") {
        return NextResponse.json({
          result: checkData.modelOutputs[0].image_base64, // Adjust based on model output format
          status: 'completed'
        });
      } else if (checkData.status === "Failed") {
         throw new Error("Model inference failed");
      }
      
      // Wait 1s before next poll
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }

    return NextResponse.json(
      { error: 'Timeout waiting for model' },
      { status: 504 }
    );

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
