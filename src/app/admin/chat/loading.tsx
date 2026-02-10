import { Loader2 } from "lucide-react";

export default function ChatLoading() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-slate-800 mb-2" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-slate-800/50" />
      </div>

      <div className="flex h-[calc(100vh-120px)] w-full overflow-hidden rounded-xl border border-slate-800 bg-navy-950 shadow-2xl">
        {/* Sidebar Skeleton */}
        <div className="w-full md:w-[350px] border-r border-slate-800 bg-navy-900/50 p-4 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-800/50" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area Skeleton */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-4" />
          <p>Initializing secure connection...</p>
        </div>
      </div>
    </div>
  );
}
