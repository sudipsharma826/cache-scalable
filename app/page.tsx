"use client";
import { ArrowRight, Check, Github, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRef } from 'react';
import FetchingForm from '@/components/FetchingForm';

export default function Home() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const scrollToTarget = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Cache Scable Performace
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {' '}Analytics
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get a overview of the performace scable with caching and analytics.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={scrollToTarget} size="lg" className="text-lg px-8 py-3 group">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              <Star className=" text-yellow-400 mr-2 h-5 w-5" /> <span><Github /></span>
            </Button>
          </div>
        </div>
      </section>
      <section ref={targetRef} className="py-20 md:py-28">
        <FetchingForm />
        </section>
    </div>
  );
}