import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Shield, Zap } from "lucide-react";

export function VisionCard() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="border-slate-800 bg-navy-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Eye className="h-5 w-5 text-cyan-500" />
            VISIBILITY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            We believe in absolute transparency. Every line of code, every architectural decision, 
            is made with clear intent and visible outcomes.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-navy-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-cyan-500" />
            INTEGRITY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            Security is not an afterthought; it is the foundation. We build systems that are 
            resilient by design, protecting data as a sacred asset.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-navy-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-cyan-500" />
            VELOCITY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            Speed is a feature. We optimize for high-performance execution, ensuring that 
            digital experiences are fluid, responsive, and immediate.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
