import { NextResponse } from 'next/server';
import Replicate from 'replicate';

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

    // --- REAL IMPLEMENTATION (Replicate API) ---
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("Missing Replicate API configuration");
    }

    // Using ControlNet for structural consistency (preserving the yard layout)
    // Model: jagilley/controlnet-hough
    const output = await replicate.run(
      "jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
      {
        input: {
          image: image,
          prompt: "luxury backyard with a modern swimming pool, blue water, sunny day, photorealistic, 8k, high quality",
          eta: 0,
          scale: 9,
          a_prompt: "best quality, extremely detailed",
          n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
          ddim_steps: 20,
          num_samples: "1",
          image_resolution: "512",
          detect_resolution: "512",
          value_threshold: "0.1",
          distance_threshold: "0.1"
        }
      }
    );

    // Replicate returns an array of image URLs
    const resultImage = (output as string[])[1]; // Index 1 usually contains the generated image (Index 0 might be the edge map)

    return NextResponse.json({
      result: resultImage,
      status: 'completed'
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
