'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 rounded-full bg-red-500/10 p-4 ring-1 ring-red-500/20">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="mb-2 font-mono text-2xl font-bold text-white">System Failure</h2>
      <p className="mb-8 max-w-md text-slate-400">
        A critical error has occurred in the neural pathways. 
        Diagnostics have been logged.
      </p>
      <Button onClick={reset} variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
        Initiate Reboot
      </Button>
    </div>
  );
}
