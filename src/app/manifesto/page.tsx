import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Background } from "@/components/layout/background";
import { VisionCard } from "@/components/manifesto/vision-card";
import { GoalsTimeline } from "@/components/manifesto/goals-timeline";

export default function ManifestoPage() {
  return (
    <main className="min-h-screen relative flex flex-col">
      <Background />
      <Navbar />
      <div className="flex-1 container mx-auto px-4 md:px-6 py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
              Protocol v1.0
            </div>
            <h1 className="font-mono text-4xl font-bold tracking-tighter text-white sm:text-5xl">
              The Onyx Manifesto
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Our prime directive: to engineer high-fidelity digital experiences that bridge the gap between human intent and machine execution.
            </p>
          </div>

          <VisionCard />
          <GoalsTimeline />
        </div>
      </div>
      <Footer />
    </main>
  );
}
