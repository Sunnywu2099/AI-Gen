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

      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setOriginalImage(base64String);
        
        // Start generation
        await generateDesign(base64String);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMsg(dict.error);
    }
  };

  const generateDesign = async (base64Image: string) => {
    try {
      setStatus('processing');
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedImage(data.result);
      setStatus('completed');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMsg(dict.error);
    }
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
                {dict.processing}
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
