import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Server, Database, Shield } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
          Command Tower
        </h1>
        <p className="text-slate-400">System overview and operational status.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-cyan-500/30 bg-cyan-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-500">
              System Status
            </CardTitle>
            <Activity className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">OPTIMAL</div>
            <p className="text-xs text-cyan-500/70">All systems operational</p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-800 bg-navy-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Server Load
            </CardTitle>
            <Server className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12%</div>
            <p className="text-xs text-slate-500">+2% from last hour</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-navy-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Database
            </CardTitle>
            <Database className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">CONNECTED</div>
            <p className="text-xs text-slate-500">Latency: 24ms</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-navy-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Security
            </CardTitle>
            <Shield className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">SECURE</div>
            <p className="text-xs text-slate-500">No active threats</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-slate-800 bg-navy-900/50">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium text-white leading-none">
                      Project "Onyx Alpha" updated
                    </p>
                    <p className="text-sm text-slate-400">
                      Just now
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-emerald-500 text-xs">
                    SUCCESS
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-slate-800 bg-navy-900/50">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* We will add buttons here later */}
             <div className="rounded-md border border-slate-800 bg-navy-950 p-3 text-sm text-slate-400">
                Deploy New Project
             </div>
             <div className="rounded-md border border-slate-800 bg-navy-950 p-3 text-sm text-slate-400">
                Manage Team Access
             </div>
             <div className="rounded-md border border-slate-800 bg-navy-950 p-3 text-sm text-slate-400">
                View System Logs
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
