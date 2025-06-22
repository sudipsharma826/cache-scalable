"use client";

import { useRef } from 'react';
import { ArrowRight, Github, BarChart2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FetchingForm from '@/components/FetchingForm';
import { RedisPanel } from '@/components/RedisPanel';

export default function Home() {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Performance Optimized
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Cache Scalable Performance Analysis
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Get a comprehensive overview of performance scaling with caching and analytics.
              Optimize your application's speed and efficiency with real-time insights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Button 
                size="lg" 
                className="group"
                onClick={scrollToFeatures}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="gap-2"
                asChild
              >
                <a 
                  href="https://github.com/sudipsharma826/cache-scalable" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">

          <div className="space-y-8">
            <FetchingForm />
            <RedisPanel />
          </div>
        </div>
      </section>
    </div>
  );
}