'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Activity, Cpu, Wifi } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";

export function InsighterPreview() {
  return (
    <section className="py-24 relative overflow-hidden bg-navy-950">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <ScrollReveal
            variant="slide-left"
            duration={0.6}
          >
            <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-6">
              <Activity className="mr-2 h-3 w-3" />
              System Status: Optimal
            </div>
            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl font-mono mb-6">
              Insighter <span className="text-cyan-500">Preview</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Real-time operational intelligence dashboard. Monitor system metrics, 
              deployment status, and team velocity from a single command node.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button variant="cyber" size="lg" className="rounded-full">
                  Access Dashboard
                  <Cpu className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" className="text-slate-400 hover:text-white rounded-full">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal
            variant="scale"
            delay={0.2}
            duration={0.6}
            className="relative"
          >
            {/* Mock Dashboard Interface */}
            <div className="rounded-xl border border-slate-800 bg-navy-900/80 backdrop-blur-md p-2 shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 mb-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/50" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
                </div>
                <div className="ml-4 h-4 w-48 rounded-full bg-slate-800/50" />
              </div>
              <div className="p-4 grid gap-4 grid-cols-2">
                 <Card className="col-span-2 bg-navy-950/50 border-slate-800 p-4">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-xs font-mono text-slate-500">Traffic Analysis</span>
                       <Wifi className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="h-24 flex items-end gap-1">
                       {[40, 65, 30, 80, 55, 90, 45, 70, 60, 85].map((h, i) => (
                          <div key={i} className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors rounded-t-sm" style={{ height: `${h}%` }} />
                       ))}
                    </div>
                 </Card>
                 <Card className="bg-navy-950/50 border-slate-800 p-4">
                    <div className="text-2xl font-mono text-white mb-1">98.4%</div>
                    <div className="text-xs text-slate-500">Uptime</div>
                 </Card>
                 <Card className="bg-navy-950/50 border-slate-800 p-4">
                    <div className="text-2xl font-mono text-white mb-1">142ms</div>
                    <div className="text-xs text-slate-500">Latency</div>
                 </Card>
              </div>
            </div>
            
            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-cyan-500/20 blur-3xl rounded-full z-[-1] opacity-50" />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
