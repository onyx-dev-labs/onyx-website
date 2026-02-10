'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
}

export function Hero({ 
  title, 
  subtitle, 
  ctaPrimary = "Start Project", 
  ctaSecondary = "View Manifesto" 
}: HeroProps) {
  return (
    <section className="relative flex min-h-[90vh] flex-col justify-center items-center overflow-hidden pt-16 text-center">
      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center">
        <ScrollReveal
          variant="slide-up"
          duration={0.5}
          className="max-w-4xl flex flex-col items-center"
        >
          <div className="mb-6 inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 backdrop-blur-sm">
            <span className="mr-2 flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
            </span>
            System Online
          </div>
          
          <h1 className="mb-6 font-mono text-4xl font-black tracking-tighter text-white sm:text-6xl md:text-7xl lg:text-8xl">
            {title ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                {title}
              </span>
            ) : (
              <>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                  Forge Insight,
                </span>
                <br />
                Architect The Future!
              </>
            )}
          </h1>
          
          <p className="mb-8 max-w-xl text-lg text-slate-400 sm:text-xl">
            {subtitle || "High-fidelity digital agency platform. We architect digital solutions with precision, data-density, and cyber-minimalist aesthetics."}
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/contact">
              <Button size="lg" variant="cyber" className="h-14 px-8 text-base rounded-full">
                {ctaPrimary}
                <Terminal className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/manifesto">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-slate-700 hover:bg-slate-800 rounded-full">
                {ctaSecondary}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
      
      {/* Abstract Tech Decorations */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-20 pointer-events-none">
         <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="300" cy="300" r="299.5" stroke="#06B6D4" strokeOpacity="0.5"/>
            <circle cx="300" cy="300" r="249.5" stroke="#06B6D4" strokeOpacity="0.3"/>
            <circle cx="300" cy="300" r="199.5" stroke="#06B6D4" strokeOpacity="0.2"/>
            <path d="M300 0V600" stroke="#06B6D4" strokeOpacity="0.2"/>
            <path d="M0 300H600" stroke="#06B6D4" strokeOpacity="0.2"/>
         </svg>
      </div>
    </section>
  );
}
