import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const provider = searchParams.get('provider'); // 'replicate' or 'banana'

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  // --- Banana Polling ---
  if (provider === 'banana') {
    const apiKey = process.env.BANANA_API_KEY || "AQ.Ab8RN6I_RPISJpneR3J9cdPoyh9SkB5nIKMPCmG0an9pQGIdxA";
    
    try {
      const checkResponse = await fetch("https://api.banana.dev/check/v4/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey,
          callID: id,
        }),
      });

      const checkData = await checkResponse.json();

      if (checkData.message && checkData.message.toLowerCase().includes("error")) {
         return NextResponse.json({ error: checkData.message }, { status: 500 });
      }

      if (checkData.status === "Success") {
        return NextResponse.json({
          status: 'succeeded',
          output: checkData.modelOutputs[0].image_base64
        });
      } else if (checkData.status === "Failed") {
        return NextResponse.json({ error: "Model inference failed on Banana" }, { status: 500 });
      } else {
        // Running or Queued
         return NextResponse.json({ status: 'processing' });
      }
    } catch (error) {
       return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  }

  // --- Replicate Polling (Fallback) ---
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    const prediction = await replicate.predictions.get(id);

    if (prediction.error) {
      return NextResponse.json({ error: prediction.error }, { status: 500 });
    }

    return NextResponse.json(prediction);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
