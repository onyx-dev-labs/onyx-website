import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 rounded-full bg-cyan-500/10 p-4 ring-1 ring-cyan-500/20">
        <FileQuestion className="h-10 w-10 text-cyan-500" />
      </div>
      <h2 className="mb-2 font-mono text-2xl font-bold text-white">404 Void Sector</h2>
      <p className="mb-8 max-w-md text-slate-400">
        The requested coordinates do not map to any known sector in the Onyx system.
      </p>
      <Button asChild variant="cyber">
        <Link href="/">Return to Base</Link>
      </Button>
    </div>
  );
}
