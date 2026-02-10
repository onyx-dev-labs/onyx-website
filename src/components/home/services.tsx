'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Shield, Brain, Globe, Database, Lock } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const services = [
  {
    title: "Web Architecture",
    description: "Scalable, high-performance web applications built on Next.js and React Server Components.",
    icon: Globe,
    tech: ["Next.js 16", "React 19", "Edge Runtime"],
  },
  {
    title: "Data Intelligence",
    description: "Advanced analytics and data visualization pipelines powered by PostgreSQL and AI integration.",
    icon: Database,
    tech: ["Supabase", "PostgreSQL", "Vector Embeddings"],
  },
  {
    title: "Cyber Security",
    description: "Security-first development with robust authentication, RLS policies, and encrypted communication.",
    icon: Shield,
    tech: ["RLS", "Auth v2", "Encryption"],
  },
];

export function Services() {
  return (
    <section id="services" className="py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="mb-12 text-center">
          <Badge variant="cyber" className="mb-4">Core Capabilities</Badge>
          <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl font-mono">
            System Services
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Deploying mission-critical digital infrastructure for the modern web.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service, index) => (
            <ScrollReveal
              key={service.title}
              variant="slide-up"
              delay={index * 0.1}
              duration={0.5}
            >
              <Card className="h-full border-slate-800 bg-navy-900/40 hover:border-cyan-500/30 transition-colors group">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 group-hover:bg-cyan-500/20 transition-colors">
                    <service.icon className="h-6 w-6 text-cyan-500" />
                  </div>
                  <CardTitle className="text-xl text-white">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6 text-sm text-slate-400">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.tech.map((t) => (
                      <Badge key={t} variant="secondary" className="bg-slate-800/50 text-slate-300 text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
