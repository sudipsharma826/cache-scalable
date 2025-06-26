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
    <div className="min-h-screen bg-background dark:bg-gray-950 text-foreground dark:text-gray-100 transition-colors">
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-medium mb-6 transition-colors">
              <Zap className="w-4 h-4 mr-2" />
              Performance Optimized
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">
              Cache Scalable Performance Analysis
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto transition-colors">
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
      <section ref={featuresRef} className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm p-6 transition-colors">
              <FetchingForm />
            </div>
            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm p-6 transition-colors">
              <RedisPanel />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}