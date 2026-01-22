'use client';

import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Translation } from '@/lib/i18n';

interface ComparisonViewProps {
  beforeImage: string;
  afterImage: string;
  onReset: () => void;
  dict: Translation;
}

export function ComparisonView({ beforeImage, afterImage, onReset, dict }: ComparisonViewProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(afterImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ai-pool-design.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed', error);
      window.open(afterImage, '_blank');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Before Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">{dict.before}</span>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
            <img 
              src={beforeImage} 
              alt="Original" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* After Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-blue-600">{dict.after}</span>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border-2 border-blue-500 shadow-md">
            <img 
              src={afterImage} 
              alt="AI Generated" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          {dict.tryAgain}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200"
        >
          <Download className="w-5 h-5" />
          {dict.downloadBtn}
        </button>
      </div>
    </div>
  );
}
