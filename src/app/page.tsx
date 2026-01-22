'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ImageUpload } from '@/components/ImageUpload';
import { ComparisonView } from '@/components/ComparisonView';
import { getDictionary, defaultLocale } from '@/lib/i18n';
import { Loader2, AlertCircle } from 'lucide-react';

function DesignPoolApp() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || defaultLocale;
  const dict = getDictionary(lang);

  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');

  const handleImageSelect = async (file: File) => {
    try {
      setStatus('uploading');
      setErrorMsg('');

      // Resize image if too large (client-side) to avoid Vercel 4.5MB payload limit
      const resizedBase64 = await resizeImage(file);
      setOriginalImage(resizedBase64);
        
      // Start generation
      await generateDesign(resizedBase64);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMsg((error as Error).message || dict.error);
    }
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 1024px is usually enough for ControlNet and keeps size low
          const MAX_DIM = 1024;
          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Use JPEG with 0.8 quality to reduce size
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const generateDesign = async (base64Image: string) => {
    try {
      setStatus('processing');
      
      // 1. Start prediction
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start generation');
      }

      const predictionId = data.id;
      
      // 2. Poll for result
      await pollPrediction(predictionId);

    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMsg((error as Error).message || dict.error);
    }
  };

  const pollPrediction = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max polling

    while (attempts < maxAttempts) {
      const response = await fetch(`/api/poll?id=${id}`);
      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(data.error || 'Polling failed');
      }

      if (data.status === 'succeeded') {
        // Replicate output is usually an array [edge_map, generated_image] or just image
        const result = Array.isArray(data.output) ? data.output[1] || data.output[0] : data.output;
        setGeneratedImage(result);
        setStatus('completed');
        return;
      } else if (data.status === 'failed' || data.status === 'canceled') {
        throw new Error(data.error || 'Generation failed');
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Generation timed out');
  };

  const handleReset = () => {
    setStatus('idle');
    setOriginalImage('');
    setGeneratedImage('');
    setErrorMsg('');
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            {dict.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {dict.subtitle}
          </p>
        </header>

        <div className="flex flex-col items-center justify-center min-h-[400px]">
          {status === 'idle' && (
            <ImageUpload onImageSelect={handleImageSelect} dict={dict} />
          )}

          {(status === 'uploading' || status === 'processing') && (
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 animate-pulse">
                {status === 'uploading' ? 'Uploading...' : dict.processing}
              </h3>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center max-w-md">
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center justify-center gap-3">
                <AlertCircle className="w-6 h-6" />
                <p>{errorMsg}</p>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {dict.tryAgain}
              </button>
            </div>
          )}

          {status === 'completed' && (
            <ComparisonView
              beforeImage={originalImage}
              afterImage={generatedImage}
              onReset={handleReset}
              dict={dict}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}>
      <DesignPoolApp />
    </Suspense>
  );
}
