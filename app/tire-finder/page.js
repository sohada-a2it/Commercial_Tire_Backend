// app/tire-finder/page.jsx
'use client';

import TireFinder from '@/components/tireFinder/page';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TireFinderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Tire Finder Tool</h1>
          <p className="text-gray-300 mt-2">Find the perfect commercial tire for your specific needs</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <TireFinder />
      </div>
    </div>
  );
}